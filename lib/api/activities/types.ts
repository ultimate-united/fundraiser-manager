/** Member-owned activity DTOs (mirrors backend ActivityCreate/ActivityUpdate).
 * The row shapes are shared with the admin events resource. */
import type { AdminEvent, AdminEventListItem } from "@/lib/api/admin/types"

type ImpactItem = AdminEvent["impact"][number]

export type Activity = AdminEvent
export type ActivityListItem = AdminEventListItem

/** Owner-settable fields only — no status/featured/points_reward (admin-controlled). */
export interface ActivityCreate {
  slug: string
  title: string
  subtitle?: string | null
  mission?: string | null
  summary?: string | null
  banner_image?: string | null
  starts_at?: string | null
  ends_at?: string | null
  location?: string | null
  fundraising_goal?: number | null // minor units (cents)
  participant_goal?: number | null
  volunteer_spots?: number | null
  impact?: ImpactItem[]
}

export type ActivityUpdate = Partial<ActivityCreate>
