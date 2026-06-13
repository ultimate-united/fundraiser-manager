/** Admin endpoint paths, relative to `/api/v1`. */
export const adminEndpoints = {
  events: "/admin/events",
  event: (id: string) => `/admin/events/${id}`,
  eventSections: (id: string) => `/admin/events/${id}/sections`,
  approve: (id: string) => `/admin/events/${id}/approve`,
  reject: (id: string) => `/admin/events/${id}/reject`,
  requestChanges: (id: string) => `/admin/events/${id}/request-changes`,
} as const
