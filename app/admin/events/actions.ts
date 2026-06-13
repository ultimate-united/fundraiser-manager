"use server"

import { redirect } from "next/navigation"

import { createEvent, replaceEventSections, updateEvent } from "@/lib/api/admin"
import type { EventCreate } from "@/lib/api/admin/types"
import { parseEventForm, mapSaveError } from "@/lib/admin/event-form-parser"

export type EventFormState = { status: "error"; message: string } | null

/**
 * Create (no id) or update (id present) an event AND its content sections in one
 * submission. The embedded sections editor serializes its state into the
 * `sections_payload` field. redirect() lives outside the try.
 */
export async function saveEvent(_prev: EventFormState, formData: FormData): Promise<EventFormState> {
  const parsed = parseEventForm(formData)
  if ("error" in parsed) return { status: "error", message: parsed.error }
  const { id, base, sections, num, bool, str } = parsed

  const payload: EventCreate = {
    ...base,
    points_reward: num("points_reward") ?? 0,
    status: (str("status") as EventCreate["status"]) ?? "draft",
    featured: bool("featured"),
  }

  let eventId = id
  try {
    if (id) {
      await updateEvent(id, payload)
    } else {
      eventId = (await createEvent(payload)).id
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : ""
    return {
      status: "error",
      message: mapSaveError(msg) ?? "Couldn't save the event. Please check the fields and try again.",
    }
  }

  if (eventId && sections.length > 0) {
    try {
      await replaceEventSections(eventId, sections)
    } catch {
      // leave the auto-seeded / previous sections in place on failure
    }
  }

  redirect("/admin/events")
}
