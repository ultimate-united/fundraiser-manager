"use client"

import { useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const GENERAL_FUND = "general"

interface EventOption {
  slug: string
  title: string
}

interface EventSelectorProps {
  options: EventOption[]
  /** Currently selected event slug, or "general" for the general fund. */
  current: string
}

/**
 * Lets the donor choose which event to support. Changing the selection updates
 * the ?event= query param, which re-resolves the whole donate page (hero, impact
 * tiers, supporters wall, and the donation's attribution) server-side.
 */
export function EventSelector({ options, current }: EventSelectorProps) {
  const router = useRouter()

  const handleChange = (value: string) => {
    router.push(value === GENERAL_FUND ? "/donate" : `/donate?event=${value}`)
  }

  return (
    <div className="space-y-2 rounded-xl border bg-card p-5">
      <Label htmlFor="event-select" className="text-base font-medium">
        Where would you like to give?
      </Label>
      <Select value={current} onValueChange={handleChange}>
        <SelectTrigger id="event-select" className="w-full">
          <SelectValue placeholder="Choose where to give" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={GENERAL_FUND}>General Fund (where it&apos;s needed most)</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.slug} value={option.slug}>
              {option.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
