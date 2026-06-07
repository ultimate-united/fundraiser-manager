import { apiFetch } from "@/lib/api/client"

import { eventEndpoints } from "./endpoints"
import type { EventListItem } from "./types"

/** Public list of non-draft events (with computed aggregates). */
export function getEvents() {
  return apiFetch<EventListItem[]>(eventEndpoints.list)
}

/** A single public event by slug. */
export function getEvent(slug: string) {
  return apiFetch<EventListItem>(eventEndpoints.detail(slug))
}

export type { EventListItem, EventStatus } from "./types"
