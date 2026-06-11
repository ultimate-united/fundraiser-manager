/** Admin endpoint paths, relative to `/api/v1`. */
export const adminEndpoints = {
  events: "/admin/events",
  event: (id: string) => `/admin/events/${id}`,
} as const
