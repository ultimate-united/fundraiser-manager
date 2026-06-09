import { notFound, redirect } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RegistrationForm } from "@/components/events/registration-form"
import { getEventView } from "@/lib/events"
import { getMyRegistrations } from "@/lib/api/registrations"
import { createClient } from "@/lib/supabase/server"

interface RegisterPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: RegisterPageProps): Promise<Metadata> {
  const { slug } = await params
  const event = await getEventView(slug)
  return { title: event ? `Register · ${event.title} | Ultimate United` : "Register" }
}

export default async function RegisterPage({ params }: RegisterPageProps) {
  const { slug } = await params
  const event = await getEventView(slug)
  if (!event) notFound()

  // Login-gated: send anonymous visitors to sign in, then back here.
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/auth/login?redirect=/events/${slug}/register`)

  const defaultName = [user.user_metadata?.first_name, user.user_metadata?.last_name]
    .filter(Boolean)
    .join(" ")

  // Block re-registration if they already have an active sign-up for this event.
  let alreadyRegistered = false
  try {
    const registrations = await getMyRegistrations()
    alreadyRegistered = registrations.some((r) => r.event_id === event.id && r.status !== "cancelled")
  } catch {
    alreadyRegistered = false
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          {alreadyRegistered ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <h1 className="font-serif text-2xl font-semibold text-foreground">
                  You&apos;re already registered
                </h1>
                <p className="max-w-md text-muted-foreground">
                  You&apos;ve signed up for {event.title} and we have your details. See you there!
                </p>
                <div className="mt-2 flex gap-3">
                  <Button asChild variant="outline">
                    <Link href={`/events/${event.slug}`}>Back to event</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/dashboard/events">My events</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <RegistrationForm
              eventId={event.id}
              eventTitle={event.title}
              defaultName={defaultName}
              defaultEmail={user.email ?? ""}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
