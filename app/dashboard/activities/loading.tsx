import { Skeleton } from "@/components/ui/skeleton"

export default function ActivitiesLoading() {
  return (
    <div className="flex-1 min-w-0 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>
      <Skeleton className="h-16 w-full rounded-lg" />
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  )
}
