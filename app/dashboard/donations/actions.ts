"use server"

import { redirect } from "next/navigation"

import { createBillingPortalSession } from "@/lib/api/donations"

export type BillingPortalState = { error: string } | null

/**
 * Open the Stripe Customer Portal for the current member, then redirect there.
 * redirect() throws NEXT_REDIRECT so it must live OUTSIDE the try/catch.
 */
export async function openBillingPortal(
  _prev: BillingPortalState,
  _formData: FormData,
): Promise<BillingPortalState> {
  let url: string
  try {
    url = (await createBillingPortalSession()).url
  } catch (err) {
    const msg = err instanceof Error ? err.message : ""
    if (/404|no subscription|no .*customer/i.test(msg)) {
      return { error: "You don't have a recurring donation to manage yet." }
    }
    return { error: "Couldn't open the billing portal. Please try again." }
  }
  redirect(url)
}
