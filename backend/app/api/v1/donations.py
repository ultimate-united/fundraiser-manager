from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException

from app.core.auth import CurrentUser, get_current_user, get_optional_user
from app.db.helpers import changed_fields, single_row
from app.db.supabase import get_service_client, get_user_client
from app.schemas.donations import (
    DonationCreate,
    DonationCreateResult,
    DonationOut,
    RecurringCreate,
    RecurringOut,
    RecurringUpdate,
)
from app.services.payments import create_payment_intent

router = APIRouter()


@router.post("/", response_model=DonationCreateResult, status_code=201)
def create_donation(
    payload: DonationCreate,
    user: Optional[CurrentUser] = Depends(get_optional_user),
):
    """Record a donation. Works for both members (attaches user_id) and guests
    (donor_name/email only). Creates a 'pending' donation + a payment intent;
    the Stripe webhook will later flip it to 'completed' and award points.
    """
    if user is None and not payload.donor_email:
        raise HTTPException(status_code=400, detail="donor_email is required for guest donations")

    intent = create_payment_intent(
        payload.amount, payload.currency, metadata={"event_id": payload.event_id or "general"}
    )

    record = {
        "user_id": user.id if user else None,
        "event_id": payload.event_id,
        "amount": payload.amount,
        "currency": payload.currency,
        "status": "pending",
        "kind": "one_time",
        "donor_name": payload.donor_name,
        "donor_email": payload.donor_email,
        "message": payload.message,
        "is_anonymous": payload.is_anonymous,
        "dedicated_to": payload.dedicated_to,
        "stripe_payment_intent_id": intent.payment_intent_id,
    }
    db = get_service_client()
    res = db.table("donations").insert(record).execute()
    donation = single_row(res, not_found="Failed to record donation", status_code=500)
    return {
        "donation": donation,
        "client_secret": intent.client_secret,
        "payment_provider": intent.provider,
    }


@router.get("/", response_model=List[DonationOut])
def list_my_donations(user: CurrentUser = Depends(get_current_user)):
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


@router.post("/recurring", response_model=RecurringOut, status_code=201)
def create_recurring(payload: RecurringCreate, user: CurrentUser = Depends(get_current_user)):
    """Create a recurring donation subscription (general fund if event_id is null)."""
    record = {
        "user_id": user.id,
        "event_id": payload.event_id,
        "amount": payload.amount,
        "currency": payload.currency,
        "frequency": payload.frequency,
        "status": "active",
    }
    db = get_user_client(user.access_token)
    res = db.table("recurring_donations").insert(record).execute()
    return single_row(res, not_found="Failed to create recurring donation", status_code=500)


@router.get("/recurring", response_model=List[RecurringOut])
def list_recurring(user: CurrentUser = Depends(get_current_user)):
    db = get_service_client()
    res = (
        db.table("recurring_donations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", desc=True)
        .execute()
    )
    return res.data or []


@router.patch("/recurring/{recurring_id}", response_model=RecurringOut)
def update_recurring(
    recurring_id: str, payload: RecurringUpdate, user: CurrentUser = Depends(get_current_user)
):
    changes = changed_fields(payload)
    db = get_user_client(user.access_token)
    res = (
        db.table("recurring_donations")
        .update(changes)
        .eq("id", recurring_id)
        .eq("user_id", user.id)
        .execute()
    )
    return single_row(res, not_found="Recurring donation not found")
