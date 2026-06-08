"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Settings } from "lucide-react"
import { openBillingPortal, type BillingPortalState } from "@/app/dashboard/donations/actions"

/**
 * Opens the Stripe Customer Portal (manage / cancel subscriptions, update card).
 * On success the server action redirects to Stripe; on failure it returns an
 * inline error.
 */
export function ManageSubscriptionButton() {
  const [state, action, pending] = useActionState<BillingPortalState, FormData>(openBillingPortal, null)

  return (
    <form action={action} className="flex flex-col items-start gap-1">
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Opening...
          </>
        ) : (
          <>
            <Settings className="mr-2 h-4 w-4" />
            Manage or cancel
          </>
        )}
      </Button>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
    </form>
  )
}
