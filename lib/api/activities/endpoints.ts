/** User activity endpoint paths, relative to `/api/v1`. Owner-scoped. */
export const activityEndpoints = {
  activities: "/activities/",
  activity: (id: string) => `/activities/${id}`,
  submit: (id: string) => `/activities/${id}/submit`,
  sections: (id: string) => `/activities/${id}/sections`,
} as const
