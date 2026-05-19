from fastapi import APIRouter
from . import events, donations, users

router = APIRouter()
router.include_router(events.router, prefix="/events", tags=["events"])
router.include_router(donations.router, prefix="/donations", tags=["donations"])
router.include_router(users.router, prefix="/users", tags=["users"])
