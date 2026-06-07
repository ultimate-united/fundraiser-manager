/** Backend DTOs for the rewards resource (mirrors app/schemas/rewards.py). */

export type BadgeCriteria =
  | "events_attended"
  | "donations_made"
  | "consecutive_months"
  | "hours_volunteered"
export type RewardCategory = "discount" | "experience" | "recognition" | "merch"
export type RedemptionStatus = "pending" | "fulfilled" | "cancelled"
export type MemberTier = "bronze" | "silver" | "gold" | "platinum"

export interface BadgeOut {
  id: string
  code: string
  name: string
  description: string | null
  icon: string | null
  criteria_type: BadgeCriteria
  criteria_threshold: number
  earned: boolean
  earned_at: string | null
}

export interface RewardOut {
  id: string
  code: string
  name: string
  description: string | null
  points_required: number
  category: RewardCategory
  icon: string | null
  active: boolean
}

export interface RedemptionOut {
  id: string
  user_id: string
  reward_id: string
  points_spent: number
  status: RedemptionStatus
  redeemed_at: string | null
}

export interface TierBenefitOut {
  benefit: string
  sort_order: number
}

export interface TierOut {
  code: MemberTier
  label: string
  min_points: number
  sort_order: number
  benefits: TierBenefitOut[]
}
