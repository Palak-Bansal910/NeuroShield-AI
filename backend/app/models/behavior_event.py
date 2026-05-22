from datetime import datetime

from pydantic import BaseModel, Field


class BehaviorEventCreate(BaseModel):
    session_id: str
    key_press_timings: list[float] = Field(default_factory=list)
    typing_speed: float = 0
    mouse_movement_count: int = 0
    click_count: int = 0
    idle_time: float = 0
    hesitation_time: float = 0
    device_type: str = "unknown"
    location_flag: str = "NORMAL"


class BehaviorEventResponse(BehaviorEventCreate):
    event_id: str
    created_at: datetime


class SessionBehaviorResponse(BaseModel):
    session_id: str
    event_count: int
    events: list[BehaviorEventResponse]
