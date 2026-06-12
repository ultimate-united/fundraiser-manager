"use server"

import { redirect } from "next/navigation"

import { createEvent, replaceEventSections, updateEvent } from "@/lib/api/admin"
import type { EventCreate, SectionInput } from "@/lib/api/admin/types"

export type EventFormState = { status: "error"; message: string } | null

/**
 * Create (no id) or update (id present) an event AND its content sections in one
 * submission. The embedded sections editor serializes its state into the
 * `sections_payload` field. redirect() lives outside the try.
 */
export async function saveEvent(_prev: EventFormState, formData: FormData): Promise<EventFormState> {
  const id = String(formData.get("id") ?? "").trim()
  const str = (k: string) => String(formData.get(k) ?? "").trim() || null
  const num = (k: string) => {
    const v = String(formData.get(k) ?? "").trim()
    if (!v) return null
    const n = Number(v)
    return Number.isFinite(n) ? n : null
  }

  const title = str("title")
  const slug = str("slug")
  if (!title || !slug) {
    return { status: "error", message: "Title and slug are required." }
  }

  // Content sections from the embedded editor.
  let sections: SectionInput[] = []
  try {
    const parsed = JSON.parse(String(formData.get("sections_payload") ?? "[]"))
    if (Array.isArray(parsed)) sections = parsed
  } catch {
    sections = []
  }
  // The "description" now lives in the Overview body; mirror it to the summary column.
  const overviewBody = sections.find((s) => s.kind === "rich_text")?.content?.body ?? null

  const goalDollars = num("fundraising_goal")
  const payload: EventCreate = {
    slug,
    title,
    subtitle: str("subtitle"),
    mission: str("mission"),
    summary: overviewBody,
    banner_image: str("banner_image"),
    starts_at: str("starts_at"),
    ends_at: str("ends_at"),
    location: str("location"),
    fundraising_goal: goalDollars != null ? Math.round(goalDollars * 100) : null,
    participant_goal: num("participant_goal"),
    volunteer_spots: num("volunteer_spots"),
    points_reward: num("points_reward") ?? 0,
    status: (str("status") as EventCreate["status"]) ?? "draft",
    featured: formData.get("featured") === "true",
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
    if (/duplicate|unique|already exists/i.test(msg)) {
      return { status: "error", message: "That slug is already taken — pick another." }
    }
    return { status: "error", message: "Couldn't save the event. Please check the fields and try again." }
  }

  // Save content sections (best-effort — the event itself is already saved).
  if (eventId && sections.length > 0) {
    try {
      await replaceEventSections(eventId, sections)
    } catch {
      // leave the auto-seeded / previous sections in place on failure
    }
  }

  redirect("/admin/events")
}
