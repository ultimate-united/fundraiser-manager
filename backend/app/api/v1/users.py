from typing import List

from fastapi import APIRouter, Depends

from app.core.auth import CurrentUser, get_current_user
from app.db.helpers import changed_fields, single_row
from app.db.supabase import get_service_client
from app.schemas.donations import DonationOut
from app.schemas.profiles import (
    DashboardOut,
    NotificationPrefsOut,
    NotificationPrefsUpdate,
    ProfileOut,
    ProfileUpdate,
)
from app.schemas.registrations import RegistrationOut
from app.schemas.rewards import BadgeOut, RedemptionOut

router = APIRouter()


@router.get("/me", response_model=ProfileOut)
def get_me(user: CurrentUser = Depends(get_current_user)):
    db = get_service_client()
    res = db.table("profiles").select("*").eq("id", user.id).limit(1).execute()
    return single_row(res, not_found="Profile not found")


@router.patch("/me", response_model=ProfileOut)
def update_me(payload: ProfileUpdate, user: CurrentUser = Depends(get_current_user)):
    db = get_service_client()
    changes = changed_fields(payload)
    res = db.table("profiles").update(changes).eq("id", user.id).execute()
    return single_row(res, not_found="Profile not found")


@router.get("/me/dashboard", response_model=DashboardOut)
def get_dashboard(user: CurrentUser = Depends(get_current_user)):
    """Aggregated dashboard model (points, donated, attended, hours, tier).

    Email comes from the caller's JWT, not the view: v_member_dashboard no longer
    joins auth.users (which app roles can't SELECT). See migration 0003.
    """
    db = get_service_client()
    res = db.table("v_member_dashboard").select("*").eq("id", user.id).limit(1).execute()
    row = single_row(res, not_found="Profile not found")
    row["email"] = user.email
    return row


@router.get("/me/notifications", response_model=NotificationPrefsOut)
def get_notifications(user: CurrentUser = Depends(get_current_user)):
    db = get_service_client()
    res = (
        db.table("notification_preferences").select("*").eq("user_id", user.id).limit(1).execute()
    )
    rows = res.data or []
    return rows[0] if rows else NotificationPrefsOut().model_dump()


@router.patch("/me/notifications", response_model=NotificationPrefsOut)
def update_notifications(
    payload: NotificationPrefsUpdate, user: CurrentUser = Depends(get_current_user)
):
    db = get_service_client()
    changes = payload.model_dump(exclude_none=True)
    record = {"user_id": user.id, **changes}
    res = db.table("notification_preferences").upsert(record, on_conflict="user_id").execute()
    rows = res.data or []
    return rows[0] if rows else record


@router.get("/me/registrations", response_model=List[RegistrationOut])
def my_registrations(user: CurrentUser = Depends(get_current_user)):
    db = get_service_client()
    res = (
        db.table("event_registrations")
        .select("*")
        .eq("user_id", user.id)
        .order("registered_at", desc=True)
        .execute()
    )
    return res.data or []


@router.get("/me/donations", response_model=List[DonationOut])
def my_donations(user: CurrentUser = Depends(get_current_user)):
    db = get_service_client()
    res = (
        db.table("donations")
        .select("*")
        .eq("user_id", user.id)
        .is_("deleted_at", "null")
        .order("created_at", desc=True)
        .execute()
    )
    return res.data or []


@router.get("/me/badges", response_model=List[BadgeOut])
def my_badges(user: CurrentUser = Depends(get_current_user)):
    """All badges in the catalog, annotated with whether the user has earned each."""
    db = get_service_client()
    badges = (db.table("badges").select("*").order("criteria_threshold").execute()).data or []
    earned = (
        db.table("user_badges").select("badge_id,earned_at").eq("user_id", user.id).execute()
    ).data or []
    earned_map = {e["badge_id"]: e.get("earned_at") for e in earned}
    for b in badges:
        b["earned"] = b["id"] in earned_map
        b["earned_at"] = earned_map.get(b["id"])
    return badges


@router.get("/me/redemptions", response_model=List[RedemptionOut])
def my_redemptions(user: CurrentUser = Depends(get_current_user)):
    db = get_service_client()
    res = (
        db.table("reward_redemptions")
        .select("*")
        .eq("user_id", user.id)
        .order("redeemed_at", desc=True)
        .execute()
    )
    return res.data or []
