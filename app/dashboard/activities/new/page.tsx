import { EventForm } from "@/components/admin/event-form"
import { saveActivity } from "@/app/dashboard/activities/actions"
import { DEFAULT_SECTIONS } from "@/lib/admin/default-sections"

export default function NewActivityPage() {
  return (
    <div className="flex-1 min-w-0 max-w-3xl">
      <h1 className="mb-1 font-serif text-3xl font-bold text-foreground">New activity</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Fill in the details and save as a draft. When you&apos;re ready, submit it for admin review —
        it goes public once approved.
      </p>
      <EventForm
        mode="owner"
        action={saveActivity}
        initialSections={DEFAULT_SECTIONS}
        submitLabel="Save draft"
      />
    </div>
  )
}
