import { apiFetch } from "@/lib/api/client"

import { userEndpoints } from "./endpoints"
import type {
  DashboardDto,
  NotificationPrefsOut,
  NotificationPrefsUpdate,
  ProfileOut,
  ProfileUpdate,
} from "./types"

/** The current user's profile. */
export function getMe() {
  return apiFetch<ProfileOut>(userEndpoints.me)
}

/** Update the current user's profile (name, etc.). */
export function updateMe(payload: ProfileUpdate) {
  return apiFetch<ProfileOut>(userEndpoints.me, { method: "PATCH", body: JSON.stringify(payload) })
}

/** Update the current user's notification preferences (partial). */
export function updateNotifications(payload: NotificationPrefsUpdate) {
  return apiFetch<NotificationPrefsOut>(userEndpoints.notifications, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

/** The current user's aggregated dashboard model (points, donated, attended, hours, tier). */
export function getDashboard() {
  return apiFetch<DashboardDto>(userEndpoints.dashboard)
}

/** The current user's notification preferences. */
export function getNotifications() {
  return apiFetch<NotificationPrefsOut>(userEndpoints.notifications)
}

export type {
  DashboardDto,
  NotificationPrefsOut,
  NotificationPrefsUpdate,
  ProfileOut,
  ProfileUpdate,
} from "./types"
