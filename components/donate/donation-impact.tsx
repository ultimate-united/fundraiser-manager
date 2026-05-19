import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, Heart, Sparkles } from "lucide-react"

const IMPACT_ITEMS = [
  {
    amount: 50,
    icon: BookOpen,
    title: "Educational Materials",
    description: "Provides textbooks and school supplies for one student for a semester"
  },
  {
    amount: 100,
    icon: Users,
    title: "Workshop Access",
    description: "Sponsors one child to attend our educational workshop series"
  },
  {
    amount: 250,
    icon: Heart,
    title: "Family Support",
    description: "Provides emergency assistance to a family in need for one month"
  },
  {
    amount: 500,
    icon: Sparkles,
    title: "Community Program",
    description: "Funds a community outreach program session reaching 20+ families"
  }
]

const RECENT_DONORS = [
  { name: "Sarah L.", amount: 500, message: "Keep up the amazing work!" },
  { name: "Anonymous", amount: 100, message: null },
  { name: "Michael C.", amount: 250, message: "Happy to support this cause" },
  { name: "Anonymous", amount: 1000, message: "For the children" },
  { name: "Emily W.", amount: 50, message: null },
]

export function DonationImpact() {
  return (
    <div className="space-y-8">
      {/* Impact Section */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Your Impact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {IMPACT_ITEMS.map((item) => (
            <div key={item.amount} className="flex gap-4 p-4 rounded-lg bg-secondary/50">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-primary" />
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
          ))}
        </CardContent>
      </Card>

      {/* Recent Donors */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">Recent Supporters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {RECENT_DONORS.map((donor, index) => (
              <div key={index} className="flex items-start justify-between pb-4 border-b last:border-0 last:pb-0">
                <div>
                  <p className="font-medium">{donor.name}</p>
                  {donor.message && (
                    <p className="text-sm text-muted-foreground italic">&quot;{donor.message}&quot;</p>
                  )}
                </div>
                <span className="text-sm font-semibold text-primary">HK${donor.amount}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tax Deduction Info */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">Tax-Deductible Donations</h3>
          <p className="text-sm text-muted-foreground">
            Ultimate United is a registered charity in Hong Kong (IR File No. 91/XXXXX). 
            All donations of HK$100 or more are tax-deductible. You will receive an 
            official receipt via email within 7 working days.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
