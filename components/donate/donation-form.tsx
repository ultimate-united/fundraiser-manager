"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Heart, CreditCard, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const PRESET_AMOUNTS = [50, 100, 250, 500, 1000]

export function DonationForm() {
  const [amount, setAmount] = useState<number | null>(100)
  const [customAmount, setCustomAmount] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [donorName, setDonorName] = useState("")
  const [donorEmail, setDonorEmail] = useState("")
  const [message, setMessage] = useState("")

  const handlePresetClick = (preset: number) => {
    setAmount(preset)
    setCustomAmount("")
  }

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value)
    const parsed = parseInt(value, 10)
    setAmount(isNaN(parsed) ? null : parsed)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || amount < 10) return

    setIsLoading(true)
    
    // This would integrate with Stripe Checkout
    // For now, simulate a delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // TODO: Integrate with Stripe
    // const response = await fetch('/api/checkout', {
    //   method: 'POST',
    //   body: JSON.stringify({ amount, donorName, donorEmail, message, isAnonymous })
    // })
    
    setIsLoading(false)
    alert("Stripe integration coming soon! Thank you for your interest in donating.")
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="font-serif text-2xl">Choose Your Donation Amount</CardTitle>
        <CardDescription>
          All donations are tax-deductible. You&apos;ll receive a receipt via email.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Preset Amounts */}
          <div className="grid grid-cols-3 gap-3">
            {PRESET_AMOUNTS.map((preset) => (
              <Button
                key={preset}
                type="button"
                variant={amount === preset && !customAmount ? "default" : "outline"}
                className={cn(
                  "h-14 text-lg font-semibold",
                  amount === preset && !customAmount && "ring-2 ring-primary ring-offset-2"
                )}
                onClick={() => handlePresetClick(preset)}
              >
                HK${preset}
              </Button>
            ))}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
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
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                disabled={isAnonymous}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Leave a message of support..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
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
              <Switch
                id="anonymous"
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full h-14 text-lg"
            disabled={!amount || amount < 10 || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-5 w-5" />
                Donate HK${amount || 0}
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            <Heart className="inline h-3 w-3 mr-1" />
            Secure payment powered by Stripe. Your donation is protected.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
