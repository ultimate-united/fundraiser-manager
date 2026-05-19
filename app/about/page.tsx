import type { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Heart, Users, Target, Award, MapPin, Mail, Calendar } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: 'About Us | Ultimate United',
  description: 'Learn about Ultimate United, a nonprofit organization dedicated to promoting education and providing resources to underprivileged communities in Hong Kong since 2012.',
}

const values = [
  {
    icon: Heart,
    title: "Compassion",
    description: "We lead with love and empathy, recognizing the dignity in every person we serve.",
  },
  {
    icon: Users,
    title: "Community",
    description: "We believe in the power of people coming together to create lasting change.",
  },
  {
    icon: Target,
    title: "Impact",
    description: "Every action we take is measured by the real difference it makes in people's lives.",
  },
  {
    icon: Award,
    title: "Integrity",
    description: "We operate with transparency, ensuring every donation directly benefits those in need.",
  },
]

const team = [
  {
    name: "Ohanna, Vijay Partap",
    role: "Co-Founder",
    bio: "Vijay founded Ultimate United in 2012 out of a simple calling — to organize activities and events where people can come together in support of those in need.",
  },
  {
    name: "Dang, Kit Ling",
    role: "Co-Founder",
    bio: "Kit Ling has been serving with Vijay from the early days of Ultimate United. She is passionate about community outreach and women's empowerment.",
  },
  {
    name: "Emma, Kristina Stokes",
    role: "Programs Director",
    bio: "Emma joined the Ultimate United team in 2018 with a strong background in program development and a heart for serving families.",
  },
  {
    name: "Fung, Willy",
    role: "Operations Manager",
    bio: "Willy brings operational expertise to the team, ensuring our programs run smoothly and efficiently.",
  },
]

const milestones = [
  { year: "2012", event: "Ultimate United founded in Hong Kong" },
  { year: "2014", event: "Launched Friday Night Kids Club program" },
  { year: "2016", event: "Started Women Empowerment initiative" },
  { year: "2018", event: "Reached 100 families served milestone" },
  { year: "2020", event: "Expanded food distribution during pandemic" },
  { year: "2022", event: "Celebrated 10 years of community service" },
  { year: "2024", event: "Serving 390+ children and 600+ families" },
]

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero section */}
        <section className="bg-secondary/30 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-medium uppercase tracking-widest text-primary">
                Welcome To
              </p>
              <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Ultimate United
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                We are a nonprofit organization dedicated to promoting education and providing 
                resources to underprivileged communities in Hong Kong. Join us in making a difference today.
              </p>
            </div>
          </div>
        </section>

        {/* Mission section */}
        <section id="mission" className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  About Mission
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                  We&apos;ve sought success in families and individuals in need to improve their quality of life and brighter tomorrow.
                </p>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                  At our core, we provide educational opportunities, emotional support, and practical 
                  resources to children, single mothers, and families facing hardship. Through our programs 
                  like Friday Night Kids Club and Women Empowerment, we create safe spaces for growth, 
                  learning, and community.
                </p>
                <div className="mt-8">
                  <Button asChild>
                    <Link href="/events">Get Involved</Link>
                  </Button>
                </div>
              </div>
              <div className="rounded-2xl bg-secondary p-8 lg:p-12">
                <blockquote className="text-lg italic text-muted-foreground">
                  &ldquo;Making a difference everyday — not through grand gestures, but through 
                  consistent acts of love and service to our community.&rdquo;
                </blockquote>
                <p className="mt-4 font-medium text-foreground">— Ultimate United Team</p>
              </div>
            </div>
          </div>
        </section>

        {/* Values section */}
        <section className="bg-secondary/30 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Our Values
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                These principles guide everything we do
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="rounded-2xl border border-border bg-card p-8 text-center"
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <value.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="mt-6 font-serif text-xl font-semibold text-foreground">
                    {value.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* History section */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Our History
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">Since 2012</p>
              <p className="mt-6 text-lg text-muted-foreground">
                Ultimate United was founded in Hong Kong in 2012 by Vijay Partap. Starting from a 
                small community group, we&apos;ve grown into an organization serving hundreds of families 
                across the city.
              </p>
            </div>

            <div className="mt-16">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-border hidden md:block" />
                
                <div className="space-y-8">
                  {milestones.map((milestone, index) => (
                    <div
                      key={milestone.year}
                      className={`relative flex flex-col md:flex-row ${
                        index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                      } items-center gap-4 md:gap-8`}
                    >
                      <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                        <div className="inline-block rounded-xl border border-border bg-card p-4">
                          <p className="text-sm text-muted-foreground">{milestone.event}</p>
                        </div>
                      </div>
                      <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                        {milestone.year}
                      </div>
                      <div className="flex-1" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team section */}
        <section id="team" className="bg-secondary/30 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Ultimate Founders & Staff
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Meet the dedicated team behind Ultimate United
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {team.map((member) => (
                <div
                  key={member.name}
                  className="rounded-2xl border border-border bg-card p-6 text-center"
                >
                  <div className="mx-auto h-24 w-24 rounded-full bg-secondary" />
                  <h3 className="mt-4 font-semibold text-foreground">{member.name}</h3>
                  <p className="text-sm text-primary">{member.role}</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {member.bio}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact section */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                See Us In Person
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                We would love to connect with you
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-center gap-3 text-muted-foreground">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>Hong Kong</span>
                </div>
                <div className="flex items-center justify-center gap-3 text-muted-foreground">
                  <Mail className="h-5 w-5 text-primary" />
                  <a href="mailto:info@ultimateunited.org" className="hover:text-foreground">
                    info@ultimateunited.org
                  </a>
                </div>
                <div className="flex items-center justify-center gap-3 text-muted-foreground">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span>Programs run weekly</span>
                </div>
              </div>

              <div className="mt-8">
                <Button size="lg" asChild>
                  <Link href="/events">Contact & Join Us</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
