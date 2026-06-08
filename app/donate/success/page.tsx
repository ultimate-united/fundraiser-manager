import Link from "next/link"
import type { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Clock } from "lucide-react"

export const metadata: Metadata = {
  title: "Donation received | Ultimate United",
}

interface SuccessPageProps {
  // `redirect_status` is appended for redirect-based one-time methods (e.g. 3DS);
  // `recurring=1` is set by the subscription Checkout success URL.
  searchParams: Promise<{ redirect_status?: string; recurring?: string }>
}

export default async function DonateSuccessPage({ searchParams }: SuccessPageProps) {
  const { redirect_status, recurring } = await searchParams
  const failed = redirect_status === "failed"
  const processing = redirect_status === "processing"
  const isRecurring = recurring === "1"

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            {processing ? (
              <Clock className="h-8 w-8 text-primary" />
            ) : (
              <CheckCircle2 className="h-8 w-8 text-primary" />
            )}
          </div>
          <h1 className="font-serif text-3xl font-semibold text-foreground">
            {failed ? "Payment not completed" : processing ? "Payment processing" : "Thank you!"}
          </h1>
          <p className="mt-4 text-muted-foreground">
            {failed
              ? "Your payment wasn't completed. Please try again — you haven't been charged."
              : processing
                ? "Your payment is processing. We'll email your receipt once it clears."
                : isRecurring
                  ? "Your monthly donation is set up — thank you! Stripe will bill it automatically, and you can view it anytime in your dashboard."
                  : "Your donation has been received. A receipt is on its way to your email, and your points will appear in your dashboard shortly."}
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button asChild variant="outline">
              <Link href="/">Back to events</Link>
            </Button>
            {failed ? (
              <Button asChild>
                <Link href="/donate">Try again</Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href="/dashboard">View my dashboard</Link>
              </Button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
