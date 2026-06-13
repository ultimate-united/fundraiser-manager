import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"
import { EventForm } from "@/components/admin/event-form"
import { ReviewStatusBadge } from "@/components/activities/review-status-badge"
import { saveActivity, submitActivityAction } from "@/app/dashboard/activities/actions"
import { getMyActivity, getActivitySections } from "@/lib/api/activities"

const RESUBMITTABLE = new Set(["draft", "rejected", "changes_requested"])

export default async function EditActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [activity, sections] = await Promise.all([
    getMyActivity(id).catch(() => null),
    getActivitySections(id).catch(() => []),
  ])
  if (!activity) notFound()

  const canSubmit = RESUBMITTABLE.has(activity.review_status)

  return (
    <div className="flex-1 min-w-0 max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl font-bold text-foreground">Edit activity</h1>
        <ReviewStatusBadge status={activity.review_status} />
      </div>

      {/* Review status banner */}
      <div className="rounded-lg border bg-card p-4">
        {activity.review_status === "pending" && (
          <p className="text-sm text-muted-foreground">
            This activity is <strong>awaiting admin review</strong>. We&apos;ll publish it once it&apos;s approved.
          </p>
        )}
        {activity.review_status === "approved" && (
          <p className="text-sm text-muted-foreground">
            This activity is <strong>live</strong>. Edits stay visible immediately.
          </p>
        )}
        {(activity.review_status === "rejected" || activity.review_status === "changes_requested") && (
          <div className="space-y-1 text-sm">
            <p className="font-medium text-foreground">
              {activity.review_status === "rejected" ? "An admin rejected this activity." : "An admin requested changes."}
            </p>
            {activity.review_note && (
              <p className="text-muted-foreground">&ldquo;{activity.review_note}&rdquo;</p>
            )}
          </div>
        )}
        {activity.review_status === "draft" && (
          <p className="text-sm text-muted-foreground">
            This is a draft — only you can see it. Submit it for review when you&apos;re ready.
          </p>
        )}

        {canSubmit && (
          <form action={submitActivityAction} className="mt-3">
            <input type="hidden" name="id" value={activity.id} />
            <Button type="submit" size="sm">
              <Send className="mr-2 h-4 w-4" />
              Submit for review
            </Button>
          </form>
        )}
      </div>

      <EventForm
        mode="owner"
        event={activity}
        action={saveActivity}
        initialSections={sections}
        submitLabel="Save changes"
      />
    </div>
  )
}
