import Link from "next/link"
import { Calendar, MapPin, Users, Share2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { Event } from "@/lib/types"

interface EventHeroProps {
  event: Event
  /** True when the signed-in user already has an active registration. */
  isRegistered?: boolean
}

export function EventHero({ event, isRegistered = false }: EventHeroProps) {
  const progressPercentage = (event.amountRaised / event.fundraisingGoal) * 100
  const formattedDate = new Date(event.date).toLocaleDateString('en-HK', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const formattedTime = new Date(event.date).toLocaleTimeString('en-HK', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <section className="relative">
      {/* Banner image (temporary — pending S3) */}
      <div className="relative h-64 bg-secondary sm:h-80 lg:h-96">
        <img
          src="/run_hero_banner.jpeg"
          alt={event.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="-mt-16 relative z-10 rounded-2xl border border-border bg-card p-6 shadow-lg sm:p-8 lg:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
            {/* Left: Event details */}
            <div className="flex-1">
              {/* Status badge */}
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                  event.status === 'upcoming' 
                    ? 'bg-primary/10 text-primary' 
                    : event.status === 'ongoing'
                    ? 'bg-accent/50 text-accent-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </span>
                {event.featured && (
                  <span className="inline-flex items-center rounded-full bg-accent/50 px-3 py-1 text-xs font-medium text-accent-foreground">
                    Featured Event
                  </span>
                )}
              </div>

              {/* Title & subtitle */}
              <h1 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {event.title}
              </h1>
              {event.subtitle && (
                <p className="mt-2 text-lg text-primary font-medium">
                  {event.subtitle}
                </p>
              )}

              {/* Mission statement - prominently displayed */}
              <div className="mt-6 rounded-xl bg-primary/5 border border-primary/10 p-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-primary">
                  Our Mission
                </h2>
                <p className="mt-2 text-foreground leading-relaxed">
                  {event.mission}
                </p>
              </div>

              {/* Event details */}
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-secondary">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date & Time</p>
                    <p className="font-medium text-foreground">{formattedDate}</p>
                    <p className="text-sm text-muted-foreground">{formattedTime}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-secondary">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium text-foreground">{event.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-secondary">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Participants</p>
                    <p className="font-medium text-foreground">
                      {event.participantCount}
                      {event.participantGoal && ` / ${event.participantGoal}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Fundraising progress card */}
            <div className="w-full lg:w-80">
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h3 className="font-serif text-lg font-semibold text-foreground">
                  Fundraising Progress
                </h3>

                <div className="mt-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-bold text-foreground">
                      HK${event.amountRaised.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      raised
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    of HK${event.fundraisingGoal.toLocaleString()} goal
                  </p>
                </div>

                <Progress value={progressPercentage} className="mt-4 h-3" />

                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="font-medium text-primary">
                    {Math.round(progressPercentage)}% funded
                  </span>
                  <span className="text-muted-foreground">
                    {event.participantCount} supporters
                  </span>
                </div>

                <div className="mt-6 space-y-3">
                  <Button className="w-full" size="lg" asChild>
                    <Link href={`/donate?event=${event.slug}`}>Donate Now</Link>
                  </Button>
                  {isRegistered ? (
                    <Button variant="outline" className="w-full" size="lg" disabled>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      You&apos;re registered
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full" size="lg" asChild>
                      <Link href={`/events/${event.slug}/register`}>Register to Participate</Link>
                    </Button>
                  )}
                </div>

                <Button variant="ghost" size="sm" className="mt-4 w-full">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share This Event
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
