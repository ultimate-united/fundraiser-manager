import { loadStripe, type Stripe } from "@stripe/stripe-js"

/**
 * Lazily load Stripe.js once, using the publishable key. Returns null if the key
 * isn't set (e.g. before NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is configured) so the
 * UI can degrade gracefully instead of throwing.
 */
let stripePromise: Promise<Stripe | null> | null = null

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    stripePromise = key ? loadStripe(key) : Promise.resolve(null)
  }
  return stripePromise
}
