/** Shared parsing for the event/activity form (used by admin `saveEvent` and
 * owner `saveActivity`). Keeps the two server actions DRY — they only differ in
 * the admin-only fields and which DAL + redirect they use. */
import type { SectionInput } from "@/lib/api/admin/types"

/** Fields common to both an admin event and a member activity. */
export interface EventFormBase {
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
}

export interface ParsedEventForm {
  id: string
  base: EventFormBase
  sections: SectionInput[]
  /** Read a numeric field (for admin-only points_reward). */
  num: (key: string) => number | null
  /** Read a boolean "true"/"false" hidden field (for admin-only featured). */
  bool: (key: string) => boolean
  /** Read a trimmed string field (for admin-only status). */
  str: (key: string) => string | null
}

/** Parse shared form fields. Returns `{ error }` when a required field is missing. */
export function parseEventForm(formData: FormData): ParsedEventForm | { error: string } {
  const str = (k: string) => String(formData.get(k) ?? "").trim() || null
  const num = (k: string) => {
    const v = String(formData.get(k) ?? "").trim()
    if (!v) return null
    const n = Number(v)
    return Number.isFinite(n) ? n : null
  }
  const bool = (k: string) => formData.get(k) === "true"

  const title = str("title")
  const slug = str("slug")
  if (!title || !slug) return { error: "Title and slug are required." }

  let sections: SectionInput[] = []
  try {
    const parsed = JSON.parse(String(formData.get("sections_payload") ?? "[]"))
    if (Array.isArray(parsed)) sections = parsed
  } catch {
    sections = []
  }
  // The "description" lives in the Overview body; mirror it to the summary column.
  const overviewBody = sections.find((s) => s.kind === "rich_text")?.content?.body ?? null
  const goalDollars = num("fundraising_goal")

  return {
    id: String(formData.get("id") ?? "").trim(),
    base: {
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
    },
    sections,
    num,
    bool,
    str,
  }
}

/** Map a backend error message to a friendly form message, or null if unrecognised. */
export function mapSaveError(msg: string): string | null {
  if (/at most 5 active|Activity limit/i.test(msg)) {
    return "You've reached the limit of 5 active activities."
  }
  if (/duplicate|unique|already taken/i.test(msg)) {
    return "That link (slug) is already taken — pick another."
  }
  return null
}
