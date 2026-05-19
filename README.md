# Robot Management System — CMP9134

A web-based Ground Control Station for the Virtual Robot Simulation.

## Stack
- **Backend**: FastAPI (Python), SQLite, SQLAlchemy
- **Frontend**: React (Vite)
- **Containerisation**: Docker + docker-compose

## Quick start

```bash
docker-compose up --build
```

Then open http://localhost:3000

## Architecture
- The backend connects to the robot API (port 5000) and bridges its WebSocket telemetry feed to the frontend
- The frontend subscribes to live telemetry and sends move commands via the backend
- All commands are logged to SQLite for auditing
- Users have a `viewer` (read-only) or `commander` (can move robot) role

## Design patterns used
- **Singleton** — `RobotClient` (one shared HTTP client)
- **Observer** — WebSocket bridge re-broadcasts telemetry to all connected frontends
- **Factory** — `CommandLog` entries created uniformly via `log_command()`

## Running tests

```bash
cd backend
pip install -r requirements.txt
pytest tests/ -v
```
