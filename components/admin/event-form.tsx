"use client"

import { useActionState, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"
import { saveEvent, type EventFormState } from "@/app/admin/events/actions"
import type { AdminEvent } from "@/lib/api/admin/types"

const STATUSES = ["draft", "upcoming", "ongoing", "completed", "cancelled"] as const

/** Trim an ISO timestamp to the `YYYY-MM-DDTHH:mm` a datetime-local input wants. */
const toLocalInput = (iso: string | null | undefined) => (iso ? iso.slice(0, 16) : "")

export function EventForm({ event }: { event?: AdminEvent }) {
  const [state, action, pending] = useActionState<EventFormState, FormData>(saveEvent, null)
  const [featured, setFeatured] = useState(event?.featured ?? false)

  return (
    <form action={action} className="space-y-6 rounded-xl border bg-card p-6">
      {event && <input type="hidden" name="id" value={event.id} />}
      <input type="hidden" name="featured" value={featured ? "true" : "false"} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input id="title" name="title" defaultValue={event?.title ?? ""} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug *</Label>
          <Input id="slug" name="slug" defaultValue={event?.slug ?? ""} placeholder="run-for-hope-2026" required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subtitle">Subtitle</Label>
        <Input id="subtitle" name="subtitle" defaultValue={event?.subtitle ?? ""} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="mission">Mission</Label>
        <Textarea id="mission" name="mission" rows={2} defaultValue={event?.mission ?? ""} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="summary">Summary / description</Label>
        <Textarea id="summary" name="summary" rows={3} defaultValue={event?.summary ?? ""} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input id="location" name="location" defaultValue={event?.location ?? ""} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="starts_at">Starts</Label>
          <Input id="starts_at" name="starts_at" type="datetime-local" defaultValue={toLocalInput(event?.starts_at)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ends_at">Ends</Label>
          <Input id="ends_at" name="ends_at" type="datetime-local" defaultValue={toLocalInput(event?.ends_at)} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="fundraising_goal">Fundraising goal (HK$)</Label>
          <Input
            id="fundraising_goal"
            name="fundraising_goal"
            type="number"
            min={0}
            defaultValue={event?.fundraising_goal != null ? Math.round(event.fundraising_goal / 100) : ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="participant_goal">Participant goal</Label>
          <Input id="participant_goal" name="participant_goal" type="number" min={0} defaultValue={event?.participant_goal ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="volunteer_spots">Volunteer spots</Label>
          <Input id="volunteer_spots" name="volunteer_spots" type="number" min={0} defaultValue={event?.volunteer_spots ?? ""} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="points_reward">Points reward</Label>
          <Input id="points_reward" name="points_reward" type="number" min={0} defaultValue={event?.points_reward ?? 0} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={event?.status ?? "draft"}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm capitalize"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="banner_image">Banner image URL</Label>
        <Input id="banner_image" name="banner_image" defaultValue={event?.banner_image ?? ""} placeholder="(uploads come later)" />
      </div>

      <div className="flex items-center justify-between rounded-lg border p-4">
        <div>
          <Label htmlFor="featured" className="text-base font-medium">Featured</Label>
          <p className="text-sm text-muted-foreground">Highlight this event on the landing grid.</p>
        </div>
        <Switch id="featured" checked={featured} onCheckedChange={setFeatured} />
      </div>

      {state?.status === "error" && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{state.message}</div>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : event ? (
            "Save changes"
          ) : (
            "Create event"
          )}
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/events">Cancel</Link>
        </Button>
      </div>
    </form>
  )
}
