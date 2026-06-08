from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

DonationStatus = str       # 'pending' | 'completed' | 'failed' | 'refunded'
DonationKind = str         # 'one_time' | 'recurring'
RecurringFrequency = str   # 'weekly' | 'monthly' | 'quarterly' | 'yearly'
RecurringStatus = str      # 'active' | 'paused' | 'cancelled'


class DonationCreate(BaseModel):
    amount: int = Field(gt=0, description="Amount in minor units (cents)")
    currency: str = "HKD"
    event_id: Optional[str] = None        # null = general fund
    donor_name: Optional[str] = None
    donor_email: Optional[str] = None
    message: Optional[str] = None
    is_anonymous: bool = False
    dedicated_to: Optional[str] = None


class DonationOut(BaseModel):
    id: str
    user_id: Optional[str] = None
    event_id: Optional[str] = None
    recurring_donation_id: Optional[str] = None
    amount: int
    currency: str
    status: DonationStatus
    kind: DonationKind
    donor_name: Optional[str] = None
    donor_email: Optional[str] = None
    message: Optional[str] = None
    is_anonymous: bool = False
    dedicated_to: Optional[str] = None
    points_awarded: int = 0
    stripe_payment_intent_id: Optional[str] = None
    created_at: Optional[datetime] = None


class DonationCreateResult(BaseModel):
    donation: DonationOut
    # Stub for the eventual Stripe handoff; null until Stripe is wired.
    client_secret: Optional[str] = None
    payment_provider: str = "stub"


class RecurringCreate(BaseModel):
    amount: int = Field(gt=0, description="Amount in minor units (cents)")
    currency: str = "HKD"
    frequency: RecurringFrequency = "monthly"
    event_id: Optional[str] = None


class CheckoutSessionOut(BaseModel):
    """A Stripe Checkout Session redirect URL."""
    url: str


class RecurringUpdate(BaseModel):
    status: Optional[RecurringStatus] = None
    amount: Optional[int] = Field(default=None, gt=0)
    frequency: Optional[RecurringFrequency] = None


class RecurringOut(BaseModel):
    id: str
    user_id: str
    event_id: Optional[str] = None
    amount: int
    currency: str
    frequency: RecurringFrequency
    status: RecurringStatus
    next_charge_at: Optional[datetime] = None
    stripe_subscription_id: Optional[str] = None
    created_at: Optional[datetime] = None
