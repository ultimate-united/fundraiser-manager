/** Donation endpoint paths, relative to `/api/v1`. */
export const donationEndpoints = {
  mine: "/users/me/donations",
  create: "/donations/",
  recurring: "/donations/recurring",
} as const
