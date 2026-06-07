/** Reward / badge / tier endpoint paths, relative to `/api/v1`. */
export const rewardEndpoints = {
  catalog: "/rewards/rewards",
  tiers: "/rewards/tiers",
  badges: "/rewards/badges",
  myBadges: "/users/me/badges",
  myRedemptions: "/users/me/redemptions",
  redeem: (rewardId: string) => `/rewards/redeem/${rewardId}`,
} as const
