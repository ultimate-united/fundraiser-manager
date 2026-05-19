import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { EventHero } from "@/components/events/event-hero"
import { EventTabs } from "@/components/events/event-tabs"
import { getEventBySlug, mockEvents } from "@/lib/mock-data"

interface EventPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return mockEvents.map((event) => ({
    slug: event.slug,
  }))
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params
  const event = getEventBySlug(slug)
  
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
  const event = getEventBySlug(slug)

  if (!event) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <EventHero event={event} />
        <EventTabs event={event} />
      </main>
      <Footer />
    </div>
  )
}
