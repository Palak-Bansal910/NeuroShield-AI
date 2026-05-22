from typing import Any

from app.database.db import get_session_events, sessions
from app.utils.feature_extractor import extract_features


def calculate_risk_for_session(session_id: str) -> dict[str, Any] | None:
    session = sessions.get(session_id)
    events = get_session_events(session_id)
    if session is None or events is None:
        return None

    failed_attempts = int(session.get("failed_attempts_at_login", 0))
    features = extract_features(events, failed_attempts=failed_attempts)
    return score_features(session_id, features)


def score_features(session_id: str, features: dict[str, Any]) -> dict[str, Any]:
    """Rule-based Dynamic Trust Index. Start safe, subtract risk signals."""

    trust_index = 100
    reasons: list[str] = []

    failed_attempts = float(features["failed_attempt_score"])
    if failed_attempts >= 3:
        trust_index -= 30
        reasons.append("Multiple failed login attempts before session start")
    elif failed_attempts > 0:
        trust_index -= int(failed_attempts * 8)
        reasons.append("Some failed login attempts were recorded")

    idle_score = float(features["idle_score"])
    if idle_score > 120:
        trust_index -= 20
        reasons.append("Very high idle time detected")
    elif idle_score > 60:
        trust_index -= 10
        reasons.append("Session idle time is higher than usual")

    hesitation_score = float(features["hesitation_score"])
    if hesitation_score > 25:
        trust_index -= 20
        reasons.append("Long transaction hesitation detected")
    elif hesitation_score > 10:
        trust_index -= 10
        reasons.append("Moderate transaction hesitation detected")

    mouse_activity = float(features["mouse_activity_score"])
    if mouse_activity == 0:
        trust_index -= 10
        reasons.append("No mouse or click activity recorded")
    elif mouse_activity > 500:
        trust_index -= 15
        reasons.append("Abnormally high mouse activity detected")

    avg_typing_delay = float(features["avg_typing_delay"])
    if avg_typing_delay > 1.5:
        trust_index -= 10
        reasons.append("Typing rhythm is slower than expected")

    typing_speed = float(features["typing_speed"])
    if typing_speed > 0 and typing_speed < 15:
        trust_index -= 10
        reasons.append("Typing speed is unusually low")

    if features["location_flag"] not in {"NORMAL", "TRUSTED"}:
        trust_index -= 20
        reasons.append("Location signal is unusual")

    trust_index = max(0, min(100, trust_index))

    if trust_index >= 75:
        risk_level = "LOW"
    elif trust_index >= 45:
        risk_level = "MEDIUM"
    else:
        risk_level = "HIGH"

    if not reasons:
        reasons.append("Behavior matches normal prototype thresholds")

    return {
        "session_id": session_id,
        "trust_index": trust_index,
        "risk_level": risk_level,
        "reasons": reasons,
        "features": features,
    }
