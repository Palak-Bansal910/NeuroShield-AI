from datetime import datetime, timezone
from typing import Any
from uuid import uuid4


# Simple in-memory storage for the prototype.
# This resets whenever the backend server restarts.
users: dict[str, dict[str, Any]] = {
    "demo_user": {
        "username": "demo_user",
        "password": "password123",
        "full_name": "Demo Banking User",
        "failed_attempts": 0,
    }
}

sessions: dict[str, dict[str, Any]] = {}
behavior_events: dict[str, list[dict[str, Any]]] = {}


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def create_session(username: str) -> str:
    session_id = str(uuid4())
    sessions[session_id] = {
        "session_id": session_id,
        "username": username,
        "created_at": utc_now(),
        "failed_attempts_at_login": users[username]["failed_attempts"],
    }
    behavior_events[session_id] = []
    return session_id


def add_behavior_event(session_id: str, event: dict[str, Any]) -> dict[str, Any] | None:
    if session_id not in sessions:
        return None

    stored_event = {
        **event,
        "event_id": str(uuid4()),
        "created_at": utc_now(),
    }
    behavior_events.setdefault(session_id, []).append(stored_event)
    return stored_event


def get_session_events(session_id: str) -> list[dict[str, Any]] | None:
    if session_id not in sessions:
        return None
    return behavior_events.get(session_id, [])
