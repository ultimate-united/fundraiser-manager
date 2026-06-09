"use client"

import { useActionState, useState } from "react"
import Link from "next/link"
import { Elements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Heart, CreditCard, Loader2, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { getStripe } from "@/lib/stripe/client"
import { submitDonation, type DonationFormState } from "@/app/donate/actions"
import { PaymentStep } from "@/components/donate/payment-step"

const PRESET_AMOUNTS = [50, 100, 250, 500, 1000]

interface DonationFormProps {
  /** When present, the donation is attributed to this event (else general fund). */
  eventId?: string | null
  eventTitle?: string | null
  /** Prefill from the logged-in account (empty for guests). */
  defaultName?: string
  defaultEmail?: string
}

function SuccessCard({ message }: { message: string }) {
  return (
    <Card className="border-2">
      <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <h2 className="font-serif text-2xl font-semibold text-foreground">Thank you!</h2>
        <p className="max-w-md text-muted-foreground">{message}</p>
        <div className="mt-2 flex gap-3">
          <Button asChild variant="outline">
            <Link href="/">Back to events</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">View my dashboard</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function DonationForm({
  eventId = null,
  eventTitle = null,
  defaultName = "",
  defaultEmail = "",
}: DonationFormProps) {
  const [amount, setAmount] = useState<number | null>(100)
  const [customAmount, setCustomAmount] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [frequency, setFrequency] = useState<"one_time" | "monthly">("one_time")
  const [paid, setPaid] = useState(false)
  const [state, formAction, pending] = useActionState<DonationFormState, FormData>(submitDonation, null)

  const handlePresetClick = (preset: number) => {
    setAmount(preset)
    setCustomAmount("")
  }

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value)
    const parsed = parseInt(value, 10)
    setAmount(isNaN(parsed) ? null : parsed)
  }

  // 1) Card paid inline, or a non-card success (monthly / stub).
  if (paid) {
    return <SuccessCard message="Payment received — thank you! A receipt is on its way to your email." />
  }
  if (state?.status === "success") {
    return <SuccessCard message={state.message} />
  }

  // 2) Donation recorded + PaymentIntent created → collect the card.
  if (state?.status === "needs_payment") {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Complete your donation</CardTitle>
          <CardDescription>
            You&apos;re donating HK${state.amount}
            {eventTitle ? ` to ${eventTitle}` : ""}. Enter your card to finish.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Elements
            stripe={getStripe()}
            options={{ clientSecret: state.clientSecret, appearance: { theme: "stripe" } }}
          >
            <PaymentStep amount={state.amount} onPaid={() => setPaid(true)} />
          </Elements>
        </CardContent>
      </Card>
    )
  }

  // 3) Details step.
  const submitLabel =
    frequency === "monthly" ? `Set up HK$${amount || 0}/month` : `Continue to payment`

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="font-serif text-2xl">Choose Your Donation Amount</CardTitle>
        <CardDescription>
          {eventTitle ? `Supporting ${eventTitle}. ` : ""}All donations are tax-deductible. You&apos;ll
          receive a receipt via email.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          <input type="hidden" name="amount" value={amount ?? ""} />
          <input type="hidden" name="frequency" value={frequency} />
          <input type="hidden" name="is_anonymous" value={isAnonymous ? "true" : "false"} />
          {eventId && <input type="hidden" name="event_id" value={eventId} />}

          {/* Frequency */}
          <div className="grid grid-cols-2 gap-3">
            {(["one_time", "monthly"] as const).map((f) => (
              <Button
                key={f}
                type="button"
                variant={frequency === f ? "default" : "outline"}
                className="h-12"
                onClick={() => setFrequency(f)}
              >
                {f === "one_time" ? "One-time" : "Monthly"}
              </Button>
            ))}
          </div>

          {/* Preset Amounts */}
          <div className="grid grid-cols-3 gap-3">
            {PRESET_AMOUNTS.map((preset) => (
              <Button
                key={preset}
                type="button"
                variant={amount === preset && !customAmount ? "default" : "outline"}
                className={cn(
                  "h-14 text-lg font-semibold",
                  amount === preset && !customAmount && "ring-2 ring-primary ring-offset-2",
                )}
                onClick={() => handlePresetClick(preset)}
              >
                HK${preset}
              </Button>
            ))}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-muted-foreground">
                HK$
              </span>
              <Input
                type="number"
                placeholder="Other"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                className="h-14 pl-12 text-lg font-semibold"
                min={10}
              />
            </div>
          </div>

          {/* Donor Information */}
          <div className="space-y-4 border-t pt-4">
            <div className="space-y-2">
              <Label htmlFor="donor_name">Your Name</Label>
              <Input
                id="donor_name"
                name="donor_name"
                placeholder="John Doe"
                defaultValue={defaultName}
                disabled={isAnonymous}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="donor_email">Email Address</Label>
              <Input
                id="donor_email"
                name="donor_email"
                type="email"
                placeholder="john@example.com"
                defaultValue={defaultEmail}
                required={frequency === "one_time"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Leave a message of support..."
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="anonymous" className="text-base font-medium">
                  Donate Anonymously
                </Label>
                <p className="text-sm text-muted-foreground">
                  Your name won&apos;t be displayed publicly
                </p>
              </div>
              <Switch id="anonymous" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
            </div>
          </div>

          {state?.status === "error" && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {state.message}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="h-14 w-full text-lg"
            disabled={!amount || amount < 10 || pending}
          >
            {pending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-5 w-5" />
                {submitLabel}
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            <Heart className="mr-1 inline h-3 w-3" />
            Secure payment powered by Stripe. Your donation is protected.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
