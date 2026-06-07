/** Event-registration endpoint paths, relative to `/api/v1`. */
export const registrationEndpoints = {
  mine: "/users/me/registrations",
  register: (eventId: string) => `/registrations/${eventId}`,
  cancel: (eventId: string) => `/registrations/${eventId}`,
} as const
