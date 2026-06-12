import { getEvent, getEvents } from "@/lib/api/events"
import type { EventDetail, EventListItem } from "@/lib/api/events/types"
import type {
  ContributionType,
  Event,
  OverviewCard,
  ScheduleItem,
  SectionContent,
  Sponsor,
} from "@/lib/types"

/**
 * Events view-model layer: maps the FastAPI events DTOs (snake_case, money in
 * minor units, dynamic JSONB sections) into the camelCase `Event` shape the
 * public components (EventCard / EventHero / EventTabs) already consume.
 * Mirrors lib/dashboard.ts. Server-only — reached via the JWT-forwarding DAL.
 */

const centsToDollars = (cents: number | null | undefined) => Math.round((cents ?? 0) / 100)

/** The `Event` view model narrows status to 3 values; map the 5 backend statuses onto it. */
function mapStatus(status: string): Event["status"] {
  return status === "upcoming" || status === "ongoing" || status === "completed" ? status : "completed"
}

/** Shared core fields present on both list items and detail responses. */
function toBaseView(
  dto: EventListItem,
): Omit<Event, "sponsors" | "schedule" | "contributionTypes" | "overviewCards"> {
  return {
    id: dto.id,
    slug: dto.slug,
    title: dto.title,
    subtitle: dto.subtitle ?? undefined,
    description: dto.summary ?? "",
    mission: dto.mission ?? "",
    bannerImage: dto.banner_image ?? "",
    date: dto.starts_at ?? "",
    endDate: dto.ends_at ?? undefined,
    location: dto.location ?? "",
    fundraisingGoal: centsToDollars(dto.fundraising_goal),
    amountRaised: centsToDollars(dto.amount_raised),
    participantCount: dto.participant_count ?? 0,
    participantGoal: dto.participant_goal ?? undefined,
    impact: dto.impact ?? [],
    status: mapStatus(dto.status),
    featured: dto.featured,
    createdAt: "",
    updatedAt: "",
  }
}

// Fallback tab headings only (content/body comes from the DB; bodies are seeded
// at create time + backfilled, so these titles are a defensive label fallback).
const SECTION_DEFAULTS = {
  overview: { title: "About This Event" },
  schedule: { title: "Event Schedule" },
  contribution: { title: "How You Can Contribute" },
  sponsors: { title: "Our Sponsors" },
} as const

/** Items for a section — tolerant of legacy array content and the { body, items } shape. */
function sectionItems<T>(detail: EventDetail, kind: string): T[] {
  const content = detail.sections.find((s) => s.kind === kind)?.content
  if (Array.isArray(content)) return content as T[]
  if (content && typeof content === "object" && Array.isArray((content as { items?: unknown[] }).items)) {
    return (content as { items: T[] }).items
  }
  return []
}

/** Editable heading/body/enabled for a tab, falling back to the original copy. */
function tabSection(
  detail: EventDetail,
  kind: string,
  defaults: { title: string },
  alwaysEnabled = false,
): SectionContent {
  const section = detail.sections.find((s) => s.kind === kind)
  const content = section?.content
  const storedBody =
    content && !Array.isArray(content) && typeof content === "object"
      ? ((content as { body?: string }).body ?? "")
      : ""
  return {
    title: section?.title || defaults.title,
    body: storedBody,
    enabled: alwaysEnabled ? true : section ? (section.enabled ?? true) : false,
  }
}

/** List view: no sections available from the feed, so contribution surfaces are empty. */
function toListView(dto: EventListItem): Event {
  return { ...toBaseView(dto), sponsors: [], schedule: [], contributionTypes: [], overviewCards: [] }
}

/** Detail view: hydrate sponsors / schedule / contribution tabs from JSONB sections. */
function toDetailView(detail: EventDetail): Event {
  const base = toBaseView(detail)

  const sponsors: Sponsor[] = sectionItems<{
    name: string
    tier: Sponsor["tier"]
    logo?: string
    website?: string
  }>(detail, "sponsors").map((s, i) => ({
    id: `sponsor-${i}`,
    name: s.name,
    tier: s.tier,
    logo: s.logo,
    website: s.website,
  }))

  const schedule: ScheduleItem[] = sectionItems<Omit<ScheduleItem, "id">>(detail, "schedule").map(
    (item, i) => ({ id: `sch-${i}`, ...item }),
  )

  const legacyIcon: Record<string, string> = { donation: "heart", time: "clock", skills: "lightbulb" }
  const contributionTypes: ContributionType[] = sectionItems<{
    icon?: string
    type?: string
    title?: string
    body?: string
    description?: string
    cta?: "donate" | "signup"
  }>(detail, "contribution").map((it) => ({
    icon: it.icon ?? (it.type ? legacyIcon[it.type] : undefined) ?? "heart",
    title: it.title ?? "",
    body: it.body ?? it.description ?? "",
    cta: it.cta ?? (it.type === "donation" ? "donate" : "signup"),
  }))

  const overviewCards: OverviewCard[] = sectionItems<{
    icon?: string
    title?: string
    body?: string
  }>(detail, "rich_text").map((c) => ({
    icon: c.icon ?? "heart",
    title: c.title ?? "",
    body: c.body ?? "",
  }))

  const tabContent = {
    overview: tabSection(detail, "rich_text", SECTION_DEFAULTS.overview, true),
    schedule: tabSection(detail, "schedule", SECTION_DEFAULTS.schedule),
    contribution: tabSection(detail, "contribution", SECTION_DEFAULTS.contribution),
    sponsors: tabSection(detail, "sponsors", SECTION_DEFAULTS.sponsors),
  }
  // Overview body falls back to the event summary when no rich_text section exists.
  if (!tabContent.overview.body) tabContent.overview.body = base.description ?? ""

  return { ...base, sponsors, schedule, contributionTypes, overviewCards, tabContent }
}

/** Upcoming events for the landing grid (matches the page's "Upcoming Events" heading). */
export async function getEventsView(): Promise<Event[]> {
  const events = await getEvents({ status: "upcoming" })
  return events.map(toListView)
}

/** A single public event by slug, or null if it doesn't exist (404). */
export async function getEventView(slug: string): Promise<Event | null> {
  try {
    return toDetailView(await getEvent(slug))
  } catch (err) {
    if (err instanceof Error && err.message.includes("404")) return null
    throw err
  }
}
