import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { EventHero } from "@/components/events/event-hero"
import { EventTabs } from "@/components/events/event-tabs"
import { getEventView } from "@/lib/events"
import { isRegisteredForEvent } from "@/lib/registrations"

interface EventPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params
  const event = await getEventView(slug)

  if (!event) {
    return {
      title: 'Event Not Found',
    }
  }

  return {
    title: `${event.title} | Ultimate United`,
    description: event.mission,
    openGraph: {
      title: event.title,
      description: event.mission,
      type: 'website',
      images: event.bannerImage ? [{ url: event.bannerImage }] : [],
    },
  }
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params
  const event = await getEventView(slug)

  if (!event) {
    notFound()
  }

  const isRegistered = await isRegisteredForEvent(event.id)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <EventHero event={event} isRegistered={isRegistered} />
        <EventTabs event={event} isRegistered={isRegistered} />
      </main>
      <Footer />
    </div>
  )
}
