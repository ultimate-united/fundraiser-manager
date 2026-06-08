import type { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { EventCard } from "@/components/events/event-card"
import { getEventsView } from "@/lib/events"

export const metadata: Metadata = {
  title: 'Events | Ultimate United',
  description: 'Browse upcoming charity events and fundraising opportunities. Join us in making a difference in Hong Kong communities.',
}

export default async function EventsPage() {
  const events = await getEventsView()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero section */}
        <section className="bg-secondary/30 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Upcoming Events
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Discover meaningful ways to contribute to our community through charity runs, 
                celebrations, and educational programs.
              </p>
            </div>
          </div>
        </section>

        {/* Events grid */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>

            {events.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-lg text-muted-foreground">
                  No events scheduled at the moment. Check back soon!
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
