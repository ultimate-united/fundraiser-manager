/** Donation endpoint paths, relative to `/api/v1`. */
export const donationEndpoints = {
  mine: "/users/me/donations",
  create: "/donations/",
  recurring: "/donations/recurring",
  recurringCheckout: "/donations/recurring/checkout",
  billingPortal: "/donations/billing-portal",
  recent: "/donations/recent",
} as const
