import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import {
  DashboardOverview,
  type ActivityItem,
  type RewardItem,
} from "@/components/dashboard/dashboard-overview"
import { getMyDonations } from "@/lib/api/donations"
import { getEvents } from "@/lib/api/events"
import { getMyRegistrations } from "@/lib/api/registrations"
import { getRewardCatalog } from "@/lib/api/rewards"
import { getDashboardUser } from "@/lib/dashboard"

export default async function DashboardPage() {
  const user = await getDashboardUser("/dashboard")

  // Fail-fast: any DAL error throws to app/dashboard/error.tsx.
  const [rewards, registrations, donations, events] = await Promise.all([
    getRewardCatalog(),
    getMyRegistrations(),
    getMyDonations(),
    getEvents(),
  ])

  const availableRewards: RewardItem[] = rewards.slice(0, 2).map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description ?? undefined,
    pointsRequired: r.points_required,
    icon: r.icon ?? undefined,
    canRedeem: user.totalPoints >= r.points_required,
  }))

  const eventTitleById = new Map(events.map((e) => [e.id, e.title]))

  const recentActivity: ActivityItem[] = [
    ...registrations.map(
      (reg): ActivityItem => ({
        type: "event",
        title: eventTitleById.get(reg.event_id),
        date: reg.registered_at ?? undefined,
        points: reg.points_earned,
        status: reg.status,
      }),
    ),
    ...donations.map(
      (d): ActivityItem => ({
        type: "donation",
        title: "Donation",
        date: d.created_at ?? undefined,
        amount: d.amount / 100, // cents -> HK$
        status: d.status,
      }),
    ),
  ]
    .sort((a, b) => {
      const ta = a.date ? new Date(a.date).getTime() : 0
      const tb = b.date ? new Date(b.date).getTime() : 0
      return tb - ta
    })
    .slice(0, 3)

  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <DashboardSidebar user={user} />
          <DashboardOverview
            user={user}
            recentActivity={recentActivity}
            availableRewards={availableRewards}
          />
        </div>
      </main>
      <Footer />
    </div>
  )
}
