import { apiFetch } from "@/lib/api/client"

import { registrationEndpoints } from "./endpoints"
import type { RegisterIn, RegistrationOut } from "./types"

/** The current user's event registrations (all statuses). */
export function getMyRegistrations() {
  return apiFetch<RegistrationOut[]>(registrationEndpoints.mine)
}

/** Register the current (authenticated) user for an event. Defaults to attendee.
 * The backend runs an atomic capacity check and rejects duplicate registrations. */
export function registerForEvent(eventId: string, payload: RegisterIn = {}) {
  return apiFetch<RegistrationOut>(registrationEndpoints.register(eventId), {
    method: "POST",
    body: JSON.stringify({ role: payload.role ?? "attendee" }),
  })
}

export type { RegisterIn, RegistrationOut, RegistrationRole, RegistrationStatus } from "./types"
