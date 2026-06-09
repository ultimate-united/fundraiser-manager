import { apiFetch } from "@/lib/api/client"

import { donationEndpoints } from "./endpoints"
import type {
  CheckoutSession,
  DonationCreate,
  DonationCreateResult,
  DonationOut,
  RecurringCreate,
  RecurringOut,
  Supporter,
} from "./types"

/** The current user's one-off + recorded donations. */
export function getMyDonations() {
  return apiFetch<DonationOut[]>(donationEndpoints.mine)
}

/** The current user's recurring-donation subscriptions. */
export function getMyRecurring() {
  return apiFetch<RecurringOut[]>(donationEndpoints.recurring)
}

/** Record a one-time donation (guest-friendly). Returns the pending record +
 * Stripe handoff (client_secret is null until Stripe keys are configured). */
export function createDonation(payload: DonationCreate) {
  return apiFetch<DonationCreateResult>(donationEndpoints.create, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

/** Create a recurring-donation record directly (no Stripe). Requires auth. */
export function createRecurring(payload: RecurringCreate) {
  return apiFetch<RecurringOut>(donationEndpoints.recurring, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

/** Start a Stripe Checkout Session (subscription mode) for a recurring donation;
 * returns the hosted Checkout URL to redirect to. Requires an authenticated user. */
export function createRecurringCheckout(payload: RecurringCreate) {
  return apiFetch<CheckoutSession>(donationEndpoints.recurringCheckout, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

/** Open the Stripe Customer Portal (manage / cancel subscriptions); returns the
 * hosted portal URL. Requires an authenticated user with a stored Stripe customer. */
export function createBillingPortalSession() {
  return apiFetch<CheckoutSession>(donationEndpoints.billingPortal, { method: "POST" })
}

/** Public recent-supporters wall, optionally scoped to one event. */
export function getRecentSupporters(eventId?: string | null, limit = 5) {
  const params = new URLSearchParams({ limit: String(limit) })
  if (eventId) params.set("event_id", eventId)
  return apiFetch<Supporter[]>(`${donationEndpoints.recent}?${params.toString()}`)
}

export type {
  CheckoutSession,
  DonationCreate,
  DonationCreateResult,
  DonationOut,
  RecurringCreate,
  RecurringOut,
  Supporter,
  DonationKind,
  DonationStatus,
  RecurringFrequency,
  RecurringStatus,
} from "./types"
