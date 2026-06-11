import {
  EventsContent,
  type UpcomingEvent,
  type PastEvent,
} from "@/components/dashboard/events-content"
import { getEvents } from "@/lib/api/events"
import { getMyRegistrations } from "@/lib/api/registrations"
import { getDashboardUser } from "@/lib/dashboard"

/** ISO timestamp -> YYYY-MM-DD. */
const toDate = (iso: string | null) => (iso ?? "").slice(0, 10)

export default async function DashboardEventsPage() {
  const user = await getDashboardUser()
  const [registrations, events] = await Promise.all([getMyRegistrations(), getEvents()])

  const eventMap = new Map(events.map((e) => [e.id, e]))

  const upcomingEvents: UpcomingEvent[] = registrations
    .filter((r) => r.status === "registered")
    .map((r) => {
      const e = eventMap.get(r.event_id)
      return {
        id: r.id,
        title: e?.title ?? "",
        date: toDate(e?.starts_at ?? null),
        location: e?.location ?? "",
        points: r.points_earned,
        role: r.role,
        details: r.form_data ?? {},
      }
    })

  const pastEvents: PastEvent[] = registrations
    .filter((r) => r.status === "attended")
    .map((r) => {
      const e = eventMap.get(r.event_id)
      return {
        id: r.id,
        title: e?.title ?? "",
        date: toDate(e?.starts_at ?? null),
        location: e?.location ?? "",
        role: r.role,
        hoursLogged: r.hours_logged,
        pointsEarned: r.points_earned,
      }
    })

  return <EventsContent user={user} upcomingEvents={upcomingEvents} pastEvents={pastEvents} />
}
