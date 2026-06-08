"use server"

import { registerForEvent } from "@/lib/api/registrations"
import type { RegistrationRole } from "@/lib/api/registrations/types"

export type RegistrationFormState = {
  status: "success" | "error"
  message: string
  role?: RegistrationRole
} | null

/**
 * Registers the current (authenticated) user for an event.
 *
 * DRAFT: the participant type, party size, volunteer skills and availability are
 * collected in the UI as placeholders but are NOT yet persisted — the backend
 * `event_registrations` table only knows `role` (attendee | volunteer) today.
 * Once the fields are finalized, extend RegisterIn + the endpoint and forward
 * the extra values from `formData` here.
 */
export async function submitRegistration(
  _prev: RegistrationFormState,
  formData: FormData,
): Promise<RegistrationFormState> {
  const eventId = String(formData.get("event_id") ?? "")
  const mode = String(formData.get("mode") ?? "participant")
  const role: RegistrationRole = mode === "volunteer" ? "volunteer" : "attendee"

  if (!eventId) {
    return { status: "error", message: "Missing event reference — please reload and try again." }
  }

  try {
    await registerForEvent(eventId, { role })
    return {
      status: "success",
      role,
      message:
        role === "volunteer"
          ? "You're signed up to volunteer! We'll follow up about your skills and availability."
          : "You're registered for this event. See you there!",
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : ""
    if (/409|duplicate|already|unique/i.test(msg)) {
      return { status: "error", message: "You're already registered for this event." }
    }
    if (/full|capacity/i.test(msg)) {
      return { status: "error", message: "Sorry — this event is full or not currently open for registration." }
    }
    return { status: "error", message: "We couldn't complete your registration. Please try again." }
  }
}
