"use client"

import { useState } from "react"
import Link from "next/link"
import { Clock, Heart, Building, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CONTRIBUTION_ICONS } from "@/components/events/contribution-icons"
import type { Event } from "@/lib/types"

interface EventTabsProps {
  event: Event
  /** True when the signed-in user already has an active registration. */
  isRegistered?: boolean
}

export function EventTabs({ event, isRegistered = false }: EventTabsProps) {
  const tc = event.tabContent
  // Overview always shows; the rest only when their section is enabled.
  const tabs = [
    { id: "overview", label: "Overview" },
    ...(tc?.schedule.enabled ? [{ id: "schedule", label: "Schedule" }] : []),
    ...(tc?.contribution.enabled ? [{ id: "contribute", label: "How to Contribute" }] : []),
    ...(tc?.sponsors.enabled ? [{ id: "sponsors", label: "Sponsors" }] : []),
  ]
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Tab navigation */}
        <div className="border-b border-border">
          <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        <div className="mt-8">
          {activeTab === "overview" && <OverviewTab event={event} />}
          {activeTab === "schedule" && <ScheduleTab event={event} />}
          {activeTab === "contribute" && <ContributeTab event={event} isRegistered={isRegistered} />}
          {activeTab === "sponsors" && <SponsorsTab event={event} />}
        </div>
      </div>
    </section>
  )
}

function OverviewTab({ event }: { event: Event }) {
  const tc = event.tabContent?.overview
  return (
    <div className="prose prose-lg max-w-none">
      <h2 className="font-serif text-2xl font-semibold text-foreground">{tc?.title}</h2>
      <p className="mt-4 text-muted-foreground leading-relaxed">{tc?.body}</p>

      {event.overviewCards.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {event.overviewCards.map((card, i) => {
            const Icon = CONTRIBUTION_ICONS[card.icon] ?? Heart
            return (
              <div key={i} className="rounded-xl border border-border bg-card p-6">
                <Icon className="h-8 w-8 text-primary" />
                <h3 className="mt-4 font-semibold text-foreground">{card.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{card.body}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ScheduleTab({ event }: { event: Event }) {
  const tc = event.tabContent?.schedule
  return (
    <div>
      <h2 className="font-serif text-2xl font-semibold text-foreground">{tc?.title}</h2>
      <p className="mt-2 text-muted-foreground">{tc?.body}</p>

      <div className="mt-8 space-y-4">
        {event.schedule.map((item, index) => (
          <div
            key={item.id}
            className="relative flex gap-6 rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/30"
          >
            <div className="flex-shrink-0 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <p className="mt-2 text-sm font-semibold text-foreground">{item.time}</p>
              {item.endTime && <p className="text-xs text-muted-foreground">to {item.endTime}</p>}
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{item.title}</h3>
              {item.description && (
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              )}
              {item.location && <p className="mt-2 text-xs text-primary">{item.location}</p>}
            </div>

            {index < event.schedule.length - 1 && (
              <div className="absolute bottom-0 left-[2.75rem] h-4 w-px translate-y-full bg-border" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function ContributeTab({ event, isRegistered = false }: { event: Event; isRegistered?: boolean }) {
  const tc = event.tabContent?.contribution

  return (
    <div>
      <h2 className="font-serif text-2xl font-semibold text-foreground">{tc?.title}</h2>
      <p className="mt-2 text-muted-foreground">{tc?.body}</p>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {event.contributionTypes.map((contribution, i) => {
          const Icon = CONTRIBUTION_ICONS[contribution.icon] ?? Heart
          const isSignup = contribution.cta === "signup"
          return (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">{contribution.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {contribution.body}
              </p>
              {isSignup && isRegistered ? (
                <Button className="mt-4 w-full" variant="outline" disabled>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  You&apos;re registered
                </Button>
              ) : (
                <Button className="mt-4 w-full" variant="outline" asChild>
                  <Link
                    href={
                      isSignup ? `/events/${event.slug}/register` : `/donate?event=${event.slug}`
                    }
                  >
                    {isSignup ? "Sign Up" : "Donate Now"}
                  </Link>
                </Button>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
        <h3 className="font-serif text-xl font-semibold text-foreground">
          Can&apos;t attend but want to help?
        </h3>
        <p className="mx-auto mt-2 max-w-lg text-muted-foreground">
          You can still make a difference by donating to this event. Every contribution, no matter
          the size, helps us reach our goal.
        </p>
        <Button size="lg" className="mt-6" asChild>
          <Link href={`/donate?event=${event.slug}`}>Make a Donation</Link>
        </Button>
      </div>
    </div>
  )
}

function SponsorsTab({ event }: { event: Event }) {
  const tc = event.tabContent?.sponsors
  const tierOrder = { platinum: 0, gold: 1, silver: 2, bronze: 3 }
  const sortedSponsors = [...event.sponsors].sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier])

  const tierStyles = {
    platinum: "border-2 border-primary bg-primary/5",
    gold: "border-2 border-accent bg-accent/5",
    silver: "border border-border bg-secondary/50",
    bronze: "border border-border bg-card",
  }

  return (
    <div>
      <h2 className="font-serif text-2xl font-semibold text-foreground">{tc?.title}</h2>
      <p className="mt-2 text-muted-foreground">{tc?.body}</p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {sortedSponsors.map((sponsor) => (
          <div
            key={sponsor.id}
            className={`rounded-xl p-6 text-center transition-shadow hover:shadow-md ${tierStyles[sponsor.tier]}`}
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
              <Building className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 font-semibold text-foreground">{sponsor.name}</h3>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-primary">
              {sponsor.tier} Sponsor
            </p>
          </div>
        ))}
      </div>

      {/* Always shown, per spec */}
      <div className="mt-12 text-center">
        <h3 className="font-semibold text-foreground">Interested in sponsoring?</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Contact us to learn about sponsorship opportunities
        </p>
        <Button variant="outline" className="mt-4">
          Become a Sponsor
        </Button>
      </div>
    </div>
  )
}
