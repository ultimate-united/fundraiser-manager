// Event types
export interface ImpactItem {
  amount: number
  title: string
  description: string
}

/** Editable per-tab heading/body + show toggle (from event_sections). */
export interface SectionContent {
  title: string
  body: string
  enabled: boolean
}

export interface EventTabContent {
  overview: SectionContent
  schedule: SectionContent
  contribution: SectionContent
  sponsors: SectionContent
}

export interface Event {
  id: string
  slug: string
  title: string
  subtitle?: string
  description: string
  mission: string
  bannerImage: string
  date: string
  endDate?: string
  location: string
  fundraisingGoal: number
  amountRaised: number
  participantCount: number
  participantGoal?: number
  sponsors: Sponsor[]
  schedule: ScheduleItem[]
  contributionTypes: ContributionType[]
  impact?: ImpactItem[]
  /** Editable tab headings/bodies + enable flags (detail view only). */
  tabContent?: EventTabContent
  status: 'upcoming' | 'ongoing' | 'completed'
  featured?: boolean
  createdAt: string
  updatedAt: string
}

export interface Sponsor {
  id: string
  name: string
  logo?: string
  tier: 'platinum' | 'gold' | 'silver' | 'bronze'
  website?: string
}

export interface ScheduleItem {
  id: string
  time: string
  endTime?: string
  title: string
  description?: string
  location?: string
}

export interface ContributionType {
  type: 'donation' | 'time' | 'skills'
  title: string
  description: string
  icon?: string
}

// User types
export interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string
  profileType: 'individual' | 'family' | 'corporate' | 'in-need'
  createdAt: string
  updatedAt: string
}

export interface Donation {
  id: string
  userId: string
  eventId: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  stripePaymentIntentId?: string
  dedicatedTo?: string
  message?: string
  isAnonymous: boolean
  createdAt: string
}

export interface RewardPoints {
  userId: string
  points: number
  history: PointTransaction[]
}

export interface PointTransaction {
  id: string
  points: number
  type: 'earned' | 'redeemed'
  reason: string
  createdAt: string
}

// API Response types
export interface ApiResponse<T> {
  data: T
  error?: string
  message?: string
}
