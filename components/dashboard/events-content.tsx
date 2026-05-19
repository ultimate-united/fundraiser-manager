"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, Users, ChevronRight } from "lucide-react"
import Link from "next/link"

interface UserData {
  eventsAttended: number
  hoursVolunteered: number
}

interface EventsContentProps {
  user: UserData
}

const UPCOMING_EVENTS = [
  {
    id: "1",
    title: "Youth Mentorship Program",
    date: "2026-05-28",
    time: "10:00 AM – 1:00 PM",
    location: "Wan Chai Community Centre",
    category: "Education",
    spotsLeft: 4,
    points: 50,
  },
  {
    id: "2",
    title: "Coastal Cleanup Drive",
    date: "2026-06-07",
    time: "8:00 AM – 12:00 PM",
    location: "Repulse Bay Beach",
    category: "Environment",
    spotsLeft: 12,
    points: 30,
  },
  {
    id: "3",
    title: "Food Bank Volunteer Day",
    date: "2026-06-14",
    time: "9:00 AM – 3:00 PM",
    location: "Foodlink Foundation, Kwun Tong",
    category: "Community",
    spotsLeft: 2,
    points: 60,
  },
]

const PAST_EVENTS = [
  {
    id: "4",
    title: "Beach Cleanup Drive",
    date: "2026-05-15",
    location: "Stanley Main Beach",
    category: "Environment",
    hoursLogged: 4,
    pointsEarned: 25,
  },
  {
    id: "5",
    title: "Senior Centre Visit",
    date: "2026-04-20",
    location: "Shatin Elderly Services",
    category: "Community",
    hoursLogged: 3,
    pointsEarned: 30,
  },
  {
    id: "6",
    title: "Charity Fun Run",
    date: "2026-03-30",
    location: "Victoria Park",
    category: "Sports",
    hoursLogged: 2,
    pointsEarned: 20,
  },
]

const CATEGORY_COLORS: Record<string, string> = {
  Education: "bg-blue-500/10 text-blue-600",
  Environment: "bg-green-500/10 text-green-600",
  Community: "bg-orange-500/10 text-orange-600",
  Sports: "bg-purple-500/10 text-purple-600",
}

export function EventsContent({ user }: EventsContentProps) {
  return (
    <div className="flex-1 space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">My Events</h1>
        <p className="text-muted-foreground mt-1">
          Track your registered and past volunteer events.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
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
      </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">Upcoming ({UPCOMING_EVENTS.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({PAST_EVENTS.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {UPCOMING_EVENTS.map((event) => (
            <Card key={event.id}>
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-serif font-semibold text-lg">{event.title}</h3>
                      <Badge className={CATEGORY_COLORS[event.category]} variant="secondary">
                        {event.category}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>{event.date} · {event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 flex-shrink-0" />
                        <span className={event.spotsLeft <= 3 ? "text-destructive font-medium" : ""}>
                          {event.spotsLeft} spots left
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-sm font-semibold text-primary">+{event.points} pts</span>
                    <Badge variant="outline">Registered</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <div className="text-center pt-2">
            <Button variant="outline" asChild>
              <Link href="/events">
                Browse More Events <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {PAST_EVENTS.map((event) => (
            <Card key={event.id}>
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-serif font-semibold">{event.title}</h3>
                      <Badge className={CATEGORY_COLORS[event.category]} variant="secondary">
                        {event.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" /> {event.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> {event.location}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">{event.hoursLogged}h logged</span>
                    <span className="font-semibold text-primary">+{event.pointsEarned} pts</span>
                    <Badge variant="secondary">Completed</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
