import { Skeleton } from "@/components/ui/skeleton"

/**
 * Content-area skeleton shown while a dashboard tab's data loads. The Header +
 * sidebar are provided by app/dashboard/layout.tsx and persist across tabs, so
 * only this right-hand content suspends.
 */
export default function DashboardLoading() {
  return (
    <div className="flex-1 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-10 w-full rounded-lg" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  )
}
