"""Payment provider seam.

When STRIPE_SECRET_KEY is set, create_payment_intent() creates a real Stripe
PaymentIntent and returns its client_secret for the frontend Payment Element to
confirm. When the key is absent it returns a stub so the donation flow still
records a 'pending' donation end to end.

Remaining follow-up: a webhook route that verifies `payment_intent.succeeded`,
flips the donation to 'completed', and awards points (needs STRIPE_WEBHOOK_SECRET
+ Stripe CLI for local forwarding).
"""
from dataclasses import dataclass
from typing import Optional

import stripe

from app.core.config import get_settings


@dataclass
class PaymentIntent:
    provider: str
    client_secret: Optional[str]
    payment_intent_id: Optional[str]


def stripe_enabled() -> bool:
    return bool(get_settings().stripe_secret_key)


def create_payment_intent(amount: int, currency: str = "HKD", metadata: Optional[dict] = None) -> PaymentIntent:
    """Create a Stripe PaymentIntent for `amount` minor units (or a stub if no key)."""
    if not stripe_enabled():
        return PaymentIntent(provider="stub", client_secret=None, payment_intent_id=None)

    stripe.api_key = get_settings().stripe_secret_key
    intent = stripe.PaymentIntent.create(
        amount=amount,
        currency=currency.lower(),
        metadata=metadata or {},
        automatic_payment_methods={"enabled": True},
    )
    return PaymentIntent(
        provider="stripe",
        client_secret=intent.client_secret,
        payment_intent_id=intent.id,
    )


_INTERVALS = {
    "weekly": ("week", 1),
    "monthly": ("month", 1),
    "quarterly": ("month", 3),
    "yearly": ("year", 1),
}


def create_subscription_checkout_session(
    *,
    amount: int,
    currency: str,
    frequency: str,
    success_url: str,
    cancel_url: str,
    customer_id: Optional[str] = None,
    customer_email: Optional[str] = None,
    metadata: Optional[dict] = None,
) -> str:
    """Create a Stripe Checkout Session in subscription mode for a variable-amount
    recurring donation; returns the hosted Checkout URL to redirect the donor to.
    No payment_method_types (dynamic payment methods, per Stripe guidance)."""
    stripe.api_key = get_settings().stripe_secret_key
    interval, interval_count = _INTERVALS.get(frequency, ("month", 1))
    session = stripe.checkout.Session.create(
        mode="subscription",
        line_items=[
            {
                "price_data": {
                    "currency": currency.lower(),
                    "unit_amount": amount,
                    "recurring": {"interval": interval, "interval_count": interval_count},
                    "product_data": {"name": "Recurring donation to Ultimate United"},
                },
                "quantity": 1,
            }
        ],
        customer=customer_id,
        customer_email=None if customer_id else customer_email,
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata or {},
        subscription_data={"metadata": metadata or {}},
    )
    return session.url


def create_billing_portal_session(*, customer_id: str, return_url: str) -> str:
    """Create a Stripe Customer Portal session so the member can manage / cancel
    their subscriptions and payment methods. Returns the hosted portal URL.

    Note: the portal must be activated once in the Stripe Dashboard
    (Settings -> Billing -> Customer portal) or this call errors.
    """
    stripe.api_key = get_settings().stripe_secret_key
    session = stripe.billing_portal.Session.create(customer=customer_id, return_url=return_url)
    return session.url


def points_for_donation(amount_minor: int) -> int:
    """Reward 1 point per HK$10 donated (matches the FE mock: HK$100 -> 10 pts)."""
    return amount_minor // 1000
