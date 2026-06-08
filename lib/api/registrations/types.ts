/** Backend DTOs for the registrations resource (mirrors app/schemas/registrations.py). */

export type RegistrationRole = "attendee" | "volunteer"
export type RegistrationStatus = "registered" | "attended" | "cancelled" | "no_show"

export interface RegistrationOut {
  id: string
  user_id: string
  event_id: string
  role: RegistrationRole
  status: RegistrationStatus
  hours_logged: number
  points_earned: number
  registered_at: string | null
}

/** Request body for POST /registrations/{eventId} (mirrors RegisterIn). */
export interface RegisterIn {
  role?: RegistrationRole
}
