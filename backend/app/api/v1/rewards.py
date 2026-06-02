from typing import List

from fastapi import APIRouter, Depends

from app.core.auth import CurrentUser, get_current_user
from app.db.helpers import execute_rpc, single_row
from app.db.supabase import get_service_client, get_user_client
from app.schemas.rewards import BadgeOut, RedemptionOut, RewardOut, TierOut

router = APIRouter()


@router.get("/badges", response_model=List[BadgeOut])
def list_badges():
    """Public badge catalog (not user-annotated; see /users/me/badges for that)."""
    db = get_service_client()
    res = db.table("badges").select("*").order("criteria_threshold").execute()
    return res.data or []


@router.get("/rewards", response_model=List[RewardOut])
def list_rewards():
    db = get_service_client()
    res = db.table("rewards").select("*").eq("active", True).order("points_required").execute()
    return res.data or []


@router.get("/tiers", response_model=List[TierOut])
def list_tiers():
    """Membership tiers with their benefits."""
    db = get_service_client()
    tiers = (db.table("tiers").select("*").order("sort_order").execute()).data or []
    benefits = (
        db.table("tier_benefits").select("tier_code,benefit,sort_order").order("sort_order").execute()
    ).data or []
    by_tier: dict[str, list] = {}
    for b in benefits:
        by_tier.setdefault(b["tier_code"], []).append(
            {"benefit": b["benefit"], "sort_order": b["sort_order"]}
        )
    for t in tiers:
        t["benefits"] = by_tier.get(t["code"], [])
    return tiers


@router.post("/redeem/{reward_id}", response_model=RedemptionOut, status_code=201)
def redeem_reward(reward_id: str, user: CurrentUser = Depends(get_current_user)):
    """Redeem a reward via the redeem_reward RPC (atomic points-balance check)."""
    db = get_user_client(user.access_token)
    rpc = execute_rpc(db, "redeem_reward", {"p_reward_id": reward_id})
    res = (
        get_service_client()
        .table("reward_redemptions")
        .select("*")
        .eq("id", rpc.data)
        .limit(1)
        .execute()
    )
    return single_row(res, not_found="Redemption created but could not be loaded", status_code=500)
