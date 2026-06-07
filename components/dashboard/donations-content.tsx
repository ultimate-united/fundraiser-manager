"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, TrendingUp, Calendar, ChevronRight, Repeat } from "lucide-react"
import Link from "next/link"

interface UserData {
  totalDonated: number
  totalPoints: number
}

interface DonationHistoryItem {
  id: string
  campaign: string
  date: string
  amount: number
  type: "one_time" | "recurring"
  points: number
}

interface RecurringItem {
  id: string
  campaign: string
  amount: number
  frequency: string
  nextDate: string
  status: string
}

interface DonationsContentProps {
  user: UserData
  history: DonationHistoryItem[]
  recurring: RecurringItem[]
}

export function DonationsContent({ user, history, recurring }: DonationsContentProps) {
  const totalThisYear = history.reduce((sum, d) => sum + d.amount, 0)

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">My Donations</h1>
        <p className="text-muted-foreground mt-1">
          Your giving history and active recurring contributions.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
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
                <p className="text-2xl font-bold">HK${totalThisYear}</p>
                <p className="text-xs text-muted-foreground">This Year</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-2 lg:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/20">
                <Repeat className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{recurring.length}</p>
                <p className="text-xs text-muted-foreground">Active Recurring</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="history" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="recurring">Recurring</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-xl">Donation History</CardTitle>
              <CardDescription>{history.length} donations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {history.map((donation) => (
                <div
                  key={donation.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-destructive/10">
                      <Heart className="w-4 h-4 text-destructive" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{donation.campaign}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{donation.date}</span>
                        {donation.type === "recurring" && (
                          <Badge variant="secondary" className="text-xs py-0">Recurring</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">HK${donation.amount}</p>
                    <p className="text-xs text-primary">+{donation.points} pts</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="text-center">
            <Button variant="outline" asChild>
              <Link href="/donate">
                Make a Donation <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="recurring" className="space-y-4">
          {recurring.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Repeat className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-serif font-semibold">{item.campaign}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.frequency} · Next: {item.nextDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-bold">HK${item.amount}</p>
                    <Badge className="bg-green-500/10 text-green-600" variant="secondary">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif font-semibold">Set up a recurring donation</h3>
                <p className="text-sm text-muted-foreground">Make a bigger impact with monthly giving.</p>
              </div>
              <Button asChild>
                <Link href="/donate">Donate Now</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
