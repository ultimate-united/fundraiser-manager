import { Heart, Clock, Lightbulb, Users, Gift, Sparkles, type LucideIcon } from "lucide-react"

/** Selectable icons for "How to Contribute" cards (key stored in section content). */
export const CONTRIBUTION_ICONS: Record<string, LucideIcon> = {
  heart: Heart,
  clock: Clock,
  lightbulb: Lightbulb,
  users: Users,
  gift: Gift,
  sparkles: Sparkles,
}

export const CONTRIBUTION_ICON_OPTIONS = [
  { value: "heart", label: "Heart" },
  { value: "clock", label: "Clock" },
  { value: "lightbulb", label: "Idea" },
  { value: "users", label: "People" },
  { value: "gift", label: "Gift" },
  { value: "sparkles", label: "Sparkles" },
] as const
