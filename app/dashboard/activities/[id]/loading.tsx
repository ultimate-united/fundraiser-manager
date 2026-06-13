import { Skeleton } from "@/components/ui/skeleton"

export default function EditActivityLoading() {
  return (
    <div className="flex-1 min-w-0 max-w-3xl space-y-6">
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-20 w-full rounded-lg" />
      <Skeleton className="h-[28rem] w-full rounded-xl" />
    </div>
  )
}
