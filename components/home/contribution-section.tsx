import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart, Clock, Lightbulb, ArrowRight } from "lucide-react"

const contributionTypes = [
  {
    icon: Heart,
    title: "Financial Donations",
    description: "Every dollar directly supports educational materials, tutoring programs, and essential resources for families in need.",
    cta: "Donate Now",
    href: "/events",
  },
  {
    icon: Clock,
    title: "Volunteer Your Time",
    description: "Join our events as a volunteer. Help with registration, activities, or simply be there to support our community.",
    cta: "Find Opportunities",
    href: "/volunteer",
  },
  {
    icon: Lightbulb,
    title: "Share Your Skills",
    description: "Teachers, photographers, translators, and professionals — your expertise can make a lasting impact.",
    cta: "Get Involved",
    href: "/volunteer",
  },
]

export function ContributionSection() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            How You Can Help
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            There are many ways to contribute to our mission. Choose the one that fits you best.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {contributionTypes.map((item) => (
            <div
              key={item.title}
              className="group relative flex flex-col rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/50 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              
              <h3 className="mt-6 font-serif text-xl font-semibold text-foreground">
                {item.title}
              </h3>
              
              <p className="mt-3 flex-1 text-muted-foreground leading-relaxed">
                {item.description}
              </p>
              
              <div className="mt-6">
                <Button variant="outline" size="sm" className="group/btn" asChild>
                  <Link href={item.href}>
                    {item.cta}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
