from typing import Any

from app.services.risk_scoring import calculate_risk_for_session


def get_alerts_for_session(session_id: str) -> dict[str, Any] | None:
    risk = calculate_risk_for_session(session_id)
    if risk is None:
        return None

    risk_level = risk["risk_level"]
    if risk_level == "HIGH":
        actions = [
            "trigger secondary verification",
            "temporarily block transaction",
            "notify fraud monitoring team",
        ]
    elif risk_level == "MEDIUM":
        actions = ["request OTP or biometric verification"]
    else:
        actions = ["allow session"]

    return {
        "session_id": session_id,
        "risk_level": risk_level,
        "trust_index": risk["trust_index"],
        "actions": actions,
    }
