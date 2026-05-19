import { Heart, Users, HandHeart } from "lucide-react"

const stats = [
  {
    icon: Users,
    value: "390+",
    label: "Children Served",
    description: "Including refugees, single parents, and low-income families across Hong Kong",
  },
  {
    icon: Heart,
    value: "96+",
    label: "Single Mothers",
    description: "Supported through empowerment programs and community resources",
  },
  {
    icon: HandHeart,
    value: "600+",
    label: "Families in Need",
    description: "Receiving food assistance, educational support, and community care",
  },
]

export function ImpactStats() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            We Are Actively Serving
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Through love and guidance, we empower communities to overcome challenges and create brighter futures.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="relative rounded-2xl border border-border bg-card p-8 text-center transition-shadow hover:shadow-lg"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <stat.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mt-6 font-serif text-4xl font-semibold text-foreground">
                {stat.value}
              </h3>
              <p className="mt-2 text-lg font-medium text-foreground">
                {stat.label}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
