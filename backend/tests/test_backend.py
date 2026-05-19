import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi.testclient import TestClient
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
import httpx

from auth import hash_password, verify_password, create_access_token
from robot_client import RobotClient


# --- Auth unit tests ---

def test_password_hashing():
    hashed = hash_password("mysecretpassword")
    assert verify_password("mysecretpassword", hashed)
    assert not verify_password("wrongpassword", hashed)


def test_token_contains_username():
    token = create_access_token({"sub": "testuser"})
    from jose import jwt
    payload = jwt.decode(token, "changeme-in-production-use-env-var", algorithms=["HS256"])
    assert payload["sub"] == "testuser"


# --- RobotClient unit tests ---

@pytest.mark.asyncio
async def test_robot_client_singleton():
    a = RobotClient.get_instance()
    b = RobotClient.get_instance()
    assert a is b


@pytest.mark.asyncio
async def test_get_status_returns_unreachable_on_failure():
    client = RobotClient()
    with patch("robot_client.httpx.AsyncClient") as mock_http:
        mock_http.return_value.__aenter__.return_value.get = AsyncMock(
            side_effect=httpx.ConnectError("connection refused")
        )
        result = await client.get_status()
    assert result.get("status") == "UNREACHABLE" or "error" in result


@pytest.mark.asyncio
async def test_move_validates_coordinates():
    """Move route should reject out-of-range coordinates."""
    from main import app
    from models import create_tables
    create_tables()
    client = TestClient(app)
    # Register + login as commander
    client.post("/auth/register", json={"username": "cmd1", "password": "pass", "role": "commander"})
    login = client.post("/auth/login", data={"username": "cmd1", "password": "pass"})
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    # Out-of-range coordinate
    r = client.post("/robot/move", json={"x": 99, "y": 0}, headers=headers)
    assert r.status_code == 400


@pytest.mark.asyncio
async def test_viewer_cannot_move():
    from main import app
    from models import create_tables
    create_tables()
    client = TestClient(app)
    client.post("/auth/register", json={"username": "viewer1", "password": "pass", "role": "viewer"})
    login = client.post("/auth/login", data={"username": "viewer1", "password": "pass"})
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    r = client.post("/robot/move", json={"x": 1, "y": 1}, headers=headers)
    assert r.status_code == 403


# --- Integration test ---

def test_register_and_login():
    from main import app
    from models import create_tables
    create_tables()
    client = TestClient(app)
    reg = client.post("/auth/register", json={"username": "inttest", "password": "secret", "role": "viewer"})
    assert reg.status_code == 200
    login = client.post("/auth/login", data={"username": "inttest", "password": "secret"})
    assert login.status_code == 200
    assert "access_token" in login.json()
    assert login.json()["role"] == "viewer"


def test_logs_require_auth():
    from main import app
    client = TestClient(app)
    r = client.get("/robot/logs")
    assert r.status_code == 401
