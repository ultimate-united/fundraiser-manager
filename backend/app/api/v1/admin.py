"""Admin-only endpoints (role = 'admin').

Event create/edit lives here, separate from the public read-only events router so
the admin gate applies to the whole sub-router and paths don't collide with the
public `/events/{slug}` route.
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.core.auth import CurrentUser, get_current_user
from app.db.helpers import single_row
from app.db.supabase import get_service_client
from app.services.event_defaults import DEFAULT_SECTIONS
from app.schemas.events import (
    EventBase,
    EventCreate,
    EventListItem,
    EventSectionOut,
    EventUpdate,
    SectionIn,
)

router = APIRouter()


def get_admin_user(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
    """Require the caller's profile.role to be 'admin'."""
    db = get_service_client()
    res = db.table("profiles").select("role").eq("id", user.id).limit(1).execute()
    rows = res.data or []
    if not rows or rows[0].get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


@router.get("/events", response_model=List[EventListItem])
def admin_list_events(_admin: CurrentUser = Depends(get_admin_user)):
    """All events incl. drafts (service client bypasses the public-read RLS)."""
    db = get_service_client()
    res = (
        db.table("v_event_public")
        .select("*")
        .order("starts_at", desc=True)
        .execute()
    )
    return res.data or []


@router.get("/events/{event_id}", response_model=EventBase)
def admin_get_event(event_id: str, _admin: CurrentUser = Depends(get_admin_user)):
    db = get_service_client()
    res = db.table("events").select("*").eq("id", event_id).limit(1).execute()
    return single_row(res, not_found="Event not found")


@router.post("/events", response_model=EventBase, status_code=201)
def admin_create_event(payload: EventCreate, _admin: CurrentUser = Depends(get_admin_user)):
    db = get_service_client()
    data = payload.model_dump(exclude_none=True, mode="json")
    if not data.get("organizer_id"):
        org = db.table("organizers").select("id").limit(1).execute()
        data["organizer_id"] = single_row(org, not_found="No organizer configured", status_code=500)["id"]
    try:
        res = db.table("events").insert(data).execute()
    except Exception as exc:  # noqa: BLE001 — surface unique-slug etc. as 400
        raise HTTPException(status_code=400, detail=str(getattr(exc, "message", exc)))
    created = single_row(res, not_found="Failed to create event", status_code=500)

    # Seed the default content sections as an editable guideline (best-effort).
    try:
        db.table("event_sections").insert(
            [{"event_id": created["id"], **section} for section in DEFAULT_SECTIONS]
        ).execute()
    except Exception:
        pass

    return created


@router.patch("/events/{event_id}", response_model=EventBase)
def admin_update_event(
    event_id: str, payload: EventUpdate, _admin: CurrentUser = Depends(get_admin_user)
):
    changes = payload.model_dump(exclude_none=True, mode="json")
    if not changes:
        raise HTTPException(status_code=400, detail="No fields to update")
    db = get_service_client()
    try:
        res = db.table("events").update(changes).eq("id", event_id).execute()
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=str(getattr(exc, "message", exc)))
    return single_row(res, not_found="Event not found")


@router.get("/events/{event_id}/sections", response_model=List[EventSectionOut])
def admin_list_sections(event_id: str, _admin: CurrentUser = Depends(get_admin_user)):
    db = get_service_client()
    res = (
        db.table("event_sections").select("*").eq("event_id", event_id).order("position").execute()
    )
    return res.data or []


@router.put("/events/{event_id}/sections", response_model=List[EventSectionOut])
def admin_replace_sections(
    event_id: str, sections: List[SectionIn], _admin: CurrentUser = Depends(get_admin_user)
):
    """Replace ALL content sections for an event (delete + reinsert)."""
    db = get_service_client()
    single_row(
        db.table("events").select("id").eq("id", event_id).limit(1).execute(),
        not_found="Event not found",
    )
    db.table("event_sections").delete().eq("event_id", event_id).execute()
    if not sections:
        return []
    rows = [
        {
            "event_id": event_id,
            "kind": s.kind,
            "title": s.title,
            "position": s.position,
            "content": s.content,
            "enabled": s.enabled,
        }
        for s in sections
    ]
    res = db.table("event_sections").insert(rows).execute()
    return res.data or []
