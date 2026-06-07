import { apiFetch } from "@/lib/api/client"

import { rewardEndpoints } from "./endpoints"
import type { BadgeOut, RedemptionOut, RewardOut, TierOut } from "./types"

/** Public catalog of redeemable rewards (active only). */
export function getRewardCatalog() {
  return apiFetch<RewardOut[]>(rewardEndpoints.catalog)
}

/** Membership tiers with their benefits. */
export function getTiers() {
  return apiFetch<TierOut[]>(rewardEndpoints.tiers)
}

/** Badges annotated with the current user's earned/earned_at state. */
export function getMyBadges() {
  return apiFetch<BadgeOut[]>(rewardEndpoints.myBadges)
}

/** The current user's reward redemptions. */
export function getMyRedemptions() {
  return apiFetch<RedemptionOut[]>(rewardEndpoints.myRedemptions)
}

export type {
  BadgeOut,
  RewardOut,
  RedemptionOut,
  TierOut,
  TierBenefitOut,
  RewardCategory,
} from "./types"
