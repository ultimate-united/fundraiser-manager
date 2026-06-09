import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, Heart, Sparkles } from "lucide-react"
import type { ImpactItem } from "@/lib/types"
import type { Supporter } from "@/lib/api/donations"

// Fallback impact tiers when an event has none set (or for the general fund).
const DEFAULT_IMPACT: ImpactItem[] = [
  { amount: 50, title: "Educational Materials", description: "Provides textbooks and school supplies for one student for a semester" },
  { amount: 100, title: "Workshop Access", description: "Sponsors one child to attend our educational workshop series" },
  { amount: 250, title: "Family Support", description: "Provides emergency assistance to a family in need for one month" },
  { amount: 500, title: "Community Program", description: "Funds a community outreach program session reaching 20+ families" },
]

const ICONS = [BookOpen, Users, Heart, Sparkles]

interface DonationImpactProps {
  /** Event-defined impact tiers (admin-editable); falls back to defaults. */
  impact?: ImpactItem[]
  /** Recent supporters from the backend (anonymity already applied server-side). */
  supporters: Supporter[]
}

export function DonationImpact({ impact, supporters }: DonationImpactProps) {
  const impactItems = impact && impact.length > 0 ? impact : DEFAULT_IMPACT

  return (
    <div className="space-y-8">
      {/* Impact Section */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Your Impact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {impactItems.map((item, index) => {
            const Icon = ICONS[index % ICONS.length]
            return (
              <div key={`${item.amount}-${index}`} className="flex gap-4 p-4 rounded-lg bg-secondary/50">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-primary">HK${item.amount}</span>
                    <span className="text-muted-foreground">-</span>
                    <span className="font-medium">{item.title}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Recent Supporters */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">Recent Supporters</CardTitle>
        </CardHeader>
        <CardContent>
          {supporters.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Be the first to support this cause — your name could be here.
            </p>
          ) : (
            <div className="space-y-4">
              {supporters.map((donor, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between pb-4 border-b last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{donor.name}</p>
                    {donor.message && (
                      <p className="text-sm text-muted-foreground italic">&quot;{donor.message}&quot;</p>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    HK${Math.round(donor.amount / 100)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tax Deduction Info */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">Tax-Deductible Donations</h3>
          <p className="text-sm text-muted-foreground">
            Ultimate United is a registered charity in Hong Kong (IR File No. 91/XXXXX). All
            donations of HK$100 or more are tax-deductible. You will receive an official receipt via
            email within 7 working days.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
