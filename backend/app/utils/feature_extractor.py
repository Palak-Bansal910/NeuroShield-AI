from statistics import mean
from typing import Any


def _latest_value(events: list[dict[str, Any]], field: str, default: Any) -> Any:
    for event in reversed(events):
        if field in event:
            return event[field]
    return default


def extract_features(
    events: list[dict[str, Any]], failed_attempts: int = 0
) -> dict[str, float | str]:
    """Convert raw events into compact values the risk scorer can understand."""

    all_key_delays: list[float] = []
    typing_speeds: list[float] = []
    mouse_scores: list[float] = []
    idle_times: list[float] = []
    hesitation_times: list[float] = []

    for event in events:
        all_key_delays.extend(event.get("key_press_timings", []))
        typing_speeds.append(float(event.get("typing_speed", 0)))
        mouse_count = float(event.get("mouse_movement_count", 0))
        click_count = float(event.get("click_count", 0))
        mouse_scores.append(mouse_count + (click_count * 2))
        idle_times.append(float(event.get("idle_time", 0)))
        hesitation_times.append(float(event.get("hesitation_time", 0)))

    return {
        "avg_typing_delay": round(mean(all_key_delays), 3) if all_key_delays else 0,
        "typing_speed": round(mean(typing_speeds), 2) if typing_speeds else 0,
        "mouse_activity_score": round(mean(mouse_scores), 2) if mouse_scores else 0,
        "idle_score": round(mean(idle_times), 2) if idle_times else 0,
        "hesitation_score": round(mean(hesitation_times), 2) if hesitation_times else 0,
        "failed_attempt_score": float(failed_attempts),
        "device_type": str(_latest_value(events, "device_type", "unknown")),
        "location_flag": str(_latest_value(events, "location_flag", "NORMAL")).upper(),
    }
