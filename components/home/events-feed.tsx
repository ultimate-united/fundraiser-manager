import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EventCard } from "@/components/events/event-card"
import type { Event } from "@/lib/types"

interface EventsFeedProps {
  events: Event[]
  showViewAll?: boolean
}

export function EventsFeed({ events, showViewAll = true }: EventsFeedProps) {
  const featuredEvent = events.find(e => e.featured)
  const otherEvents = events.filter(e => !e.featured).slice(0, 2)

  return (
    <section className="bg-secondary/30 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Upcoming Events
            </h2>
            <p className="mt-2 text-lg text-muted-foreground">
              Join us in making a difference in our community
            </p>
          </div>
          {showViewAll && (
            <Button variant="ghost" className="hidden sm:flex" asChild>
              <Link href="/events">
                View All Events
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredEvent && (
            <div className="md:col-span-2 lg:col-span-2">
              <EventCard event={featuredEvent} featured />
            </div>
          )}
          {otherEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

        {showViewAll && (
          <div className="mt-8 text-center sm:hidden">
            <Button variant="outline" asChild>
              <Link href="/events">
                View All Events
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
