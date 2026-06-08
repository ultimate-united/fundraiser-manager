/** Optional filters for the public events feed (mirrors list_events query params). */
export interface EventListQuery {
  status?: string
  featured?: boolean
  organizer_id?: string
}

function toQueryString(params?: EventListQuery): string {
  if (!params) return ""
  const sp = new URLSearchParams()
  if (params.status) sp.set("status", params.status)
  if (params.featured !== undefined) sp.set("featured", String(params.featured))
  if (params.organizer_id) sp.set("organizer_id", params.organizer_id)
  const qs = sp.toString()
  return qs ? `?${qs}` : ""
}

/** Event endpoint paths, relative to `/api/v1`. */
export const eventEndpoints = {
  list: (params?: EventListQuery) => `/events/${toQueryString(params)}`,
  detail: (slug: string) => `/events/${slug}`,
} as const
