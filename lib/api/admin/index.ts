import { apiFetch } from "@/lib/api/client"

import { adminEndpoints } from "./endpoints"
import type { AdminEvent, EventCreate, EventUpdate } from "./types"

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

export type { AdminEvent, EventCreate, EventUpdate } from "./types"
