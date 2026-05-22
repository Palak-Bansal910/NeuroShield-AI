from fastapi import APIRouter, HTTPException, status

from app.models.risk_log import RiskLog
from app.services.risk_scoring import calculate_risk_for_session


router = APIRouter(prefix="/risk", tags=["Risk"])


@router.get("/session/{session_id}", response_model=RiskLog)
def get_session_risk(session_id: str) -> RiskLog:
    risk = calculate_risk_for_session(session_id)
    if risk is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )
    return RiskLog(**risk)
