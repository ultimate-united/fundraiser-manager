"use server"

import { replaceEventSections } from "@/lib/api/admin"
import type { SectionInput } from "@/lib/api/admin/types"

export type SectionsFormState = { status: "success" | "error"; message: string } | null

/** Replace an event's content sections. The editor serializes its state into the
 * `payload` field as JSON (a SectionInput[]). */
export async function saveSections(
  _prev: SectionsFormState,
  formData: FormData,
): Promise<SectionsFormState> {
  const eventId = String(formData.get("event_id") ?? "")
  if (!eventId) return { status: "error", message: "Missing event reference." }

  let sections: SectionInput[]
  try {
    sections = JSON.parse(String(formData.get("payload") ?? "[]"))
  } catch {
    return { status: "error", message: "Couldn't read the form data." }
  }

  try {
    await replaceEventSections(eventId, sections)
    return { status: "success", message: "Event content saved." }
  } catch {
    return { status: "error", message: "Couldn't save the content. Please try again." }
  }
}
