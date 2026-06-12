import {
  Heart,
  Clock,
  Lightbulb,
  Users,
  Gift,
  Sparkles,
  Building,
  GraduationCap,
  type LucideIcon,
} from "lucide-react"

/** Selectable icons for contribution + overview cards (key stored in section content). */
export const CONTRIBUTION_ICONS: Record<string, LucideIcon> = {
  heart: Heart,
  clock: Clock,
  lightbulb: Lightbulb,
  users: Users,
  gift: Gift,
  sparkles: Sparkles,
  building: Building,
  education: GraduationCap,
}

export const CONTRIBUTION_ICON_OPTIONS = [
  { value: "heart", label: "Heart" },
  { value: "clock", label: "Clock" },
  { value: "lightbulb", label: "Idea" },
  { value: "users", label: "People" },
  { value: "gift", label: "Gift" },
  { value: "sparkles", label: "Sparkles" },
  { value: "building", label: "Building" },
  { value: "education", label: "Education" },
] as const
