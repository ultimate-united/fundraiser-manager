import { RewardsContent } from "@/components/dashboard/rewards-content"
import { getMyBadges, getRewardCatalog, getTiers } from "@/lib/api/rewards"
import { getDashboardUser } from "@/lib/dashboard"

export default async function RewardsPage() {
  const user = await getDashboardUser()
  const [badges, rewards, tiers] = await Promise.all([getMyBadges(), getRewardCatalog(), getTiers()])

  return <RewardsContent user={user} badges={badges} rewards={rewards} tiers={tiers} />
}
