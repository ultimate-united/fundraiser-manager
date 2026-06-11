import { cache } from "react"
import { redirect } from "next/navigation"

import { getDashboard } from "@/lib/api/users"
import type { MemberTier } from "@/lib/api/users/types"
import { createClient } from "@/lib/supabase/server"

/** The camelCase view model the dashboard components consume (money in dollars). */
export interface UserData {
  id: string
  email?: string
  firstName: string
  lastName: string
  avatarUrl: string | null
  totalPoints: number
  tier: MemberTier
  eventsAttended: number
  totalDonated: number // dollars
  hoursVolunteered: number
}

/**
 * Auth gate + dashboard view model for any /dashboard page. Redirects
 * unauthenticated callers to login, otherwise maps the backend DashboardDto to
 * UserData. Single source of truth so every dashboard page stays consistent.
 */
export const getDashboardUser = cache(async (redirectTo = "/dashboard"): Promise<UserData> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/auth/login?redirect=${redirectTo}`)

  const d = await getDashboard()
  return {
    id: d.id,
    email: d.email ?? user.email,
    firstName: d.first_name,
    lastName: d.last_name,
    avatarUrl: d.avatar_url,
    totalPoints: d.total_points,
    tier: d.tier,
    eventsAttended: d.events_attended,
    totalDonated: Math.round(d.total_donated / 100), // cents -> dollars
    hoursVolunteered: d.hours_volunteered,
  }
})
