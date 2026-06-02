from typing import List

from fastapi import APIRouter

from app.db.helpers import single_row
from app.db.supabase import get_service_client
from app.schemas.organizers import OrganizerOut

router = APIRouter()


@router.get("/", response_model=List[OrganizerOut])
def list_organizers():
    db = get_service_client()
    res = db.table("organizers").select("*").eq("is_verified", True).order("name").execute()
    return res.data or []


@router.get("/{slug}", response_model=OrganizerOut)
def get_organizer(slug: str):
    db = get_service_client()
    res = db.table("organizers").select("*").eq("slug", slug).limit(1).execute()
    return single_row(res, not_found="Organizer not found")
