"use server"

import { updateMe, updateNotifications } from "@/lib/api/users"
import type { NotificationPrefsUpdate } from "@/lib/api/users/types"

export type ProfileFormState = { status: "success" | "error"; message: string } | null

/** Save the profile name fields (PATCH /users/me). */
export async function saveProfile(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const first_name = String(formData.get("first_name") ?? "").trim()
  const last_name = String(formData.get("last_name") ?? "").trim()
  if (!first_name) {
    return { status: "error", message: "First name is required." }
  }
  try {
    await updateMe({ first_name, last_name })
    return { status: "success", message: "Profile saved." }
  } catch {
    return { status: "error", message: "Couldn't save your profile. Please try again." }
  }
}

/** Save a partial notification-preference change (PATCH /users/me/notifications). */
export async function saveNotifications(prefs: NotificationPrefsUpdate): Promise<{ ok: boolean }> {
  try {
    await updateNotifications(prefs)
    return { ok: true }
  } catch {
    return { ok: false }
  }
}
