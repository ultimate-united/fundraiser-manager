"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

import {
  createActivity,
  replaceActivitySections,
  submitActivity,
  updateActivity,
} from "@/lib/api/activities"
import type { ActivityCreate } from "@/lib/api/activities/types"
import { parseEventForm, mapSaveError } from "@/lib/admin/event-form-parser"
import type { EventFormState } from "@/app/admin/events/actions"

/**
 * Create (no id) or update (id present) a user-owned activity AND its content
 * sections in one submission — the owner-scoped twin of admin `saveEvent`. Only
 * the owner-editable fields are sent; the backend forces owner_id/status/review.
 * redirect() lives outside the try.
 */
export async function saveActivity(_prev: EventFormState, formData: FormData): Promise<EventFormState> {
  const parsed = parseEventForm(formData)
  if ("error" in parsed) return { status: "error", message: parsed.error }
  const { id, base, sections } = parsed

  const payload: ActivityCreate = base

  let activityId = id
  try {
    if (id) {
      await updateActivity(id, payload)
    } else {
      activityId = (await createActivity(payload)).id
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : ""
    return {
      status: "error",
      message: mapSaveError(msg) ?? "Couldn't save your activity. Please check the fields and try again.",
    }
  }

  if (activityId && sections.length > 0) {
    try {
      await replaceActivitySections(activityId, sections)
    } catch {
      // leave seeded/previous sections in place on failure
    }
  }

  redirect("/dashboard/activities")
}

/** Submit an activity for admin review (called from the edit page). */
export async function submitActivityAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim()
  if (id) await submitActivity(id)
  revalidatePath("/dashboard/activities")
  redirect("/dashboard/activities")
}
