from pydantic import BaseModel


class Settings(BaseModel):
    """Small settings object for values the app needs at startup."""

    app_name: str = "NeuroShield AI Backend"
    app_version: str = "0.1.0"
    allowed_origins: list[str] = ["*"]


settings = Settings()
