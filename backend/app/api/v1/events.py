from typing import List, Optional

from fastapi import APIRouter, Query

from app.db.helpers import single_row
from app.db.supabase import get_service_client
from app.schemas.events import EventDetailOut, EventListItem

router = APIRouter()


@router.get("/", response_model=List[EventListItem])
def list_events(
    status: Optional[str] = Query(default=None, description="Filter by event status"),
    featured: Optional[bool] = Query(default=None),
    organizer_id: Optional[str] = Query(default=None),
    limit: int = Query(default=50, le=100),
    offset: int = Query(default=0, ge=0),
):
    """Public events feed (reads the v_event_public view with computed totals)."""
    db = get_service_client()
    q = db.table("v_event_public").select("*")
    if status:
        q = q.eq("status", status)
    else:
        q = q.neq("status", "draft")
    if featured is not None:
        q = q.eq("featured", featured)
    if organizer_id:
        q = q.eq("organizer_id", organizer_id)
    q = q.order("starts_at", desc=False).range(offset, offset + limit - 1)
    res = q.execute()
    return res.data or []


@router.get("/{slug}", response_model=EventDetailOut)
def get_event(slug: str):
    """Full event detail page: core fields + computed totals + dynamic sections."""
    db = get_service_client()
    res = db.table("v_event_public").select("*").eq("slug", slug).limit(1).execute()
    event = single_row(res, not_found="Event not found")

    sections_res = (
        db.table("event_sections")
        .select("id,kind,title,position,content")
        .eq("event_id", event["id"])
        .order("position")
        .execute()
    )
    event["sections"] = sections_res.data or []
    return event
