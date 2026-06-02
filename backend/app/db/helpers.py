"""Small shared helpers for the supabase-py + FastAPI handlers.

Centralizes the repeated "row or HTTP error", "run RPC and translate Postgres
errors", and "non-empty update payload" patterns so error messages and behavior
stay consistent across routers.
"""
from typing import Any

from fastapi import HTTPException
from pydantic import BaseModel


def single_row(res: Any, *, not_found: str, status_code: int = 404) -> dict:
    """Return the first row of a PostgREST result, or raise HTTPException.

    Used for both 404 (lookup misses) and 500 (a row we just created but could
    not reload) via the status_code argument.
    """
    rows = getattr(res, "data", None) or []
    if not rows:
        raise HTTPException(status_code=status_code, detail=not_found)
    return rows[0]


def execute_rpc(db: Any, name: str, params: dict) -> Any:
    """Execute a Postgres RPC, translating any raise inside it to HTTP 400
    (e.g. 'event is full', 'insufficient points')."""
    try:
        return db.rpc(name, params).execute()
    except Exception as exc:  # noqa: BLE001 — supabase wraps several client errors
        raise HTTPException(status_code=400, detail=str(getattr(exc, "message", exc)))


def changed_fields(payload: BaseModel) -> dict:
    """Non-None fields of a partial-update model, or raise HTTP 400 if empty."""
    changes = payload.model_dump(exclude_none=True)
    if not changes:
        raise HTTPException(status_code=400, detail="No fields to update")
    return changes
