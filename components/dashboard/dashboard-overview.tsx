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
  Star
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

interface DashboardOverviewProps {
  user: UserData
}

// Mock data for recent activity
const RECENT_ACTIVITY = [
  { 
    type: "event", 
    title: "Beach Cleanup Drive", 
    date: "May 15, 2026", 
    points: 25,
    status: "completed"
  },
  { 
    type: "donation", 
    title: "Monthly Contribution", 
    date: "May 1, 2026", 
    amount: 100,
    status: "completed"
  },
  { 
    type: "event", 
    title: "Youth Mentorship Program", 
    date: "May 28, 2026", 
    points: 50,
    status: "upcoming"
  },
]

const AVAILABLE_REWARDS = [
  { 
    id: "1", 
    name: "Community Champion Badge", 
    pointsRequired: 300,
    icon: Award,
    description: "Awarded for attending 10+ events"
  },
  { 
    id: "2", 
    name: "Partner Store Discount", 
    pointsRequired: 250,
    icon: Star,
    description: "10% off at participating local stores"
  },
]

export function DashboardOverview({ user }: DashboardOverviewProps) {
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
            {RECENT_ACTIVITY.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    activity.type === "event" ? "bg-primary/10" : "bg-destructive/10"
                  }`}>
                    {activity.type === "event" ? (
                      <Calendar className={`w-4 h-4 ${
                        activity.type === "event" ? "text-primary" : "text-destructive"
                      }`} />
                    ) : (
                      <Heart className="w-4 h-4 text-destructive" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  {activity.status === "upcoming" ? (
                    <Badge variant="outline">Upcoming</Badge>
                  ) : activity.points ? (
                    <span className="text-sm font-semibold text-primary">+{activity.points} pts</span>
                  ) : (
                    <span className="text-sm font-semibold">HK${activity.amount}</span>
                  )}
                </div>
              </div>
            ))}
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
            {AVAILABLE_REWARDS.map((reward) => {
              const canRedeem = user.totalPoints >= reward.pointsRequired
              const progress = Math.min((user.totalPoints / reward.pointsRequired) * 100, 100)
              
              return (
                <div key={reward.id} className="p-4 rounded-lg border">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-accent/20">
                      <reward.icon className="w-5 h-5 text-accent-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{reward.name}</p>
                      <p className="text-xs text-muted-foreground">{reward.description}</p>
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
            })}
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
