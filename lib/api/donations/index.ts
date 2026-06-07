import { apiFetch } from "@/lib/api/client"

import { donationEndpoints } from "./endpoints"
import type { DonationOut, RecurringOut } from "./types"

/** The current user's one-off + recorded donations. */
export function getMyDonations() {
  return apiFetch<DonationOut[]>(donationEndpoints.mine)
}

/** The current user's recurring-donation subscriptions. */
export function getMyRecurring() {
  return apiFetch<RecurringOut[]>(donationEndpoints.recurring)
}

export type {
  DonationOut,
  RecurringOut,
  DonationKind,
  DonationStatus,
  RecurringFrequency,
  RecurringStatus,
} from "./types"
