"""User-owned activities (events with `owner_id` = the creator).

These run under `get_current_user` (any authenticated member) — NOT the admin
gate. Every query is scoped to `owner_id == user.id`, so a member only ever sees
or edits their own activities. The 5-active quota and privilege boundaries are
enforced at the DB (triggers in 20260612000004); the checks here just surface
friendly errors.
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.core.auth import CurrentUser, get_current_user
from app.db.helpers import single_row
from app.db.supabase import get_service_client
from app.services.event_defaults import DEFAULT_SECTIONS
from app.schemas.events import (
    ActivityCreate,
    ActivityUpdate,
    EventBase,
    EventListItem,
    EventSectionOut,
    SectionIn,
)

router = APIRouter()

# review states from which an owner is allowed to (re)submit for review
_RESUBMITTABLE = {"draft", "changes_requested", "rejected"}


def _owned_event(db, event_id: str, user_id: str) -> dict:
    """Load an event by id, 404 unless it belongs to this user."""
    res = (
        db.table("events")
        .select("*")
        .eq("id", event_id)
        .eq("owner_id", user_id)
        .limit(1)
        .execute()
    )
    return single_row(res, not_found="Activity not found")


@router.get("/", response_model=List[EventListItem])
def list_my_activities(user: CurrentUser = Depends(get_current_user)):
    """Every activity the current user owns, any status (reads v_event_public
    for computed totals)."""
    db = get_service_client()
    res = (
        db.table("v_event_public")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", desc=True)
        .execute()
    )
    return res.data or []


@router.post("/", response_model=EventBase, status_code=201)
def create_my_activity(payload: ActivityCreate, user: CurrentUser = Depends(get_current_user)):
    """Create a draft activity owned by the current user. Quota (max 5 active) is
    enforced by the DB trigger; we translate it into a 403."""
    db = get_service_client()

    org = db.table("organizers").select("id").eq("slug", "community").limit(1).execute()
    organizer_id = single_row(org, not_found="Community organizer missing", status_code=500)["id"]

    data = payload.model_dump(exclude_none=True, mode="json")
    data.update(
        owner_id=user.id,
        organizer_id=organizer_id,
        status="draft",
        review_status="draft",
    )
    try:
        res = db.table("events").insert(data).execute()
    except Exception as exc:  # noqa: BLE001
        msg = str(getattr(exc, "message", exc))
        if "Activity limit reached" in msg:
            raise HTTPException(status_code=403, detail="You can have at most 5 active activities.")
        if any(w in msg.lower() for w in ("duplicate", "unique")):
            raise HTTPException(status_code=400, detail="That slug is already taken — pick another.")
        raise HTTPException(status_code=400, detail=msg)
    created = single_row(res, not_found="Failed to create activity", status_code=500)

    # Seed the default content sections as an editable starting point (best-effort).
    try:
        db.table("event_sections").insert(
            [{"event_id": created["id"], **section} for section in DEFAULT_SECTIONS]
        ).execute()
    except Exception:
        pass

    return created


@router.get("/{event_id}", response_model=EventBase)
def get_my_activity(event_id: str, user: CurrentUser = Depends(get_current_user)):
    return _owned_event(get_service_client(), event_id, user.id)


@router.patch("/{event_id}", response_model=EventBase)
def update_my_activity(
    event_id: str, payload: ActivityUpdate, user: CurrentUser = Depends(get_current_user)
):
    db = get_service_client()
    event = _owned_event(db, event_id, user.id)  # 404 if not the owner's
    changes = payload.model_dump(exclude_none=True, mode="json")
    if not changes:
        raise HTTPException(status_code=400, detail="No fields to update")
    # Editing a live (approved) activity sends it back for re-review — content must
    # not change publicly without an admin re-approving (prevents bait-and-switch).
    if event["review_status"] == "approved":
        changes["review_status"] = "pending"
    try:
        res = db.table("events").update(changes).eq("id", event_id).eq("owner_id", user.id).execute()
    except Exception as exc:  # noqa: BLE001
        msg = str(getattr(exc, "message", exc))
        if any(w in msg.lower() for w in ("duplicate", "unique")):
            raise HTTPException(status_code=400, detail="That slug is already taken — pick another.")
        raise HTTPException(status_code=400, detail=msg)
    return single_row(res, not_found="Activity not found")


@router.post("/{event_id}/submit", response_model=EventBase)
def submit_for_review(event_id: str, user: CurrentUser = Depends(get_current_user)):
    """Owner submits a draft (or a returned/rejected) activity for admin review.
    Flips status to 'upcoming' so it goes public once approved; visibility stays
    gated on review_status until then."""
    db = get_service_client()
    event = _owned_event(db, event_id, user.id)
    if event["review_status"] not in _RESUBMITTABLE:
        raise HTTPException(status_code=409, detail="This activity is already submitted or approved.")
    res = (
        db.table("events")
        .update({"review_status": "pending", "status": "upcoming", "review_note": None})
        .eq("id", event_id)
        .eq("owner_id", user.id)
        .execute()
    )
    return single_row(res, not_found="Activity not found")


@router.get("/{event_id}/sections", response_model=List[EventSectionOut])
def list_my_sections(event_id: str, user: CurrentUser = Depends(get_current_user)):
    db = get_service_client()
    _owned_event(db, event_id, user.id)
    res = (
        db.table("event_sections").select("*").eq("event_id", event_id).order("position").execute()
    )
    return res.data or []


@router.put("/{event_id}/sections", response_model=List[EventSectionOut])
def replace_my_sections(
    event_id: str, sections: List[SectionIn], user: CurrentUser = Depends(get_current_user)
):
    """Replace ALL content sections for an owned activity (delete + reinsert)."""
    db = get_service_client()
    event = _owned_event(db, event_id, user.id)
    # Sections are public content too — re-review a live activity after a change.
    if event["review_status"] == "approved":
        db.table("events").update({"review_status": "pending"}).eq("id", event_id).execute()
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
