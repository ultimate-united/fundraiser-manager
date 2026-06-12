import { EventForm } from "@/components/admin/event-form"
import { DEFAULT_SECTIONS } from "@/lib/admin/default-sections"

export default function NewEventPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 font-serif text-3xl font-bold text-foreground">New event</h1>
      <EventForm initialSections={DEFAULT_SECTIONS} />
    </div>
  )
}
