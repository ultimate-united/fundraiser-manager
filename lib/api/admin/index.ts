import { apiFetch } from "@/lib/api/client"

import { adminEndpoints } from "./endpoints"
import type { AdminEvent, AdminSection, EventCreate, EventUpdate, SectionInput } from "./types"

/** All events incl. drafts (admin only). */
export function listAdminEvents() {
  return apiFetch<AdminEvent[]>(adminEndpoints.events)
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

export type { AdminEvent, AdminSection, EventCreate, EventUpdate, SectionInput } from "./types"
