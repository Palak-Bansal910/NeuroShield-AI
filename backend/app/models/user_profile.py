from datetime import datetime

from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    message: str
    session_id: str
    username: str
    failed_attempts: int


class FailedLoginResponse(BaseModel):
    detail: str
    failed_attempts: int


class UserProfile(BaseModel):
    username: str
    full_name: str
    failed_attempts: int = 0


class SessionInfo(BaseModel):
    session_id: str
    username: str
    created_at: datetime
    failed_attempts_at_login: int
