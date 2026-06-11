import { Skeleton } from "@/components/ui/skeleton"

/**
 * Form-shaped skeleton for the edit-event route. Co-located here (not relying on
 * app/admin/loading.tsx) because a parent loading boundary won't re-show when
 * navigating deeper into an already-mounted segment.
 */
export default function EditEventLoading() {
  return (
    <div className="max-w-3xl">
      <Skeleton className="mb-6 h-9 w-48" />
      <div className="space-y-6 rounded-xl border bg-card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-10 w-40" />
      </div>
    </div>
  )
}
