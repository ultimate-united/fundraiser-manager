import { apiFetch } from "@/lib/api/client"
import type { AdminSection, SectionInput } from "@/lib/api/admin/types"

import { activityEndpoints } from "./endpoints"
import type { Activity, ActivityCreate, ActivityListItem, ActivityUpdate } from "./types"

/** Every activity the current user owns, any status. */
export function listMyActivities() {
  return apiFetch<ActivityListItem[]>(activityEndpoints.activities)
}

/** A single owned activity by id (404 if not the owner's). */
export function getMyActivity(id: string) {
  return apiFetch<Activity>(activityEndpoints.activity(id))
}

/** Create a draft activity owned by the current user (max 5 active). */
export function createActivity(payload: ActivityCreate) {
  return apiFetch<Activity>(activityEndpoints.activities, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

/** Update an owned activity. */
export function updateActivity(id: string, payload: ActivityUpdate) {
  return apiFetch<Activity>(activityEndpoints.activity(id), {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

/** Submit an owned activity for admin review (draft / changes_requested → pending). */
export function submitActivity(id: string) {
  return apiFetch<Activity>(activityEndpoints.submit(id), { method: "POST" })
}

/** All content sections for an owned activity. */
export function getActivitySections(id: string) {
  return apiFetch<AdminSection[]>(activityEndpoints.sections(id))
}

/** Replace all content sections for an owned activity. */
export function replaceActivitySections(id: string, sections: SectionInput[]) {
  return apiFetch<AdminSection[]>(activityEndpoints.sections(id), {
    method: "PUT",
    body: JSON.stringify(sections),
  })
}

export type { Activity, ActivityCreate, ActivityListItem, ActivityUpdate } from "./types"
