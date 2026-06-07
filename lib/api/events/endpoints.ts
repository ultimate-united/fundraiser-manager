/** Event endpoint paths, relative to `/api/v1`. */
export const eventEndpoints = {
  list: "/events/",
  detail: (slug: string) => `/events/${slug}`,
} as const
