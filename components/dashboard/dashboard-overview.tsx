"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Calendar,
  Clock,
  Heart,
  TrendingUp,
  Award,
  ChevronRight,
  Star,
  Gift,
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"

interface UserData {
  id: string
  email?: string
  firstName: string
  lastName: string
  avatarUrl: string | null
  totalPoints: number
  tier: "bronze" | "silver" | "gold" | "platinum"
  eventsAttended: number
  totalDonated: number
  hoursVolunteered: number
}

/** A merged recent-activity row (registration or donation), serializable from the server. */
export interface ActivityItem {
  type: "event" | "donation"
  title?: string
  date?: string // ISO string
  points?: number
  amount?: number // HK$ (already converted from cents)
  status?: string
}

/** A redeemable reward, serializable from the server (icon is a lucide name). */
export interface RewardItem {
  id: string
  name: string
  description?: string
  pointsRequired: number
  icon?: string // lucide icon name
  canRedeem: boolean
}

interface DashboardOverviewProps {
  user: UserData
  recentActivity: ActivityItem[]
  availableRewards: RewardItem[]
}

// Map lucide icon NAME strings (from the API) to lucide components.
const REWARD_ICONS: Record<string, LucideIcon> = {
  Award,
  Star,
  Gift,
  Heart,
  Calendar,
  TrendingUp,
  Clock,
}

function resolveIcon(name?: string): LucideIcon {
  return (name && REWARD_ICONS[name]) || Award
}

function formatDate(iso?: string): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

export function DashboardOverview({ user, recentActivity, availableRewards }: DashboardOverviewProps) {
  return (
    <div className="flex-1 space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Welcome back, {user.firstName}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s an overview of your impact with Ultimate United.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{user.eventsAttended}</p>
                <p className="text-xs text-muted-foreground">Events Attended</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/20">
                <Clock className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{user.hoursVolunteered}</p>
                <p className="text-xs text-muted-foreground">Hours Volunteered</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <Heart className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">HK${user.totalDonated}</p>
                <p className="text-xs text-muted-foreground">Total Donated</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{user.totalPoints}</p>
                <p className="text-xs text-muted-foreground">Impact Points</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Rewards */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="font-serif text-xl">Recent Activity</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/events">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity yet.</p>
            ) : (
              recentActivity.map((activity, index) => {
                const formattedDate = formatDate(activity.date)
                return (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        activity.type === "event" ? "bg-primary/10" : "bg-destructive/10"
                      }`}>
                        {activity.type === "event" ? (
                          <Calendar className="w-4 h-4 text-primary" />
                        ) : (
                          <Heart className="w-4 h-4 text-destructive" />
                        )}
                      </div>
                      <div>
                        {activity.title && (
                          <p className="font-medium text-sm">{activity.title}</p>
                        )}
                        {formattedDate && (
                          <p className="text-xs text-muted-foreground">{formattedDate}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {activity.status === "upcoming" ? (
                        <Badge variant="outline">Upcoming</Badge>
                      ) : activity.type === "event" && activity.points != null ? (
                        <span className="text-sm font-semibold text-primary">+{activity.points} pts</span>
                      ) : activity.type === "donation" && activity.amount != null ? (
                        <span className="text-sm font-semibold">HK${activity.amount}</span>
                      ) : null}
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* Available Rewards */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-serif text-xl">Available Rewards</CardTitle>
                <CardDescription>Redeem your points for rewards</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/rewards">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {availableRewards.length === 0 ? (
              <p className="text-sm text-muted-foreground">No rewards available yet.</p>
            ) : (
              availableRewards.map((reward) => {
              const canRedeem = reward.canRedeem
              const progress = Math.min((user.totalPoints / reward.pointsRequired) * 100, 100)
              const RewardIcon = resolveIcon(reward.icon)

              return (
                <div key={reward.id} className="p-4 rounded-lg border">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-accent/20">
                      <RewardIcon className="w-5 h-5 text-accent-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{reward.name}</p>
                      {reward.description && (
                        <p className="text-xs text-muted-foreground">{reward.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {user.totalPoints} / {reward.pointsRequired} points
                      </span>
                      {canRedeem && (
                        <span className="text-primary font-medium">Ready to claim!</span>
                      )}
                    </div>
                    <Progress value={progress} className="h-1.5" />
                    <Button 
                      size="sm" 
                      className="w-full mt-2" 
                      disabled={!canRedeem}
                      variant={canRedeem ? "default" : "outline"}
                    >
                      {canRedeem ? "Claim Reward" : `${reward.pointsRequired - user.totalPoints} points needed`}
                    </Button>
                  </div>
                </div>
              )
            })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events CTA */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-xl font-semibold mb-1">Ready for your next adventure?</h3>
              <p className="text-muted-foreground">
                Browse upcoming events and continue making a difference in our community.
              </p>
            </div>
            <Button asChild>
              <Link href="/">
                Explore Events
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
