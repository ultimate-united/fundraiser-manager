"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Check, Loader2, RotateCcw, X } from "lucide-react"
import { approveAction, rejectAction, requestChangesAction } from "@/app/admin/review/actions"

/** Approve / request-changes / reject controls for one pending activity.
 * The note is shared by the two "send back" actions; approve needs no note. */
export function ReviewActions({ id }: { id: string }) {
  const [note, setNote] = useState("")
  const [pending, startTransition] = useTransition()

  const run = (fn: () => Promise<void>) => () => startTransition(fn)

  return (
    <div className="space-y-3">
      <Textarea
        placeholder="Optional note to the organiser (shown when you request changes or reject)…"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        disabled={pending}
      />
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={run(() => approveAction(id))} disabled={pending}>
          {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
          Approve
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={run(() => requestChangesAction(id, note))}
          disabled={pending}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Request changes
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="text-destructive hover:text-destructive"
          onClick={run(() => rejectAction(id, note))}
          disabled={pending}
        >
          <X className="mr-2 h-4 w-4" />
          Reject
        </Button>
      </div>
    </div>
  )
}
