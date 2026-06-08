import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Smartphone, Landmark, Zap, Clock, Info } from "lucide-react"

interface AlternativeDonationMethodsProps {
  /** If provided, donors are asked to quote the event name in their transfer reference. */
  eventTitle?: string | null
}

/** A single label/value row of (placeholder) transfer details. */
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 py-2 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

/**
 * Manual / indirect donation methods (PayMe, FPS, bank transfer) shown beneath the
 * Stripe card form. All identifiers are PLACEHOLDERS for the org to fill in.
 * These do not charge through the site — admins reconcile the transfer manually.
 */
export function AlternativeDonationMethods({ eventTitle = null }: AlternativeDonationMethodsProps) {
  const reference = eventTitle
    ? `your full name, account email, and "${eventTitle}"`
    : "your full name and account email"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-xl">Other Ways to Give</CardTitle>
        <CardDescription>
          Prefer PayMe, FPS, or a bank transfer? Use the details below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="payme">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="payme">
              <Smartphone className="mr-1.5 h-4 w-4" />
              PayMe
            </TabsTrigger>
            <TabsTrigger value="fps">
              <Zap className="mr-1.5 h-4 w-4" />
              FPS
            </TabsTrigger>
            <TabsTrigger value="bank">
              <Landmark className="mr-1.5 h-4 w-4" />
              Bank Transfer
            </TabsTrigger>
          </TabsList>

          {/* PayMe */}
          <TabsContent value="payme" className="mt-4 space-y-4">
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-6 text-center">
              <div className="flex h-40 w-40 items-center justify-center rounded-md bg-secondary text-xs text-muted-foreground">
                PayMe QR code
                <br />
                (add image later)
              </div>
              <p className="text-sm text-muted-foreground">Open PayMe → scan the code → enter your amount.</p>
            </div>
            <div>
              <DetailRow label="PayMe ID / link" value="payme.hsbc/ultimateunited (placeholder)" />
              <DetailRow label="Registered mobile" value="+852 0000 0000 (placeholder)" />
            </div>
          </TabsContent>

          {/* FPS */}
          <TabsContent value="fps" className="mt-4">
            <DetailRow label="FPS ID" value="1234567 (placeholder)" />
            <DetailRow label="Registered phone" value="+852 0000 0000 (placeholder)" />
            <DetailRow label="Registered email" value="give@ultimateunited.org (placeholder)" />
            <DetailRow label="Account name" value="Ultimate United Limited (placeholder)" />
          </TabsContent>

          {/* Bank transfer */}
          <TabsContent value="bank" className="mt-4">
            <DetailRow label="Bank" value="The Bank (placeholder)" />
            <DetailRow label="Account name" value="Ultimate United Limited (placeholder)" />
            <DetailRow label="Account number" value="000-000000-000 (placeholder)" />
            <DetailRow label="Bank / branch code" value="000 / 000 (placeholder)" />
            <DetailRow label="SWIFT (overseas)" value="XXXXHKHHXXX (placeholder)" />
          </TabsContent>
        </Tabs>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Quote your details in the transfer</AlertTitle>
          <AlertDescription>
            Please include {reference} in the payment reference / message so our team can match the
            transfer to your account.
          </AlertDescription>
        </Alert>

        <Alert>
          <Clock className="h-4 w-4" />
          <AlertTitle>Allow up to 5 business days</AlertTitle>
          <AlertDescription>
            These methods are processed manually. Because the transfer is indirect, please allow up to
            5 business days for our admins to verify the transfer record before it&apos;s reflected in
            your account.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
