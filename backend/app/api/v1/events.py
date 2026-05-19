from fastapi import APIRouter

router = APIRouter()


# TODO: implement with Supabase client
@router.get("/")
def list_events():
    return []


@router.get("/{event_id}")
def get_event(event_id: str):
    return {}
