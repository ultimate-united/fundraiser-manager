import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { DonationForm } from "@/components/donate/donation-form"
import { DonationImpact } from "@/components/donate/donation-impact"
import { AlternativeDonationMethods } from "@/components/donate/alternative-donation-methods"
import { getEventView } from "@/lib/events"
import { getRecentSupporters } from "@/lib/api/donations"
import { createClient } from "@/lib/supabase/server"
import { Heart } from "lucide-react"

interface DonatePageProps {
  searchParams: Promise<{ event?: string }>
}

export default async function DonatePage({ searchParams }: DonatePageProps) {
  const { event: eventSlug } = await searchParams
  const event = eventSlug ? await getEventView(eventSlug) : null
  const supporters = await getRecentSupporters(event?.id ?? null)

  // Prefill donor details for logged-in users (donating is open to guests too).
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const defaultName = user
    ? [user.user_metadata?.first_name, user.user_metadata?.last_name].filter(Boolean).join(" ")
    : ""
  const defaultEmail = user?.email ?? ""

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-primary/5 py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
              {event ? `Support ${event.title}` : "Make a Difference Today"}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              {event
                ? event.mission ||
                  "Your generous donation directly supports this event and the community it serves."
                : "Your generous donation helps us continue our mission of promoting education and providing resources to underprivileged communities in Hong Kong."}
            </p>
          </div>
        </section>

        {/* Donation Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <div className="space-y-8">
                <DonationForm
                  eventId={event?.id ?? null}
                  eventTitle={event?.title ?? null}
                  defaultName={defaultName}
                  defaultEmail={defaultEmail}
                />
                <AlternativeDonationMethods eventTitle={event?.title ?? null} />
              </div>
              <DonationImpact impact={event?.impact} supporters={supporters} />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
