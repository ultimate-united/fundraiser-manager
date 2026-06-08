import { apiFetch } from "@/lib/api/client"

import { eventEndpoints, type EventListQuery } from "./endpoints"
import type { EventDetail, EventListItem } from "./types"

/** Public list of non-draft events (with computed aggregates), optionally filtered. */
export function getEvents(params?: EventListQuery) {
  return apiFetch<EventListItem[]>(eventEndpoints.list(params))
}

/** A single public event by slug — includes ordered dynamic sections. */
export function getEvent(slug: string) {
  return apiFetch<EventDetail>(eventEndpoints.detail(slug))
}

export type { EventDetail, EventListItem, EventSection, EventStatus } from "./types"
