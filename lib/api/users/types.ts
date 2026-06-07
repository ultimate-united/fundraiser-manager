/** Backend DTOs for the users resource (snake_case — mirrors app/schemas/profiles.py). */

export type ProfileType = "individual" | "family" | "corporate" | "in_need"
export type UserRole = "member" | "organizer" | "admin"
export type MemberTier = "bronze" | "silver" | "gold" | "platinum"

export interface ProfileOut {
  id: string
  first_name: string
  last_name: string
  avatar_url: string | null
  profile_type: ProfileType
  role: UserRole
}

export interface DashboardDto {
  id: string
  first_name: string
  last_name: string
  avatar_url: string | null
  profile_type: ProfileType
  role: UserRole
  email: string | null
  total_points: number
  total_donated: number // minor units (cents)
  events_attended: number
  hours_volunteered: number
  tier: MemberTier
}

export interface NotificationPrefsOut {
  email_notifications: boolean
  event_reminders: boolean
  donation_receipts: boolean
  newsletter: boolean
}
