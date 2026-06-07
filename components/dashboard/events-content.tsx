"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, ChevronRight } from "lucide-react"
import Link from "next/link"

interface UserData {
  eventsAttended: number
  hoursVolunteered: number
}

export interface UpcomingEvent {
  id: string
  title: string
  date: string
  location: string
  points: number
}

export interface PastEvent {
  id: string
  title: string
  date: string
  location: string
  hoursLogged: number
  pointsEarned: number
}

interface EventsContentProps {
  user: UserData
  upcomingEvents: UpcomingEvent[]
  pastEvents: PastEvent[]
}

export function EventsContent({ user, upcomingEvents, pastEvents }: EventsContentProps) {
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
          <TabsTrigger value="upcoming">Upcoming ({upcomingEvents.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({pastEvents.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingEvents.map((event) => (
            <Card key={event.id}>
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-serif font-semibold text-lg">{event.title}</h3>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span>{event.location}</span>
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
              <Link href="/">
                Browse More Events <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastEvents.map((event) => (
            <Card key={event.id}>
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-serif font-semibold">{event.title}</h3>
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
