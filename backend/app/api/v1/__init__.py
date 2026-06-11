from fastapi import APIRouter

from . import admin, events, organizers, donations, registrations, rewards, users, webhooks

router = APIRouter()
router.include_router(admin.router, prefix="/admin", tags=["admin"])
router.include_router(events.router, prefix="/events", tags=["events"])
router.include_router(organizers.router, prefix="/organizers", tags=["organizers"])
router.include_router(registrations.router, prefix="/registrations", tags=["registrations"])
router.include_router(donations.router, prefix="/donations", tags=["donations"])
router.include_router(rewards.router, prefix="/rewards", tags=["rewards"])
router.include_router(users.router, prefix="/users", tags=["users"])
router.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])
