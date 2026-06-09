import { notFound, redirect } from "next/navigation"
import type { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { RegistrationForm } from "@/components/events/registration-form"
import { getEventView } from "@/lib/events"
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

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <RegistrationForm
            eventId={event.id}
            eventTitle={event.title}
            defaultName={defaultName}
            defaultEmail={user.email ?? ""}
          />
        </div>
      </main>
      <Footer />
    </div>
  )
}
