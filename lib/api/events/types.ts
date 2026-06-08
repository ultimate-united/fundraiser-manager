/** Backend DTOs for the events resource (mirrors app/schemas/events.py + v_event_public). */

export type EventStatus = "draft" | "upcoming" | "ongoing" | "completed" | "cancelled"

export interface EventListItem {
  id: string
  organizer_id: string
  parent_event_id: string | null
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
  // Aggregates from v_event_public:
  amount_raised: number // minor units (cents)
  participant_count: number
  spots_left: number | null
}

/** A dynamic content tab/section (mirrors app/schemas/events.py EventSectionOut). */
export interface EventSection {
  id: string
  kind: "rich_text" | "schedule" | "sponsors" | "contribution" | "faq" | "organizer" | "custom"
  title: string
  position: number
  content: unknown // JSONB — shape depends on `kind`
}

/** Full event detail (list fields + ordered dynamic sections). */
export interface EventDetail extends EventListItem {
  sections: EventSection[]
}
