"use client"

import { useActionState, useState } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { CheckCircle2, Loader2, Plus, Trash2 } from "lucide-react"
import { CONTRIBUTION_ICON_OPTIONS } from "@/components/events/contribution-icons"
import { saveSections, type SectionsFormState } from "@/app/admin/events/[id]/sections-actions"
import type { AdminSection, SectionInput } from "@/lib/api/admin/types"

type OverviewCardRow = { icon: string; title: string; body: string }
type ScheduleRow = { time: string; title: string; description: string; location: string }
type ContribRow = { icon: string; title: string; body: string; cta: "donate" | "signup" }
type SponsorRow = { name: string; tier: "platinum" | "gold" | "silver" | "bronze" }

interface EditorState {
  overview: { title: string; body: string; items: OverviewCardRow[] }
  schedule: { enabled: boolean; title: string; body: string; items: ScheduleRow[] }
  contribution: { enabled: boolean; title: string; body: string; items: ContribRow[] }
  sponsors: { enabled: boolean; title: string; body: string; items: SponsorRow[] }
}

const SELECT_CLASS =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"

function find(sections: AdminSection[], kind: string) {
  return sections.find((s) => s.kind === kind)
}
function bodyOf(section?: AdminSection) {
  const c = section?.content
  return c && !Array.isArray(c) && typeof c === "object" ? ((c as { body?: string }).body ?? "") : ""
}
function itemsOf(section?: AdminSection): unknown[] {
  const c = section?.content
  if (Array.isArray(c)) return c
  if (c && typeof c === "object" && Array.isArray((c as { items?: unknown[] }).items)) {
    return (c as { items: unknown[] }).items
  }
  return []
}

const LEGACY_ICON: Record<string, string> = { donation: "heart", time: "clock", skills: "lightbulb" }

function initialState(sections: AdminSection[]): EditorState {
  const overview = find(sections, "rich_text")
  const schedule = find(sections, "schedule")
  const contribution = find(sections, "contribution")
  const sponsors = find(sections, "sponsors")

  return {
    overview: {
      title: overview?.title ?? "About This Event",
      body: bodyOf(overview),
      items: itemsOf(overview).map((r) => {
        const it = r as Partial<OverviewCardRow>
        return { icon: it.icon ?? "heart", title: it.title ?? "", body: it.body ?? "" }
      }),
    },
    schedule: {
      enabled: schedule?.enabled ?? false,
      title: schedule?.title ?? "Event Schedule",
      body: bodyOf(schedule),
      items: itemsOf(schedule).map((r) => {
        const it = r as Partial<ScheduleRow>
        return {
          time: it.time ?? "",
          title: it.title ?? "",
          description: it.description ?? "",
          location: it.location ?? "",
        }
      }),
    },
    contribution: {
      enabled: contribution?.enabled ?? false,
      title: contribution?.title ?? "How You Can Contribute",
      body: bodyOf(contribution),
      items: itemsOf(contribution).map((r) => {
        const it = r as Partial<ContribRow> & { type?: string; description?: string }
        return {
          icon: it.icon ?? (it.type ? LEGACY_ICON[it.type] : undefined) ?? "heart",
          title: it.title ?? "",
          body: it.body ?? it.description ?? "",
          cta: it.cta ?? (it.type === "donation" ? "donate" : "signup"),
        }
      }),
    },
    sponsors: {
      enabled: sponsors?.enabled ?? false,
      title: sponsors?.title ?? "Our Sponsors",
      body: bodyOf(sponsors),
      items: itemsOf(sponsors).map((r) => {
        const it = r as Partial<SponsorRow>
        return { name: it.name ?? "", tier: it.tier ?? "gold" }
      }),
    },
  }
}

function buildPayload(s: EditorState): SectionInput[] {
  return [
    { kind: "rich_text", title: s.overview.title, position: 0, content: { body: s.overview.body, items: s.overview.items }, enabled: true },
    { kind: "schedule", title: s.schedule.title, position: 1, content: { body: s.schedule.body, items: s.schedule.items }, enabled: s.schedule.enabled },
    { kind: "contribution", title: s.contribution.title, position: 2, content: { body: s.contribution.body, items: s.contribution.items }, enabled: s.contribution.enabled },
    { kind: "sponsors", title: s.sponsors.title, position: 3, content: { body: s.sponsors.body, items: s.sponsors.items }, enabled: s.sponsors.enabled },
  ]
}

export function EventSectionsEditor({
  eventId,
  initialSections,
}: {
  eventId: string
  initialSections: AdminSection[]
}) {
  const [state, setState] = useState<EditorState>(() => initialState(initialSections))
  const [result, action, pending] = useActionState<SectionsFormState, FormData>(saveSections, null)

  // Typed-ish generic updaters for the item arrays.
  const setOverviewCards = (items: OverviewCardRow[]) => setState((s) => ({ ...s, overview: { ...s.overview, items } }))
  const setSchedule = (items: ScheduleRow[]) => setState((s) => ({ ...s, schedule: { ...s.schedule, items } }))
  const setContrib = (items: ContribRow[]) => setState((s) => ({ ...s, contribution: { ...s.contribution, items } }))
  const setSponsors = (items: SponsorRow[]) => setState((s) => ({ ...s, sponsors: { ...s.sponsors, items } }))

  return (
    <Accordion type="single" collapsible className="rounded-xl border bg-card px-4">
      <AccordionItem value="content" className="border-none">
        <AccordionTrigger className="text-base font-medium">
          Advanced — event content (tabs)
        </AccordionTrigger>
        <AccordionContent>
          <form action={action} className="space-y-8 pb-2">
            <input type="hidden" name="event_id" value={eventId} />
            <input type="hidden" name="payload" value={JSON.stringify(buildPayload(state))} />

            {/* Overview (always shown) */}
            <section className="space-y-3 rounded-lg border p-4">
              <h3 className="font-semibold text-foreground">Overview <span className="text-xs font-normal text-muted-foreground">· always shown</span></h3>
              <Field label="Tab heading" value={state.overview.title} onChange={(v) => setState((s) => ({ ...s, overview: { ...s.overview, title: v } }))} />
              <BodyField value={state.overview.body} onChange={(v) => setState((s) => ({ ...s, overview: { ...s.overview, body: v } }))} />
              <div className="space-y-3">
                <Label>Info cards</Label>
                {state.overview.items.map((row, i) => (
                  <ItemRow key={i} onRemove={() => setOverviewCards(state.overview.items.filter((_, idx) => idx !== i))}>
                    <div className="space-y-2">
                      <select className={SELECT_CLASS} value={row.icon} onChange={(e) => setOverviewCards(state.overview.items.map((r, idx) => (idx === i ? { ...r, icon: e.target.value } : r)))}>
                        {CONTRIBUTION_ICON_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                      </select>
                      <Input placeholder="Card title (e.g. Who Should Join)" value={row.title} onChange={(e) => setOverviewCards(state.overview.items.map((r, idx) => (idx === i ? { ...r, title: e.target.value } : r)))} />
                      <Textarea rows={2} placeholder="Card body" value={row.body} onChange={(e) => setOverviewCards(state.overview.items.map((r, idx) => (idx === i ? { ...r, body: e.target.value } : r)))} />
                    </div>
                  </ItemRow>
                ))}
                <AddButton label="Add overview card" onClick={() => setOverviewCards([...state.overview.items, { icon: "users", title: "", body: "" }])} />
              </div>
            </section>

            {/* Schedule */}
            <SectionShell
              label="Schedule"
              enabled={state.schedule.enabled}
              onToggle={(v) => setState((s) => ({ ...s, schedule: { ...s.schedule, enabled: v } }))}
              title={state.schedule.title}
              onTitle={(v) => setState((s) => ({ ...s, schedule: { ...s.schedule, title: v } }))}
              body={state.schedule.body}
              onBody={(v) => setState((s) => ({ ...s, schedule: { ...s.schedule, body: v } }))}
            >
              {state.schedule.items.map((row, i) => (
                <ItemRow key={i} onRemove={() => setSchedule(state.schedule.items.filter((_, idx) => idx !== i))}>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Input placeholder="Time (e.g. 09:00)" value={row.time} onChange={(e) => setSchedule(state.schedule.items.map((r, idx) => (idx === i ? { ...r, time: e.target.value } : r)))} />
                    <Input placeholder="Title" value={row.title} onChange={(e) => setSchedule(state.schedule.items.map((r, idx) => (idx === i ? { ...r, title: e.target.value } : r)))} />
                    <Input placeholder="Location" value={row.location} onChange={(e) => setSchedule(state.schedule.items.map((r, idx) => (idx === i ? { ...r, location: e.target.value } : r)))} />
                    <Input placeholder="Description" value={row.description} onChange={(e) => setSchedule(state.schedule.items.map((r, idx) => (idx === i ? { ...r, description: e.target.value } : r)))} />
                  </div>
                </ItemRow>
              ))}
              <AddButton label="Add schedule item" onClick={() => setSchedule([...state.schedule.items, { time: "", title: "", description: "", location: "" }])} />
            </SectionShell>

            {/* Contribute */}
            <SectionShell
              label="How to Contribute"
              enabled={state.contribution.enabled}
              onToggle={(v) => setState((s) => ({ ...s, contribution: { ...s.contribution, enabled: v } }))}
              title={state.contribution.title}
              onTitle={(v) => setState((s) => ({ ...s, contribution: { ...s.contribution, title: v } }))}
              body={state.contribution.body}
              onBody={(v) => setState((s) => ({ ...s, contribution: { ...s.contribution, body: v } }))}
            >
              {state.contribution.items.map((row, i) => (
                <ItemRow key={i} onRemove={() => setContrib(state.contribution.items.filter((_, idx) => idx !== i))}>
                  <div className="space-y-2">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <select className={SELECT_CLASS} value={row.icon} onChange={(e) => setContrib(state.contribution.items.map((r, idx) => (idx === i ? { ...r, icon: e.target.value } : r)))}>
                        {CONTRIBUTION_ICON_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                      </select>
                      <select className={SELECT_CLASS} value={row.cta} onChange={(e) => setContrib(state.contribution.items.map((r, idx) => (idx === i ? { ...r, cta: e.target.value as "donate" | "signup" } : r)))}>
                        <option value="donate">CTA: Donate</option>
                        <option value="signup">CTA: Sign Up</option>
                      </select>
                    </div>
                    <Input placeholder="Card title (e.g. Financial Support)" value={row.title} onChange={(e) => setContrib(state.contribution.items.map((r, idx) => (idx === i ? { ...r, title: e.target.value } : r)))} />
                    <Textarea rows={2} placeholder="Card body" value={row.body} onChange={(e) => setContrib(state.contribution.items.map((r, idx) => (idx === i ? { ...r, body: e.target.value } : r)))} />
                  </div>
                </ItemRow>
              ))}
              <AddButton label="Add contribution card" onClick={() => setContrib([...state.contribution.items, { icon: "heart", title: "", body: "", cta: "donate" }])} />
            </SectionShell>

            {/* Sponsors */}
            <SectionShell
              label="Sponsors"
              enabled={state.sponsors.enabled}
              onToggle={(v) => setState((s) => ({ ...s, sponsors: { ...s.sponsors, enabled: v } }))}
              title={state.sponsors.title}
              onTitle={(v) => setState((s) => ({ ...s, sponsors: { ...s.sponsors, title: v } }))}
              body={state.sponsors.body}
              onBody={(v) => setState((s) => ({ ...s, sponsors: { ...s.sponsors, body: v } }))}
            >
              {state.sponsors.items.map((row, i) => (
                <ItemRow key={i} onRemove={() => setSponsors(state.sponsors.items.filter((_, idx) => idx !== i))}>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Input placeholder="Sponsor name" value={row.name} onChange={(e) => setSponsors(state.sponsors.items.map((r, idx) => (idx === i ? { ...r, name: e.target.value } : r)))} />
                    <select className={SELECT_CLASS} value={row.tier} onChange={(e) => setSponsors(state.sponsors.items.map((r, idx) => (idx === i ? { ...r, tier: e.target.value as SponsorRow["tier"] } : r)))}>
                      <option value="platinum">Platinum</option>
                      <option value="gold">Gold</option>
                      <option value="silver">Silver</option>
                      <option value="bronze">Bronze</option>
                    </select>
                  </div>
                </ItemRow>
              ))}
              <AddButton label="Add sponsor" onClick={() => setSponsors([...state.sponsors.items, { name: "", tier: "gold" }])} />
              <p className="text-xs text-muted-foreground">The &quot;Interested in sponsoring?&quot; section always shows.</p>
            </SectionShell>

            <div className="flex items-center gap-3 border-t pt-4">
              <Button type="submit" disabled={pending}>
                {pending ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</>) : "Save content"}
              </Button>
              {result?.status === "success" && (
                <span className="flex items-center gap-1 text-sm text-primary"><CheckCircle2 className="h-4 w-4" />{result.message}</span>
              )}
              {result?.status === "error" && <span className="text-sm text-destructive">{result.message}</span>}
            </div>
          </form>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

function BodyField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <Label>Body text</Label>
      <Textarea rows={2} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

function SectionShell({
  label,
  enabled,
  onToggle,
  title,
  onTitle,
  body,
  onBody,
  children,
}: {
  label: string
  enabled: boolean
  onToggle: (v: boolean) => void
  title: string
  onTitle: (v: string) => void
  body: string
  onBody: (v: string) => void
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">{label}</h3>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          Show this tab
          <Switch checked={enabled} onCheckedChange={onToggle} />
        </label>
      </div>
      {enabled && (
        <div className="space-y-3">
          <Field label="Tab heading" value={title} onChange={onTitle} />
          <BodyField value={body} onChange={onBody} />
          <div className="space-y-3">{children}</div>
        </div>
      )}
    </section>
  )
}

function ItemRow({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <div className="flex items-start gap-2 rounded-lg bg-secondary/30 p-3">
      <div className="flex-1">{children}</div>
      <Button type="button" variant="ghost" size="icon" onClick={onRemove} aria-label="Remove">
        <Trash2 className="h-4 w-4 text-muted-foreground" />
      </Button>
    </div>
  )
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button type="button" variant="outline" size="sm" onClick={onClick}>
      <Plus className="mr-1 h-4 w-4" />
      {label}
    </Button>
  )
}
