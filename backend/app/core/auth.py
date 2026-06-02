from dataclasses import dataclass
from typing import Optional

from fastapi import Header, HTTPException, status

from app.db.supabase import get_service_client


@dataclass
class CurrentUser:
    id: str
    email: Optional[str]
    access_token: str


def _extract_bearer(authorization: Optional[str]) -> str:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or malformed Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return authorization.split(" ", 1)[1].strip()


def get_current_user(authorization: Optional[str] = Header(default=None)) -> CurrentUser:
    """Validate the Supabase JWT and return the authenticated user.

    The frontend sends `Authorization: Bearer <supabase access_token>`.
    """
    token = _extract_bearer(authorization)
    try:
        resp = get_service_client().auth.get_user(token)
    except Exception:  # noqa: BLE001 — supabase raises various client errors
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = getattr(resp, "user", None)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return CurrentUser(id=str(user.id), email=getattr(user, "email", None), access_token=token)


def get_optional_user(
    authorization: Optional[str] = Header(default=None),
) -> Optional[CurrentUser]:
    """Like get_current_user but returns None when no/invalid token is present.
    Used by endpoints that work for both guests and members (e.g. donations)."""
    if not authorization:
        return None
    try:
        return get_current_user(authorization)
    except HTTPException:
        return None
