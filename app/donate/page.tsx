import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { DonationForm } from "@/components/donate/donation-form"
import { DonationImpact } from "@/components/donate/donation-impact"
import { Heart } from "lucide-react"

export default function DonatePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-primary/5 py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
              Make a Difference Today
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Your generous donation helps us continue our mission of promoting education 
              and providing resources to underprivileged communities in Hong Kong.
            </p>
          </div>
        </section>

        {/* Donation Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <DonationForm />
              <DonationImpact />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
