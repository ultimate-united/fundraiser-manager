"""Stripe webhook receiver.

Stripe calls POST /api/v1/webhooks/stripe after payment events. We verify the
signature and handle:

  payment_intent.succeeded   -> one-time donation: mark 'completed' + award points
  checkout.session.completed -> subscription started: create recurring_donations row
  invoice.payment_succeeded  -> each recurring charge: record a donation + award points
  customer.subscription.*    -> keep recurring_donations.status in sync

Local testing:
  stripe listen --forward-to localhost:8000/api/v1/webhooks/stripe
The CLI prints a `whsec_...` secret — put it in backend/.env.local as
STRIPE_WEBHOOK_SECRET and restart the backend.
"""
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Header, HTTPException, Request
import stripe

from app.core.config import get_settings
from app.db.supabase import get_service_client
from app.services.payments import points_for_donation

router = APIRouter()

_INTERVAL_TO_FREQUENCY = {"week": "weekly", "month": "monthly", "year": "yearly"}


def _award_points(db, user_id: str, points: int, donation_id: str) -> None:
    """Best-effort ledger credit — never fails the webhook."""
    if not user_id or points <= 0:
        return
    try:
        db.rpc(
            "award_points",
            {
                "p_user": user_id,
                "p_delta": points,
                "p_reason": "Donation",
                "p_source_type": "donation",
                "p_source_id": donation_id,
            },
        ).execute()
    except Exception:
        pass


def _ts_to_iso(ts: Optional[int]) -> Optional[str]:
    if not ts:
        return None
    return datetime.fromtimestamp(ts, tz=timezone.utc).isoformat()


def _period_end(sub: dict) -> Optional[int]:
    # `current_period_end` lives on the subscription in older API versions and on
    # the subscription item in newer ones — check both.
    if sub.get("current_period_end"):
        return sub["current_period_end"]
    items = (sub.get("items") or {}).get("data") or []
    return items[0].get("current_period_end") if items else None


# --- one-time -------------------------------------------------------------
def _complete_donation(payment_intent_id: str) -> None:
    """Mark a one-time donation paid + award points. Idempotent."""
    db = get_service_client()
    res = (
        db.table("donations")
        .select("*")
        .eq("stripe_payment_intent_id", payment_intent_id)
        .limit(1)
        .execute()
    )
    rows = res.data or []
    if not rows:
        return  # no matching one-time donation (e.g. a subscription PI) — ignore
    donation = rows[0]
    if donation.get("status") == "completed":
        return
    points = points_for_donation(donation["amount"])
    db.table("donations").update({"status": "completed", "points_awarded": points}).eq(
        "id", donation["id"]
    ).execute()
    _award_points(db, donation.get("user_id"), points, donation["id"])


# --- recurring ------------------------------------------------------------
def _ensure_recurring(db, subscription_id: str) -> Optional[dict]:
    """Return the recurring_donations row for a subscription, creating it (from the
    subscription's metadata) if the webhook arrives before we've stored it."""
    found = (
        db.table("recurring_donations")
        .select("*")
        .eq("stripe_subscription_id", subscription_id)
        .limit(1)
        .execute()
    )
    if found.data:
        return found.data[0]

    sub = stripe.Subscription.retrieve(subscription_id)
    meta = sub.get("metadata") or {}
    user_id = meta.get("user_id") or None
    event_id = meta.get("event_id") or None
    if not user_id:
        return None  # recurring_donations.user_id is NOT NULL — can't record

    item = (sub.get("items") or {}).get("data", [{}])[0]
    price = item.get("price") or {}
    interval = (price.get("recurring") or {}).get("interval", "month")
    row = {
        "user_id": user_id,
        "event_id": event_id,
        "amount": price.get("unit_amount") or 0,
        "currency": (price.get("currency") or "hkd").upper()[:3],
        "frequency": _INTERVAL_TO_FREQUENCY.get(interval, "monthly"),
        "status": "active",
        "stripe_subscription_id": subscription_id,
        "next_charge_at": _ts_to_iso(_period_end(sub)),
    }
    res = db.table("recurring_donations").insert(row).execute()
    return (res.data or [None])[0]


def _on_subscription_checkout(session: dict) -> None:
    sub_id = session.get("subscription")
    if not sub_id:
        return
    db = get_service_client()
    # Store the customer id on the profile (best-effort; column may not exist yet).
    meta = session.get("metadata") or {}
    user_id = meta.get("user_id")
    customer_id = session.get("customer")
    if user_id and customer_id:
        try:
            db.table("profiles").update({"stripe_customer_id": customer_id}).eq("id", user_id).execute()
        except Exception:
            pass
    _ensure_recurring(db, sub_id)


def _on_invoice_paid(invoice: dict) -> None:
    sub_id = invoice.get("subscription")
    if not sub_id:
        return  # not a subscription invoice
    payment_intent_id = invoice.get("payment_intent")
    db = get_service_client()

    # Idempotency: one donation per invoice's payment intent.
    if payment_intent_id:
        existing = (
            db.table("donations")
            .select("id")
            .eq("stripe_payment_intent_id", payment_intent_id)
            .limit(1)
            .execute()
        )
        if existing.data:
            return

    rec = _ensure_recurring(db, sub_id)
    amount = invoice.get("amount_paid") or 0
    if amount <= 0:
        return
    points = points_for_donation(amount)
    inserted = (
        db.table("donations")
        .insert(
            {
                "user_id": rec.get("user_id") if rec else None,
                "event_id": rec.get("event_id") if rec else None,
                "recurring_donation_id": rec.get("id") if rec else None,
                "amount": amount,
                "currency": (invoice.get("currency") or "hkd").upper()[:3],
                "status": "completed",
                "kind": "recurring",
                "stripe_payment_intent_id": payment_intent_id,
                "points_awarded": points,
            }
        )
        .execute()
    )
    donation = (inserted.data or [None])[0]
    if donation and rec:
        _award_points(db, rec.get("user_id"), points, donation["id"])
        # advance the displayed next charge date
        sub = stripe.Subscription.retrieve(sub_id)
        db.table("recurring_donations").update(
            {"next_charge_at": _ts_to_iso(_period_end(sub))}
        ).eq("id", rec["id"]).execute()


def _sync_subscription_status(subscription: dict, *, deleted: bool) -> None:
    sub_id = subscription.get("id")
    if not sub_id:
        return
    if deleted:
        status = "cancelled"
    else:
        s = subscription.get("status")
        status = "cancelled" if s == "canceled" else "paused" if s == "paused" else "active"
    db = get_service_client()
    db.table("recurring_donations").update({"status": status}).eq(
        "stripe_subscription_id", sub_id
    ).execute()


@router.post("/stripe")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(default=None, alias="Stripe-Signature"),
):
    secret = get_settings().stripe_webhook_secret
    if not secret:
        raise HTTPException(status_code=503, detail="Stripe webhook secret not configured")

    payload = await request.body()
    try:
        event = stripe.Webhook.construct_event(payload, stripe_signature, secret)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid webhook signature or payload")

    etype = event["type"]
    obj = event["data"]["object"]

    if etype == "payment_intent.succeeded":
        _complete_donation(obj["id"])
    elif etype == "checkout.session.completed" and obj.get("mode") == "subscription":
        _on_subscription_checkout(obj)
    elif etype == "invoice.payment_succeeded":
        _on_invoice_paid(obj)
    elif etype in ("customer.subscription.deleted", "customer.subscription.updated"):
        _sync_subscription_status(obj, deleted=etype.endswith("deleted"))

    return {"received": True}
