import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { listAdminEvents } from "@/lib/api/admin"

export default async function AdminEventsPage() {
  const events = await listAdminEvents()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Events</h1>
          <p className="text-muted-foreground mt-1">Create and manage events (including drafts).</p>
        </div>
        <Button asChild>
          <Link href="/admin/events/new">New event</Link>
        </Button>
      </div>

      <div className="divide-y rounded-lg border bg-card">
        {events.length === 0 && <p className="p-6 text-muted-foreground">No events yet.</p>}
        {events.map((e) => (
          <Link
            key={e.id}
            href={`/admin/events/${e.id}`}
            className="flex items-center justify-between p-4 transition-colors hover:bg-secondary/40"
          >
            <div>
              <p className="font-medium text-foreground">{e.title}</p>
              <p className="text-sm text-muted-foreground">
                {e.slug}
                {e.starts_at ? ` · ${e.starts_at.slice(0, 10)}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {e.featured && <Badge variant="secondary">Featured</Badge>}
              <Badge variant="outline" className="capitalize">
                {e.status}
              </Badge>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
