from fastapi import APIRouter

router = APIRouter()


# TODO: implement with Supabase client
@router.get("/me")
def get_current_user():
    return {}
