from fastapi import APIRouter, HTTPException, status

from app.database.db import create_session, users
from app.models.user_profile import FailedLoginResponse, LoginRequest, LoginResponse


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/login",
    response_model=LoginResponse,
    responses={401: {"model": FailedLoginResponse}},
)
def login(payload: LoginRequest) -> LoginResponse:
    user = users.get(payload.username)

    if user is None or user["password"] != payload.password:
        if user is not None:
            user["failed_attempts"] += 1
            failed_attempts = user["failed_attempts"]
        else:
            failed_attempts = 1

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "detail": "Invalid username or password",
                "failed_attempts": failed_attempts,
            },
        )

    session_id = create_session(payload.username)

    return LoginResponse(
        message="Login successful",
        session_id=session_id,
        username=payload.username,
        failed_attempts=user["failed_attempts"],
    )
