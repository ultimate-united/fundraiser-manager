"use client"

import { useState } from "react"
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { CreditCard, Loader2 } from "lucide-react"

interface PaymentStepProps {
  amount: number // dollars, for the button label
  onPaid: () => void
}

/**
 * The card-entry step. Must be rendered inside a Stripe <Elements> provider so
 * useStripe()/useElements() resolve. Confirms the PaymentIntent with the card the
 * donor enters; for non-redirect methods (e.g. test card 4242…) it resolves
 * inline and calls onPaid().
 */
export function PaymentStep({ amount, onPaid }: PaymentStepProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [paying, setPaying] = useState(false)

  const handlePay = async () => {
    if (!stripe || !elements) return
    setPaying(true)
    setError(null)

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: { return_url: `${window.location.origin}/donate/success` },
    })

    if (confirmError) {
      setError(confirmError.message ?? "Payment could not be completed.")
      setPaying(false)
      return
    }
    if (paymentIntent && (paymentIntent.status === "succeeded" || paymentIntent.status === "processing")) {
      onPaid()
      return
    }
    setPaying(false)
  }

  return (
    <div className="space-y-5">
      <PaymentElement />

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      <Button
        type="button"
        size="lg"
        className="h-14 w-full text-lg"
        onClick={handlePay}
        disabled={!stripe || paying}
      >
        {paying ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-5 w-5" />
            Pay HK${amount}
          </>
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Test mode — use card 4242 4242 4242 4242, any future expiry, any CVC.
      </p>
    </div>
  )
}
