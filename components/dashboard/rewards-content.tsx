"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Award,
  Star,
  Gift,
  Sparkles,
  Trophy,
  Heart,
  Users,
  Calendar,
  Lock,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { UserData } from "@/lib/dashboard"
import type { BadgeOut, RewardOut, TierOut } from "@/lib/api/rewards/types"

/** Maps lucide icon names from the API to their components. Award is the fallback. */
const ICON_MAP: Record<string, LucideIcon> = {
  Award,
  Star,
  Gift,
  Sparkles,
  Trophy,
  Heart,
  Users,
  Calendar,
}

function resolveIcon(name?: string | null): LucideIcon {
  return (name && ICON_MAP[name]) || Award
}

// API DTOs (BadgeOut / RewardOut / TierOut) are imported from @/lib/api/rewards/types.

interface RewardsContentProps {
  user: UserData
  badges: BadgeOut[]
  rewards: RewardOut[]
  tiers: TierOut[]
}

function formatEarnedDate(iso: string | null): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

export function RewardsContent({ user, badges, rewards, tiers }: RewardsContentProps) {
  const earnedBadges = badges.filter((b) => b.earned)
  const availableBadges = badges.filter((b) => !b.earned)

  const sortedTiers = [...tiers].sort((a, b) => a.min_points - b.min_points)

  const tierColors: Record<string, string> = {
    bronze: "border-amber-700/50 bg-amber-700/5",
    silver: "border-slate-400/50 bg-slate-400/5",
    gold: "border-yellow-500/50 bg-yellow-500/5",
    platinum: "border-purple-500/50 bg-purple-500/5",
  }

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">Rewards & Recognition</h1>
        <p className="text-muted-foreground mt-1">
          Earn badges, unlock rewards, and climb the membership tiers.
        </p>
      </div>

      {/* Points Summary */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Your Impact Points</p>
              <p className="text-4xl font-bold text-primary">{user.totalPoints}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Current Tier</p>
                <Badge className="mt-1 capitalize">{user.tier}</Badge>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Badges Earned</p>
                <p className="font-semibold">{earnedBadges.length}/{badges.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="badges" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="redeem">Redeem Points</TabsTrigger>
          <TabsTrigger value="tiers">Tier Benefits</TabsTrigger>
        </TabsList>

        {/* Badges Tab */}
        <TabsContent value="badges" className="space-y-6">
          {/* Earned Badges */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-xl flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                Earned Badges ({earnedBadges.length})
              </CardTitle>
              <CardDescription>Badges you&apos;ve unlocked through your contributions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {earnedBadges.map((badge) => {
                  const Icon = resolveIcon(badge.icon)
                  const earnedDate = formatEarnedDate(badge.earned_at)
                  return (
                    <div
                      key={badge.id}
                      className="p-4 rounded-lg border-2 border-primary/20 bg-primary/5"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-full bg-primary/20">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{badge.name}</p>
                          {earnedDate && (
                            <p className="text-xs text-muted-foreground">Earned {earnedDate}</p>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{badge.description}</p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Available Badges */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-xl flex items-center gap-2">
                <Lock className="w-5 h-5 text-muted-foreground" />
                Badges to Unlock ({availableBadges.length})
              </CardTitle>
              <CardDescription>Keep participating to earn these badges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableBadges.map((badge) => {
                  const Icon = resolveIcon(badge.icon)
                  return (
                    <div
                      key={badge.id}
                      className="p-4 rounded-lg border border-dashed border-muted-foreground/30 opacity-75"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-full bg-muted">
                          <Icon className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-semibold">{badge.name}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{badge.description}</p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Redeem Tab */}
        <TabsContent value="redeem" className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            {rewards.map((reward) => {
              const Icon = resolveIcon(reward.icon)
              const canRedeem = user.totalPoints >= reward.points_required
              const progress = Math.min((user.totalPoints / reward.points_required) * 100, 100)

              return (
                <Card key={reward.id} className={cn(!canRedeem && "opacity-75")}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={cn("p-3 rounded-lg", canRedeem ? "bg-primary/10" : "bg-muted")}>
                        <Icon
                          className={cn("w-6 h-6", canRedeem ? "text-primary" : "text-muted-foreground")}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{reward.name}</h3>
                        <p className="text-sm text-muted-foreground">{reward.description}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {user.totalPoints} / {reward.points_required} pts
                        </span>
                        {canRedeem && <span className="text-primary font-medium">Available!</span>}
                      </div>
                      <Progress value={progress} className="h-2" />
                      <Button
                        className="w-full mt-2"
                        disabled={!canRedeem}
                        variant={canRedeem ? "default" : "outline"}
                      >
                        {canRedeem
                          ? "Redeem Now"
                          : `Need ${reward.points_required - user.totalPoints} more pts`}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Tiers Tab */}
        <TabsContent value="tiers" className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            {sortedTiers.map((tier) => {
              const isCurrentTier = tier.code === user.tier
              const benefits = [...tier.benefits].sort((a, b) => a.sort_order - b.sort_order)

              return (
                <Card
                  key={tier.code}
                  className={cn(
                    "border-2 transition-all",
                    isCurrentTier ? tierColors[tier.code] ?? "border-border" : "border-border"
                  )}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="font-serif text-xl capitalize">{tier.label}</CardTitle>
                      {isCurrentTier && (
                        <Badge variant="outline" className="border-primary text-primary">
                          Current Tier
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {benefits.map((b, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle2
                            className={cn(
                              "w-4 h-4 mt-0.5 flex-shrink-0",
                              isCurrentTier ? "text-primary" : "text-muted-foreground"
                            )}
                          />
                          <span className={isCurrentTier ? "text-foreground" : "text-muted-foreground"}>
                            {b.benefit}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
