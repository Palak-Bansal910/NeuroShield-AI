from fastapi import APIRouter, HTTPException, status

from app.database.db import add_behavior_event, get_session_events
from app.models.behavior_event import (
    BehaviorEventCreate,
    BehaviorEventResponse,
    SessionBehaviorResponse,
)


router = APIRouter(prefix="/behavior", tags=["Behavior"])


@router.post("/event", response_model=BehaviorEventResponse)
def collect_behavior_event(payload: BehaviorEventCreate) -> BehaviorEventResponse:
    stored_event = add_behavior_event(payload.session_id, payload.dict())
    if stored_event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )
    return BehaviorEventResponse(**stored_event)


@router.get("/session/{session_id}", response_model=SessionBehaviorResponse)
def get_behavior_session(session_id: str) -> SessionBehaviorResponse:
    events = get_session_events(session_id)
    if events is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    return SessionBehaviorResponse(
        session_id=session_id,
        event_count=len(events),
        events=[BehaviorEventResponse(**event) for event in events],
    )
