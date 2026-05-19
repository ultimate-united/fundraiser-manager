import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/home/hero-section"
import { ImpactStats } from "@/components/home/impact-stats"
import { EventsFeed } from "@/components/home/events-feed"
import { ContributionSection } from "@/components/home/contribution-section"
import { mockEvents } from "@/lib/mock-data"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <ImpactStats />
        <EventsFeed events={mockEvents} />
        <ContributionSection />
      </main>
      <Footer />
    </div>
  )
}
