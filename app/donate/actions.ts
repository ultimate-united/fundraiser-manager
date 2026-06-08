"use server"

import { redirect } from "next/navigation"

import { createDonation, createRecurringCheckout } from "@/lib/api/donations"

export type DonationFormState =
  | { status: "error"; message: string }
  | { status: "success"; message: string }
  // One-time donation recorded + a real Stripe PaymentIntent created — the form
  // now mounts the Payment Element with this client secret to collect the card.
  | { status: "needs_payment"; clientSecret: string; amount: number }
  | null

/**
 * Records a donation via the FastAPI backend.
 *
 * Monthly → starts a Stripe Checkout Session (subscription mode) and redirects to
 * the hosted page (Stripe runs the recurring billing). One-time + Stripe
 * configured → returns `needs_payment` with the PaymentIntent client secret for
 * the embedded Payment Element. One-time without keys → `success` (recorded
 * pending).
 */
export async function submitDonation(
  _prev: DonationFormState,
  formData: FormData,
): Promise<DonationFormState> {
  const dollars = Number(formData.get("amount"))
  if (!Number.isFinite(dollars) || dollars < 10) {
    return { status: "error", message: "Please enter a donation amount of at least HK$10." }
  }
  const amount = Math.round(dollars * 100) // dollars -> minor units (cents)
  const frequency = String(formData.get("frequency") ?? "one_time")
  const eventId = (formData.get("event_id") as string) || null
  const isAnonymous = formData.get("is_anonymous") === "true"
  const donorName = ((formData.get("donor_name") as string) ?? "").trim() || null
  const donorEmail = ((formData.get("donor_email") as string) ?? "").trim() || null
  const message = ((formData.get("message") as string) ?? "").trim() || null

  // --- Monthly: hand off to Stripe-hosted subscription Checkout ---
  // redirect() throws NEXT_REDIRECT, so it must live OUTSIDE the try/catch.
  if (frequency === "monthly") {
    let url: string
    try {
      const session = await createRecurringCheckout({ amount, frequency: "monthly", event_id: eventId })
      url = session.url
    } catch (err) {
      const msg = err instanceof Error ? err.message : ""
      if (/401|403|Unauthorized|Not authenticated/i.test(msg)) {
        return { status: "error", message: "Please sign in to set up a monthly gift." }
      }
      return { status: "error", message: "We couldn't start your monthly gift. Please try again." }
    }
    redirect(url)
  }

  // --- One-time ---
  if (!donorEmail) {
    return { status: "error", message: "Please enter your email so we can send your receipt." }
  }
  try {
    const result = await createDonation({
      amount,
      currency: "HKD",
      event_id: eventId,
      donor_name: isAnonymous ? null : donorName,
      donor_email: donorEmail,
      message,
      is_anonymous: isAnonymous,
    })

    if (result.payment_provider === "stripe" && result.client_secret) {
      return { status: "needs_payment", clientSecret: result.client_secret, amount: dollars }
    }

    // No Stripe key configured — donation recorded as pending only.
    return {
      status: "success",
      message: `Thank you! Your HK$${dollars} donation was recorded as pending — live card payment activates once Stripe keys are added.`,
    }
  } catch {
    return { status: "error", message: "We couldn't process that donation. Please try again." }
  }
}
