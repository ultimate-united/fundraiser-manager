/** User-scoped (`/users/me/...`) endpoint paths, relative to `/api/v1`. */
export const userEndpoints = {
  me: "/users/me",
  dashboard: "/users/me/dashboard",
  notifications: "/users/me/notifications",
} as const
