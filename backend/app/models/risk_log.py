from pydantic import BaseModel


class ExtractedFeatures(BaseModel):
    avg_typing_delay: float
    typing_speed: float
    mouse_activity_score: float
    idle_score: float
    hesitation_score: float
    failed_attempt_score: float
    device_type: str
    location_flag: str


class RiskLog(BaseModel):
    session_id: str
    trust_index: int
    risk_level: str
    reasons: list[str]
    features: ExtractedFeatures


class AlertResponse(BaseModel):
    session_id: str
    risk_level: str
    trust_index: int
    actions: list[str]
