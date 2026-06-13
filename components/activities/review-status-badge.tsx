import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ReviewStatus } from "@/lib/api/admin/types"

const CONFIG: Record<ReviewStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
  pending: { label: "Pending review", className: "bg-amber-100 text-amber-800" },
  approved: { label: "Approved", className: "bg-green-100 text-green-800" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-800" },
  changes_requested: { label: "Changes requested", className: "bg-orange-100 text-orange-800" },
}

/** Small status pill for an activity's review state — shared by member + admin views. */
export function ReviewStatusBadge({ status, className }: { status: ReviewStatus; className?: string }) {
  const cfg = CONFIG[status] ?? CONFIG.draft
  return <Badge className={cn("border-transparent hover:bg-current/0", cfg.className, className)}>{cfg.label}</Badge>
}
