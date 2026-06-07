import { apiFetch } from "@/lib/api/client"

import { userEndpoints } from "./endpoints"
import type { DashboardDto, NotificationPrefsOut, ProfileOut } from "./types"

/** The current user's profile. */
export function getMe() {
  return apiFetch<ProfileOut>(userEndpoints.me)
}

/** The current user's aggregated dashboard model (points, donated, attended, hours, tier). */
export function getDashboard() {
  return apiFetch<DashboardDto>(userEndpoints.dashboard)
}

/** The current user's notification preferences. */
export function getNotifications() {
  return apiFetch<NotificationPrefsOut>(userEndpoints.notifications)
}

export type { DashboardDto, NotificationPrefsOut, ProfileOut } from "./types"
