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
  CheckCircle2
} from "lucide-react"
import { cn } from "@/lib/utils"

interface UserData {
  id: string
  totalPoints: number
  tier: "bronze" | "silver" | "gold" | "platinum"
  eventsAttended: number
}

interface RewardsContentProps {
  user: UserData
}

const BADGES = [
  { 
    id: "first-event",
    name: "First Steps",
    description: "Attended your first event",
    icon: Calendar,
    earned: true,
    earnedDate: "Jan 15, 2026"
  },
  { 
    id: "five-events",
    name: "Community Regular",
    description: "Attended 5 events",
    icon: Users,
    earned: true,
    earnedDate: "Mar 22, 2026"
  },
  { 
    id: "ten-events",
    name: "Community Champion",
    description: "Attended 10 events",
    icon: Trophy,
    earned: false,
    requirement: "Attend 2 more events"
  },
  { 
    id: "first-donation",
    name: "Generous Heart",
    description: "Made your first donation",
    icon: Heart,
    earned: true,
    earnedDate: "Feb 1, 2026"
  },
  { 
    id: "monthly-donor",
    name: "Sustained Supporter",
    description: "Donated 3 months in a row",
    icon: Sparkles,
    earned: false,
    requirement: "Donate for 1 more month"
  },
  { 
    id: "volunteer-star",
    name: "Volunteer Star",
    description: "Volunteered 50+ hours",
    icon: Star,
    earned: false,
    requirement: "26 more volunteer hours needed"
  },
]

const REDEEMABLE_REWARDS = [
  {
    id: "partner-discount",
    name: "Partner Store Discount",
    description: "10% off at participating local stores",
    pointsRequired: 250,
    icon: Gift,
    category: "discount"
  },
  {
    id: "exclusive-event",
    name: "Exclusive Event Access",
    description: "VIP access to our annual gala dinner",
    pointsRequired: 500,
    icon: Star,
    category: "experience"
  },
  {
    id: "merch-voucher",
    name: "Merchandise Voucher",
    description: "HK$100 voucher for Ultimate United merch",
    pointsRequired: 300,
    icon: Gift,
    category: "discount"
  },
  {
    id: "recognition-wall",
    name: "Recognition Wall Feature",
    description: "Your name featured on our donor wall",
    pointsRequired: 1000,
    icon: Award,
    category: "recognition"
  },
]

const TIER_BENEFITS = {
  bronze: [
    "Access to community events",
    "Monthly newsletter",
    "Digital membership card"
  ],
  silver: [
    "All Bronze benefits",
    "Early event registration",
    "5% partner store discount",
    "Quarterly impact reports"
  ],
  gold: [
    "All Silver benefits",
    "Priority volunteer placement",
    "10% partner store discount",
    "Invitation to donor appreciation events"
  ],
  platinum: [
    "All Gold benefits",
    "Personal impact coordinator",
    "15% partner store discount",
    "VIP seating at all events",
    "Annual recognition ceremony"
  ]
}

export function RewardsContent({ user }: RewardsContentProps) {
  const earnedBadges = BADGES.filter(b => b.earned)
  const availableBadges = BADGES.filter(b => !b.earned)

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
                <p className="font-semibold">{earnedBadges.length}/{BADGES.length}</p>
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
                {earnedBadges.map((badge) => (
                  <div 
                    key={badge.id}
                    className="p-4 rounded-lg border-2 border-primary/20 bg-primary/5"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-full bg-primary/20">
                        <badge.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{badge.name}</p>
                        <p className="text-xs text-muted-foreground">Earned {badge.earnedDate}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{badge.description}</p>
                  </div>
                ))}
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
                {availableBadges.map((badge) => (
                  <div 
                    key={badge.id}
                    className="p-4 rounded-lg border border-dashed border-muted-foreground/30 opacity-75"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-full bg-muted">
                        <badge.icon className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold">{badge.name}</p>
                        <p className="text-xs text-primary">{badge.requirement}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{badge.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Redeem Tab */}
        <TabsContent value="redeem" className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            {REDEEMABLE_REWARDS.map((reward) => {
              const canRedeem = user.totalPoints >= reward.pointsRequired
              const progress = Math.min((user.totalPoints / reward.pointsRequired) * 100, 100)

              return (
                <Card key={reward.id} className={cn(!canRedeem && "opacity-75")}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={cn(
                        "p-3 rounded-lg",
                        canRedeem ? "bg-primary/10" : "bg-muted"
                      )}>
                        <reward.icon className={cn(
                          "w-6 h-6",
                          canRedeem ? "text-primary" : "text-muted-foreground"
                        )} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{reward.name}</h3>
                        <p className="text-sm text-muted-foreground">{reward.description}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{user.totalPoints} / {reward.pointsRequired} pts</span>
                        {canRedeem && <span className="text-primary font-medium">Available!</span>}
                      </div>
                      <Progress value={progress} className="h-2" />
                      <Button 
                        className="w-full mt-2" 
                        disabled={!canRedeem}
                        variant={canRedeem ? "default" : "outline"}
                      >
                        {canRedeem ? "Redeem Now" : `Need ${reward.pointsRequired - user.totalPoints} more pts`}
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
            {(Object.entries(TIER_BENEFITS) as [keyof typeof TIER_BENEFITS, string[]][]).map(([tier, benefits]) => {
              const isCurrentTier = tier === user.tier
              const tierColors = {
                bronze: "border-amber-700/50 bg-amber-700/5",
                silver: "border-slate-400/50 bg-slate-400/5",
                gold: "border-yellow-500/50 bg-yellow-500/5",
                platinum: "border-purple-500/50 bg-purple-500/5"
              }

              return (
                <Card 
                  key={tier}
                  className={cn(
                    "border-2 transition-all",
                    isCurrentTier ? tierColors[tier] : "border-border"
                  )}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="font-serif text-xl capitalize">{tier}</CardTitle>
                      {isCurrentTier && (
                        <Badge variant="outline" className="border-primary text-primary">
                          Current Tier
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className={cn(
                            "w-4 h-4 mt-0.5 flex-shrink-0",
                            isCurrentTier ? "text-primary" : "text-muted-foreground"
                          )} />
                          <span className={isCurrentTier ? "text-foreground" : "text-muted-foreground"}>
                            {benefit}
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
