"use server"

import { redirect } from "next/navigation"

import { createEvent, updateEvent } from "@/lib/api/admin"
import type { EventCreate } from "@/lib/api/admin/types"

export type EventFormState = { status: "error"; message: string } | null

/** Create (no id) or update (id present) an event. redirect() lives outside try. */
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

  const goalDollars = num("fundraising_goal")
  const payload: EventCreate = {
    slug,
    title,
    subtitle: str("subtitle"),
    mission: str("mission"),
    summary: str("summary"),
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

  try {
    if (id) await updateEvent(id, payload)
    else await createEvent(payload)
  } catch (err) {
    const msg = err instanceof Error ? err.message : ""
    if (/duplicate|unique|already exists/i.test(msg)) {
      return { status: "error", message: "That slug is already taken — pick another." }
    }
    return { status: "error", message: "Couldn't save the event. Please check the fields and try again." }
  }
  redirect("/admin/events")
}
