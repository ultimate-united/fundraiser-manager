import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import { listAdminEvents } from "@/lib/api/admin"
import { ReviewActions } from "@/components/admin/review-actions"

/** Admin review queue — activities members submitted, awaiting approval. */
export default async function AdminReviewPage() {
  const pending = await listAdminEvents("pending")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">Review queue</h1>
        <p className="mt-1 text-muted-foreground">
          Member-submitted activities awaiting approval. Approve to publish, or send back with a note.
        </p>
      </div>

      {pending.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border bg-card p-10 text-center">
          <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">Nothing to review — you&apos;re all caught up.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map((a) => (
            <div key={a.id} className="rounded-lg border bg-card p-4">
              <div className="mb-3 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <Link
                    href={`/admin/events/${a.id}`}
                    className="font-medium text-foreground hover:underline"
                  >
                    {a.title}
                  </Link>
                  <p className="truncate text-sm text-muted-foreground">
                    {a.slug}
                    {a.starts_at ? ` · ${a.starts_at.slice(0, 10)}` : ""}
                    {a.location ? ` · ${a.location}` : ""}
                  </p>
                  {a.summary && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{a.summary}</p>
                  )}
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/admin/events/${a.id}`}>View / edit</Link>
                </Button>
              </div>
              <ReviewActions id={a.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
