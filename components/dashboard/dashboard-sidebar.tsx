"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  LayoutDashboard, 
  Calendar, 
  Trophy, 
  Heart, 
  Settings,
  Star
} from "lucide-react"
import { cn } from "@/lib/utils"

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

interface DashboardSidebarProps {
  user: UserData
}

const TIER_CONFIG = {
  bronze: { label: "Bronze", color: "bg-amber-700", next: "Silver", pointsNeeded: 200 },
  silver: { label: "Silver", color: "bg-slate-400", next: "Gold", pointsNeeded: 500 },
  gold: { label: "Gold", color: "bg-yellow-500", next: "Platinum", pointsNeeded: 1000 },
  platinum: { label: "Platinum", color: "bg-purple-500", next: null, pointsNeeded: null },
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/events", label: "My Events", icon: Calendar },
  { href: "/dashboard/rewards", label: "Rewards", icon: Trophy },
  { href: "/dashboard/donations", label: "Donations", icon: Heart },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname()
  const tierConfig = TIER_CONFIG[user.tier]
  const progressToNext = tierConfig.pointsNeeded 
    ? Math.min((user.totalPoints / tierConfig.pointsNeeded) * 100, 100)
    : 100

  return (
    <aside className="lg:w-80 flex-shrink-0">
      <Card className="sticky top-24">
        <CardContent className="p-6">
          {/* User Profile */}
          <div className="flex flex-col items-center text-center mb-6">
            <Avatar className="h-20 w-20 mb-4">
              <AvatarImage src={user.avatarUrl || undefined} />
              <AvatarFallback className="text-xl bg-primary/10 text-primary">
                {user.firstName[0]}{user.lastName[0] || ""}
              </AvatarFallback>
            </Avatar>
            <h2 className="font-serif text-xl font-semibold">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <Badge className={cn("mt-2", tierConfig.color)}>
              <Star className="w-3 h-3 mr-1" />
              {tierConfig.label} Member
            </Badge>
          </div>

          {/* Points Progress */}
          <div className="mb-6 p-4 rounded-lg bg-secondary/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Impact Points</span>
              <span className="text-sm font-bold text-primary">{user.totalPoints}</span>
            </div>
            <Progress value={progressToNext} className="h-2 mb-2" />
            {tierConfig.next ? (
              <p className="text-xs text-muted-foreground">
                {tierConfig.pointsNeeded! - user.totalPoints} points to {tierConfig.next}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">Maximum tier reached!</p>
            )}
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </CardContent>
      </Card>
    </aside>
  )
}
