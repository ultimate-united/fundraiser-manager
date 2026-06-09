import { getMyRegistrations } from "@/lib/api/registrations"
import { createClient } from "@/lib/supabase/server"

/**
 * Whether the current user already has an active (non-cancelled) registration for
 * the given event. Returns false for guests. Server-only.
 */
export async function isRegisteredForEvent(eventId: string): Promise<boolean> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false
  try {
    const registrations = await getMyRegistrations()
    return registrations.some((r) => r.event_id === eventId && r.status !== "cancelled")
  } catch {
    return false
  }
}
