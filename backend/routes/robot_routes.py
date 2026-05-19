from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from models import CommandLog, get_db
from auth import get_current_user, require_commander
from robot_client import RobotClient
from datetime import datetime

router = APIRouter(prefix="/robot", tags=["robot"])


class MoveCommand(BaseModel):
    x: int
    y: int


def log_command(db: Session, username: str, command_type: str, payload: str, result: str):
    entry = CommandLog(
        timestamp=datetime.utcnow(),
        username=username,
        command_type=command_type,
        payload=payload,
        result=result,
    )
    db.add(entry)
    db.commit()


@router.get("/status")
async def get_status(current_user=Depends(get_current_user)):
    return await RobotClient.get_instance().get_status()


@router.get("/map")
async def get_map(current_user=Depends(get_current_user)):
    return await RobotClient.get_instance().get_map()


@router.get("/sensor")
async def get_sensor(current_user=Depends(get_current_user)):
    return await RobotClient.get_instance().get_sensor()


@router.post("/move")
async def move_robot(cmd: MoveCommand, current_user=Depends(require_commander), db: Session = Depends(get_db)):
    if not (0 <= cmd.x <= 20 and 0 <= cmd.y <= 20):
        raise HTTPException(status_code=400, detail="Coordinates must be between 0 and 20")
    result = await RobotClient.get_instance().move(cmd.x, cmd.y)
    log_command(db, current_user.username, "MOVE", f"x={cmd.x},y={cmd.y}", str(result.get("status", "sent")))
    return result


@router.post("/reset")
async def reset_robot(current_user=Depends(require_commander), db: Session = Depends(get_db)):
    result = await RobotClient.get_instance().reset()
    log_command(db, current_user.username, "RESET", "", "ok")
    return result


@router.get("/logs")
async def get_logs(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    logs = db.query(CommandLog).order_by(CommandLog.timestamp.desc()).limit(100).all()
    return [
        {
            "id": l.id,
            "timestamp": l.timestamp.isoformat(),
            "username": l.username,
            "command_type": l.command_type,
            "payload": l.payload,
            "result": l.result,
        }
        for l in logs
    ]
