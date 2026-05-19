import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 to-background" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Tagline */}
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            Everyday
          </p>
          
          {/* Main headline */}
          <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            <span className="text-balance">Making A Difference</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
            We are a nonprofit organization dedicated to promoting education and providing 
            resources to underprivileged communities in Hong Kong. Join us in making a difference today.
          </p>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link href="/events">
                View Upcoming Events
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
              <Link href="/about">
                Learn About Us
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Scrolling text banner like UU website */}
      <div className="overflow-hidden border-y border-border/50 bg-secondary/30 py-3">
        <div className="animate-scroll flex whitespace-nowrap">
          {Array.from({ length: 20 }).map((_, i) => (
            <span key={i} className="mx-8 text-sm font-medium tracking-wider text-muted-foreground">
              ULTIMATE UNITED
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
