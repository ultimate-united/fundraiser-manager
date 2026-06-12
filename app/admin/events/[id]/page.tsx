import { notFound } from "next/navigation"
import { EventForm } from "@/components/admin/event-form"
import { getAdminEvent, getEventSections } from "@/lib/api/admin"

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [event, sections] = await Promise.all([
    getAdminEvent(id).catch(() => null),
    getEventSections(id).catch(() => []),
  ])
  if (!event) notFound()

  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 font-serif text-3xl font-bold text-foreground">Edit event</h1>
      <EventForm event={event} initialSections={sections} />
    </div>
  )
}
