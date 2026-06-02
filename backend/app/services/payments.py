"""Payment provider seam.

Stripe is NOT wired yet (no account/keys in this phase). These helpers define the
boundary the donation flow will call. When Stripe is added:
  1. `pip install stripe`, set STRIPE_SECRET_KEY
  2. implement create_payment_intent() to call stripe.PaymentIntent.create(...)
  3. add a webhook route that marks donations 'completed' and calls award_points()

Until then create_payment_intent() returns a stub so the rest of the flow (recording
the donation as 'pending') works end to end.
"""
from dataclasses import dataclass
from typing import Optional

from app.core.config import get_settings


@dataclass
class PaymentIntent:
    provider: str
    client_secret: Optional[str]
    payment_intent_id: Optional[str]


def stripe_enabled() -> bool:
    return bool(get_settings().stripe_secret_key)


def create_payment_intent(amount: int, currency: str = "HKD", metadata: Optional[dict] = None) -> PaymentIntent:
    """Create a payment intent for `amount` minor units. Stubbed until Stripe is live."""
    if not stripe_enabled():
        return PaymentIntent(provider="stub", client_secret=None, payment_intent_id=None)

    # TODO: real Stripe integration
    # import stripe
    # stripe.api_key = get_settings().stripe_secret_key
    # intent = stripe.PaymentIntent.create(amount=amount, currency=currency.lower(), metadata=metadata or {})
    # return PaymentIntent(provider="stripe", client_secret=intent.client_secret, payment_intent_id=intent.id)
    raise NotImplementedError("Stripe integration not implemented yet")


def points_for_donation(amount_minor: int) -> int:
    """Reward 1 point per HK$10 donated (matches the FE mock: HK$100 -> 10 pts)."""
    return amount_minor // 1000
