import Link from "next/link"
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { Event } from "@/lib/types"

interface EventCardProps {
  event: Event
  featured?: boolean
}

export function EventCard({ event, featured = false }: EventCardProps) {
  const progressPercentage = (event.amountRaised / event.fundraisingGoal) * 100
  const formattedDate = new Date(event.date).toLocaleDateString('en-HK', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border border-border bg-card transition-all hover:shadow-lg ${
        featured ? 'md:col-span-2 md:row-span-2' : ''
      }`}
    >
      {/* Banner image (temporary — pending S3) */}
      <div className={`relative overflow-hidden bg-secondary ${featured ? 'h-64 md:h-80' : 'h-48'}`}>
        <img
          src="/run_hero_banner.jpeg"
          alt={event.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {/* Status badge */}
        <div className="absolute left-4 top-4">
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
            event.status === 'upcoming' 
              ? 'bg-primary/90 text-primary-foreground' 
              : event.status === 'ongoing'
              ? 'bg-accent text-accent-foreground'
              : 'bg-muted text-muted-foreground'
          }`}>
            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
          </span>
        </div>
        {featured && (
          <div className="absolute right-4 top-4">
            <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
              Featured
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Mission tagline */}
        <p className="text-xs font-medium uppercase tracking-wider text-primary">
          {event.subtitle || 'Community Event'}
        </p>

        <h3 className={`mt-2 font-serif font-semibold text-foreground ${featured ? 'text-2xl' : 'text-xl'}`}>
          <Link href={`/events/${event.slug}`} className="hover:text-primary">
            {event.title}
            <span className="absolute inset-0" />
          </Link>
        </h3>

        {/* Event details */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <span>{event.participantCount} participants</span>
          </div>
        </div>

        {/* Mission excerpt */}
        <p className={`mt-4 text-muted-foreground ${featured ? 'line-clamp-3' : 'line-clamp-2'}`}>
          {event.mission}
        </p>

        {/* Fundraising progress */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">
              HK${event.amountRaised.toLocaleString()} raised
            </span>
            <span className="text-muted-foreground">
              of HK${event.fundraisingGoal.toLocaleString()}
            </span>
          </div>
          <Progress value={progressPercentage} className="mt-2 h-2" />
          <p className="mt-1 text-xs text-muted-foreground">
            {Math.round(progressPercentage)}% of goal reached
          </p>
        </div>

        {/* CTA */}
        <div className="mt-6">
          <Button variant="outline" size="sm" className="group/btn" asChild>
            <Link href={`/events/${event.slug}`}>
              Learn More
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  )
}
