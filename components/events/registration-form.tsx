"use client"

import { useActionState, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, HandHeart, Loader2, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { submitRegistration, type RegistrationFormState } from "@/app/events/[slug]/register/actions"

// DRAFT placeholder options — to be ironed out by the product owner.
const PARTICIPANT_TYPES = [
  { value: "individual", label: "Individual" },
  { value: "family", label: "Family" },
  { value: "corporate", label: "Corporate / Team" },
]
const SKILLS = [
  "First Aid",
  "Photography / Videography",
  "Logistics & Setup",
  "Coaching / Mentoring",
  "Cooking / Catering",
  "Translation (繁中 / EN)",
  "Driving",
  "Social Media",
]

interface RegistrationFormProps {
  eventId: string
  eventTitle: string
  /** Prefill from the logged-in account. */
  defaultName?: string
  defaultEmail?: string
}

export function RegistrationForm({
  eventId,
  eventTitle,
  defaultName = "",
  defaultEmail = "",
}: RegistrationFormProps) {
  const [mode, setMode] = useState<"participant" | "volunteer">("participant")
  const [participantType, setParticipantType] = useState("individual")
  const [state, formAction, pending] = useActionState<RegistrationFormState, FormData>(
    submitRegistration,
    null,
  )

  if (state?.status === "success") {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <h2 className="font-serif text-2xl font-semibold text-foreground">You&apos;re in!</h2>
          <p className="max-w-md text-muted-foreground">{state.message}</p>
          <div className="mt-2 flex gap-3">
            <Button asChild variant="outline">
              <Link href="/">Back to events</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/events">My events</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-2xl">Register for {eventTitle}</CardTitle>
        <CardDescription>Choose how you&apos;d like to take part.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          <input type="hidden" name="event_id" value={eventId} />
          <input type="hidden" name="mode" value={mode} />
          <input type="hidden" name="participant_type" value={participantType} />

          {/* Mode toggle */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMode("participant")}
              className={cn(
                "flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-colors",
                mode === "participant" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
              )}
            >
              <Users className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">Participant</span>
              <span className="text-xs text-muted-foreground">Join and attend the event</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("volunteer")}
              className={cn(
                "flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-colors",
                mode === "volunteer" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
              )}
            >
              <HandHeart className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">Volunteer</span>
              <span className="text-xs text-muted-foreground">Give your time and skills</span>
            </button>
          </div>

          {/* Shared contact fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" name="full_name" placeholder="Jane Doe" defaultValue={defaultName} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="jane@example.com"
                defaultValue={defaultEmail}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" name="phone" type="tel" placeholder="+852 0000 0000" />
            </div>
          </div>

          {/* Participant-specific */}
          {mode === "participant" && (
            <div className="space-y-4 border-t pt-4">
              <div className="space-y-2">
                <Label>I&apos;m signing up as</Label>
                <div className="grid grid-cols-3 gap-3">
                  {PARTICIPANT_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setParticipantType(t.value)}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                        participantType === t.value
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/40",
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="party_size">Number attending (incl. you)</Label>
                <Input
                  id="party_size"
                  name="party_size"
                  type="number"
                  min={1}
                  defaultValue={1}
                  className="max-w-32"
                />
              </div>
            </div>
          )}

          {/* Volunteer-specific */}
          {mode === "volunteer" && (
            <div className="space-y-4 border-t pt-4">
              <div className="space-y-2">
                <Label>Skills you can contribute</Label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {SKILLS.map((skill) => (
                    <label
                      key={skill}
                      className="flex items-center gap-2 rounded-lg border border-border p-3 text-sm hover:border-primary/40"
                    >
                      <input
                        type="checkbox"
                        name="skills"
                        value={skill}
                        className="h-4 w-4 accent-primary"
                      />
                      {skill}
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="availability">Availability (optional)</Label>
                <Input
                  id="availability"
                  name="availability"
                  placeholder="e.g. Morning, full day, setup only"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Anything else? (optional)</Label>
            <Textarea id="notes" name="notes" rows={3} placeholder="Dietary needs, questions, etc." />
          </div>

          <p className="text-xs text-muted-foreground">
            Draft form — these fields are placeholders for now; only your participation type is saved at
            this stage.
          </p>

          {state?.status === "error" && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {state.message}
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : (
              `Register as ${mode === "volunteer" ? "volunteer" : "participant"}`
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
