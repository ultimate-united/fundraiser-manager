/** Backend DTOs for the donations resource (mirrors app/schemas/donations.py). */

export type DonationStatus = "pending" | "completed" | "failed" | "refunded"
export type DonationKind = "one_time" | "recurring"
export type RecurringFrequency = "weekly" | "monthly" | "quarterly" | "yearly"
export type RecurringStatus = "active" | "paused" | "cancelled"

export interface DonationOut {
  id: string
  user_id: string | null
  event_id: string | null
  recurring_donation_id: string | null
  amount: number // minor units (cents)
  currency: string
  status: DonationStatus
  kind: DonationKind
  donor_name: string | null
  donor_email: string | null
  message: string | null
  is_anonymous: boolean
  dedicated_to: string | null
  points_awarded: number
  stripe_payment_intent_id: string | null
  created_at: string | null
}

export interface RecurringOut {
  id: string
  user_id: string
  event_id: string | null
  amount: number // minor units (cents)
  currency: string
  frequency: RecurringFrequency
  status: RecurringStatus
  next_charge_at: string | null
  stripe_subscription_id: string | null
  created_at: string | null
}

/** Request body for POST /donations (mirrors DonationCreate). */
export interface DonationCreate {
  amount: number // minor units (cents)
  currency?: string
  event_id?: string | null // null = general fund
  donor_name?: string | null
  donor_email?: string | null
  message?: string | null
  is_anonymous?: boolean
  dedicated_to?: string | null
}

/** Response from POST /donations: the pending record + the Stripe handoff. */
export interface DonationCreateResult {
  donation: DonationOut
  client_secret: string | null // null while payments.py is stubbed
  payment_provider: string // "stub" until Stripe keys are added, then "stripe"
}

/** Request body for POST /donations/recurring (mirrors RecurringCreate). */
export interface RecurringCreate {
  amount: number // minor units (cents)
  currency?: string
  frequency?: RecurringFrequency
  event_id?: string | null
}

/** A Stripe Checkout Session redirect URL (subscription mode). */
export interface CheckoutSession {
  url: string
}
