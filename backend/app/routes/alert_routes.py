from fastapi import APIRouter, HTTPException, status

from app.models.risk_log import AlertResponse
from app.services.alert_service import get_alerts_for_session


router = APIRouter(prefix="/alerts", tags=["Alerts"])


@router.get("/session/{session_id}", response_model=AlertResponse)
def get_session_alerts(session_id: str) -> AlertResponse:
    alerts = get_alerts_for_session(session_id)
    if alerts is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )
    return AlertResponse(**alerts)
