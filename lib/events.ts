import { getEvent, getEvents } from "@/lib/api/events"
import type { EventDetail, EventListItem } from "@/lib/api/events/types"
import type { ContributionType, Event, ScheduleItem, Sponsor } from "@/lib/types"

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
function toBaseView(dto: EventListItem): Omit<Event, "sponsors" | "schedule" | "contributionTypes"> {
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

/** Pull the content array of the first section with the given kind, or []. */
function sectionContent<T>(detail: EventDetail, kind: string): T[] {
  const section = detail.sections.find((s) => s.kind === kind)
  return Array.isArray(section?.content) ? (section.content as T[]) : []
}

/** List view: no sections available from the feed, so contribution surfaces are empty. */
function toListView(dto: EventListItem): Event {
  return { ...toBaseView(dto), sponsors: [], schedule: [], contributionTypes: [] }
}

/** Detail view: hydrate sponsors / schedule / contribution tabs from JSONB sections. */
function toDetailView(detail: EventDetail): Event {
  const sponsors: Sponsor[] = sectionContent<{ name: string; tier: Sponsor["tier"]; logo?: string; website?: string }>(
    detail,
    "sponsors",
  ).map((s, i) => ({ id: `sponsor-${i}`, name: s.name, tier: s.tier, logo: s.logo, website: s.website }))

  const schedule: ScheduleItem[] = sectionContent<Omit<ScheduleItem, "id">>(detail, "schedule").map((item, i) => ({
    id: `sch-${i}`,
    ...item,
  }))

  const contributionTypes = sectionContent<ContributionType>(detail, "contribution")

  return { ...toBaseView(detail), sponsors, schedule, contributionTypes }
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
