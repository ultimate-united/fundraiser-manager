from fastapi import APIRouter

router = APIRouter()


# TODO: implement with Supabase client
@router.get("/")
def list_donations():
    return []


@router.post("/")
def create_donation():
    return {}
