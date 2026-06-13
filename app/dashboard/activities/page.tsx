import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Megaphone, Plus } from "lucide-react"
import { listMyActivities } from "@/lib/api/activities"
import { ReviewStatusBadge } from "@/components/activities/review-status-badge"

const MAX_ACTIVE = 5

export default async function MyActivitiesPage() {
  const activities = await listMyActivities()
  const activeCount = activities.filter((a) => a.status !== "cancelled").length
  const atLimit = activeCount >= MAX_ACTIVE

  return (
    <div className="flex-1 min-w-0 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">My Activities</h1>
          <p className="mt-1 text-muted-foreground">
            Start your own fundraiser. Activities go live once an admin approves them.
          </p>
        </div>
        <Button asChild disabled={atLimit}>
          {atLimit ? (
            <span>
              <Plus className="mr-2 h-4 w-4" />
              New activity
            </span>
          ) : (
            <Link href="/dashboard/activities/new">
              <Plus className="mr-2 h-4 w-4" />
              New activity
            </Link>
          )}
        </Button>
      </div>

      {/* Quota meter */}
      <div className="rounded-lg border bg-card p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">Active activities</span>
          <span className={atLimit ? "font-semibold text-destructive" : "font-semibold text-primary"}>
            {activeCount} / {MAX_ACTIVE}
          </span>
        </div>
        <Progress value={(activeCount / MAX_ACTIVE) * 100} className="h-2" />
        {atLimit && (
          <p className="mt-2 text-xs text-muted-foreground">
            You&apos;ve reached the limit. Cancel an activity to free up a slot.
          </p>
        )}
      </div>

      <div className="divide-y rounded-lg border bg-card">
        {activities.length === 0 && (
          <div className="flex flex-col items-center gap-3 p-10 text-center">
            <Megaphone className="h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">You haven&apos;t started any activities yet.</p>
            <Button asChild>
              <Link href="/dashboard/activities/new">Start your first activity</Link>
            </Button>
          </div>
        )}
        {activities.map((a) => (
          <Link
            key={a.id}
            href={`/dashboard/activities/${a.id}`}
            className="flex items-center justify-between p-4 transition-colors hover:bg-secondary/40"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">{a.title}</p>
              <p className="truncate text-sm text-muted-foreground">
                {a.slug}
                {a.starts_at ? ` · ${a.starts_at.slice(0, 10)}` : ""}
              </p>
            </div>
            <div className="flex flex-shrink-0 items-center gap-2">
              {a.status === "cancelled" && <Badge variant="outline">Cancelled</Badge>}
              <ReviewStatusBadge status={a.review_status} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
