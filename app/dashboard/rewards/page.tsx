import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { RewardsContent } from "@/components/dashboard/rewards-content"
import { getMyBadges, getRewardCatalog, getTiers } from "@/lib/api/rewards"
import { getDashboardUser } from "@/lib/dashboard"

export default async function RewardsPage() {
  const user = await getDashboardUser("/dashboard/rewards")
  const [badges, rewards, tiers] = await Promise.all([getMyBadges(), getRewardCatalog(), getTiers()])

  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <DashboardSidebar user={user} />
          <RewardsContent user={user} badges={badges} rewards={rewards} tiers={tiers} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
