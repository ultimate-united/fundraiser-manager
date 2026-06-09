from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.auth import CurrentUser, get_current_user, get_optional_user
from app.core.config import get_settings
from app.db.helpers import changed_fields, single_row
from app.db.supabase import get_service_client, get_user_client
from app.schemas.donations import (
    CheckoutSessionOut,
    DonationCreate,
    DonationCreateResult,
    DonationOut,
    RecurringCreate,
    RecurringOut,
    RecurringUpdate,
    SupporterOut,
)
from app.services.payments import (
    create_billing_portal_session,
    create_payment_intent,
    create_subscription_checkout_session,
    stripe_enabled,
)

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


@router.get("/recent", response_model=List[SupporterOut])
def recent_supporters(
    event_id: Optional[str] = Query(default=None, description="Filter to one event"),
    limit: int = Query(default=5, le=20),
):
    """Public 'recent supporters' wall: completed donations only, anonymity-respecting,
    no PII (no email; anonymous gifts show as 'Anonymous' with no message)."""
    db = get_service_client()
    q = (
        db.table("donations")
        .select("donor_name,amount,message,is_anonymous,created_at")
        .eq("status", "completed")
        .is_("deleted_at", "null")
    )
    if event_id:
        q = q.eq("event_id", event_id)
    rows = q.order("created_at", desc=True).limit(limit).execute().data or []
    return [
        {
            "name": "Anonymous" if r.get("is_anonymous") else (r.get("donor_name") or "A supporter"),
            "amount": r.get("amount", 0),
            "message": None if r.get("is_anonymous") else r.get("message"),
            "created_at": r.get("created_at"),
        }
        for r in rows
    ]


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


@router.post("/recurring/checkout", response_model=CheckoutSessionOut)
def create_recurring_checkout(payload: RecurringCreate, user: CurrentUser = Depends(get_current_user)):
    """Start a Stripe Checkout Session (subscription mode) for a recurring donation.
    The recurring_donations row + each charge are recorded by the Stripe webhook;
    here we just hand back the URL to redirect the donor to."""
    if not stripe_enabled():
        raise HTTPException(status_code=503, detail="Stripe is not configured")

    db = get_service_client()
    customer_id = None
    try:
        prof = db.table("profiles").select("stripe_customer_id").eq("id", user.id).limit(1).execute()
        if prof.data:
            customer_id = prof.data[0].get("stripe_customer_id")
    except Exception:
        customer_id = None  # column may not exist yet (migration pending)

    base = get_settings().frontend_base_url
    url = create_subscription_checkout_session(
        amount=payload.amount,
        currency=payload.currency,
        frequency=payload.frequency,
        customer_id=customer_id,
        customer_email=user.email,
        metadata={"user_id": user.id, "event_id": payload.event_id or ""},
        success_url=f"{base}/donate/success?recurring=1",
        cancel_url=f"{base}/donate",
    )
    return {"url": url}


@router.post("/billing-portal", response_model=CheckoutSessionOut)
def open_billing_portal(user: CurrentUser = Depends(get_current_user)):
    """Open the Stripe Customer Portal so the member can manage / cancel their
    recurring donations. Requires a stored Stripe customer (set after their first
    subscription)."""
    if not stripe_enabled():
        raise HTTPException(status_code=503, detail="Stripe is not configured")

    db = get_service_client()
    customer_id = None
    try:
        prof = db.table("profiles").select("stripe_customer_id").eq("id", user.id).limit(1).execute()
        if prof.data:
            customer_id = prof.data[0].get("stripe_customer_id")
    except Exception:
        customer_id = None  # column may not exist yet (migration pending)

    if not customer_id:
        raise HTTPException(status_code=404, detail="No subscription to manage yet")

    url = create_billing_portal_session(
        customer_id=customer_id,
        return_url=f"{get_settings().frontend_base_url}/dashboard/donations",
    )
    return {"url": url}


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
