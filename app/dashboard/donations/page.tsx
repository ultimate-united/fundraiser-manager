import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DonationsContent } from "@/components/dashboard/donations-content"
import { getMyDonations, getMyRecurring } from "@/lib/api/donations"
import { getEvents } from "@/lib/api/events"
import { getDashboardUser } from "@/lib/dashboard"

/** ISO timestamp -> YYYY-MM-DD. */
const toDate = (iso: string | null) => (iso ?? "").slice(0, 10)

export default async function DashboardDonationsPage() {
  const user = await getDashboardUser("/dashboard/donations")
  const [donations, recurring, events] = await Promise.all([
    getMyDonations(),
    getMyRecurring(),
    getEvents(),
  ])

  const eventTitles = new Map(events.map((e) => [e.id, e.title]))
  const campaignFor = (eventId: string | null) =>
    (eventId && eventTitles.get(eventId)) || "General Fund"

  const history = donations.map((d) => ({
    id: d.id,
    campaign: campaignFor(d.event_id),
    date: toDate(d.created_at),
    amount: d.amount / 100,
    type: d.kind,
    points: d.points_awarded,
  }))

  const recurringItems = recurring.map((r) => ({
    id: r.id,
    campaign: campaignFor(r.event_id),
    amount: r.amount / 100,
    frequency: r.frequency,
    nextDate: toDate(r.next_charge_at),
    status: r.status,
  }))

  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <DashboardSidebar user={user} />
          <DonationsContent user={user} history={history} recurring={recurringItems} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
