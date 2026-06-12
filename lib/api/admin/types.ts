/** Backend DTOs for the admin events resource (mirrors app/schemas/events.py). */
import type { EventStatus } from "@/lib/api/events/types"

type ImpactItem = { amount: number; title: string; description: string }

/** Full event row (no computed aggregates — mirrors EventBase). */
export interface AdminEvent {
  id: string
  organizer_id: string
  slug: string
  title: string
  subtitle: string | null
  mission: string | null
  summary: string | null
  banner_image: string | null
  starts_at: string | null
  ends_at: string | null
  location: string | null
  fundraising_goal: number | null // minor units (cents)
  participant_goal: number | null
  volunteer_spots: number | null
  points_reward: number
  status: EventStatus
  featured: boolean
  impact: ImpactItem[]
}

export interface EventCreate {
  slug: string
  title: string
  organizer_id?: string | null
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
  points_reward?: number
  status?: EventStatus
  featured?: boolean
  impact?: ImpactItem[]
}

export type EventUpdate = Partial<EventCreate>

export type SectionKind = "rich_text" | "schedule" | "contribution" | "sponsors"

/** One editable content section (Overview/Schedule/Contribute/Sponsors). */
export interface AdminSection {
  id: string
  kind: SectionKind
  title: string
  position: number
  content: { body?: string; items?: unknown[] } | unknown[]
  enabled: boolean
}

/** Replace-sections request item. */
export interface SectionInput {
  kind: SectionKind
  title: string
  position: number
  content: { body: string; items: unknown[] }
  enabled: boolean
}
