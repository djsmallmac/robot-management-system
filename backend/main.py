import asyncio
import json
import os
import websockets
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from models import create_tables
from routes.auth_routes import router as auth_router
from routes.robot_routes import router as robot_router

app = FastAPI(title="Robot Management System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(robot_router)

#Websocket bvridge using the observer pattern
#all connected frontend clients
_frontend_clients: set[WebSocket] = set()

# Latest telemetry snapshot — new clients get it immediately on connect
_latest_telemetry: dict = {}

ROBOT_WS_URL = os.getenv("ROBOT_WS_URL", "ws://localhost:5000/ws/telemetry")


async def robot_ws_listener():
    #subscribes to the robots telemetry feed and reconnects with backoff or 503. This broadcasts all updates to the 
    #Web socket clients
    backoff = 1
    while True:
        try:
            async with websockets.connect(ROBOT_WS_URL) as ws:
                backoff = 1  #resets the backoff when connected successfully
                async for raw in ws:
                    data = json.loads(raw)
                    _latest_telemetry.update(data)
                    # Notify all observers (frontend clients)
                    dead = set()
                    for client in list(_frontend_clients):
                        try:
                            await client.send_json(data)
                        except Exception:
                            dead.add(client)
                    _frontend_clients.difference_update(dead)
        except Exception:
            #robot WS dropped wait and reconnect
            await asyncio.sleep(backoff)
            backoff = min(backoff * 2, 30)


@app.on_event("startup")
async def startup():
    create_tables()
    asyncio.create_task(robot_ws_listener())


@app.websocket("/ws/telemetry")
async def frontend_telemetry(websocket: WebSocket):
    #frontend connects here to recieve li9ve telemetry
    await websocket.accept()
    _frontend_clients.add(websocket)
    #send latest snapshot
    if _latest_telemetry:
        await websocket.send_json(_latest_telemetry)
    try:
        while True:
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        _frontend_clients.discard(websocket)


@app.get("/health")
def health():
    return {"status": "ok"}
