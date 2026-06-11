import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, CalendarClock, FileText } from "lucide-react"
import { listAdminEvents } from "@/lib/api/admin"

export default async function AdminOverviewPage() {
  const events = await listAdminEvents()

  const stats = [
    { label: "Total events", value: events.length, icon: Calendar },
    { label: "Upcoming", value: events.filter((e) => e.status === "upcoming").length, icon: CalendarClock },
    { label: "Drafts", value: events.filter((e) => e.status === "draft").length, icon: FileText },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">Admin Overview</h1>
        <p className="text-muted-foreground mt-1">Manage events and platform content.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-serif font-semibold">Events</h3>
            <p className="text-sm text-muted-foreground">Create, edit, and publish events.</p>
          </div>
          <Button asChild>
            <Link href="/admin/events">Manage events</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
