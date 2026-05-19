import asyncio
import httpx
import os

ROBOT_BASE = os.getenv("ROBOT_URL", "http://localhost:5000")


class RobotClient:
    """
    Singleton client for the Virtual Robot REST API.
    Handles retries and graceful degradation on 503 outages.
    """
    _instance = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    async def _get(self, path: str, retries: int = 5) -> dict:
        """GET with exponential backoff. Returns error dict on total failure."""
        for attempt in range(retries):
            try:
                async with httpx.AsyncClient(timeout=5.0) as client:
                    r = await client.get(f"{ROBOT_BASE}{path}")
                    if r.status_code == 503:
                        wait = 2 ** attempt
                        await asyncio.sleep(wait)
                        continue
                    r.raise_for_status()
                    return r.json()
            except (httpx.TimeoutException, httpx.ConnectError):
                if attempt < retries - 1:
                    await asyncio.sleep(2 ** attempt)
        return {"error": "unreachable", "status": "UNREACHABLE"}

    async def _post(self, path: str, payload: dict, retries: int = 5) -> dict:
        """POST with exponential backoff."""
        for attempt in range(retries):
            try:
                async with httpx.AsyncClient(timeout=5.0) as client:
                    r = await client.post(f"{ROBOT_BASE}{path}", json=payload)
                    if r.status_code == 503:
                        await asyncio.sleep(2 ** attempt)
                        continue
                    r.raise_for_status()
                    return r.json()
            except (httpx.TimeoutException, httpx.ConnectError):
                if attempt < retries - 1:
                    await asyncio.sleep(2 ** attempt)
        return {"error": "unreachable"}

    async def get_status(self) -> dict:
        return await self._get("/api/status")

    async def get_map(self) -> dict:
        return await self._get("/api/map")

    async def get_sensor(self) -> dict:
        return await self._get("/api/sensor")

    async def move(self, x: int, y: int) -> dict:
        return await self._post("/api/move", {"x": x, "y": y})

    async def reset(self) -> dict:
        return await self._post("/api/reset", {})
