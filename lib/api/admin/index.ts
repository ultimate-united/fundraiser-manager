import { apiFetch } from "@/lib/api/client"

import { adminEndpoints } from "./endpoints"
import type {
  AdminEvent,
  AdminEventListItem,
  AdminSection,
  EventCreate,
  EventUpdate,
  ReviewStatus,
  SectionInput,
} from "./types"

/** All events incl. drafts (admin only). Pass reviewStatus to drive the queue. */
export function listAdminEvents(reviewStatus?: ReviewStatus) {
  const qs = reviewStatus ? `?review_status=${reviewStatus}` : ""
  return apiFetch<AdminEventListItem[]>(`${adminEndpoints.events}${qs}`)
}

/** Approve a submitted user activity → it becomes public (admin only). */
export function approveEvent(id: string) {
  return apiFetch<AdminEvent>(adminEndpoints.approve(id), { method: "POST" })
}

/** Reject a submitted activity with an optional note (admin only). */
export function rejectEvent(id: string, note?: string) {
  return apiFetch<AdminEvent>(adminEndpoints.reject(id), {
    method: "POST",
    body: JSON.stringify({ note: note ?? null }),
  })
}

/** Send a submitted activity back to its owner for edits (admin only). */
export function requestChanges(id: string, note?: string) {
  return apiFetch<AdminEvent>(adminEndpoints.requestChanges(id), {
    method: "POST",
    body: JSON.stringify({ note: note ?? null }),
  })
}

/** A single event by id, incl. drafts (admin only). */
export function getAdminEvent(id: string) {
  return apiFetch<AdminEvent>(adminEndpoints.event(id))
}

/** Create an event (admin only). */
export function createEvent(payload: EventCreate) {
  return apiFetch<AdminEvent>(adminEndpoints.events, { method: "POST", body: JSON.stringify(payload) })
}

/** Update an event (admin only). */
export function updateEvent(id: string, payload: EventUpdate) {
  return apiFetch<AdminEvent>(adminEndpoints.event(id), { method: "PATCH", body: JSON.stringify(payload) })
}

/** All content sections for an event (admin). */
export function getEventSections(id: string) {
  return apiFetch<AdminSection[]>(adminEndpoints.eventSections(id))
}

/** Replace all content sections for an event (admin). */
export function replaceEventSections(id: string, sections: SectionInput[]) {
  return apiFetch<AdminSection[]>(adminEndpoints.eventSections(id), {
    method: "PUT",
    body: JSON.stringify(sections),
  })
}

export type {
  AdminEvent,
  AdminEventListItem,
  AdminSection,
  EventCreate,
  EventUpdate,
  ReviewStatus,
  SectionInput,
} from "./types"
