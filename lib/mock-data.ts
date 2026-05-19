import type { Event } from './types'

// Mock events data - In production, this would come from Supabase
export const mockEvents: Event[] = [
  {
    id: '1',
    slug: 'run-for-hope-2026',
    title: 'Run for Hope 2026',
    subtitle: 'Every Step Counts',
    description: 'Join us for our annual charity run supporting underprivileged children in Hong Kong. This year, we are running to raise funds for education resources, after-school programs, and mental health support for over 390 children across the city.',
    mission: 'To provide educational opportunities and emotional support for underprivileged children, empowering them to break the cycle of poverty through knowledge and community.',
    bannerImage: '/images/run-for-hope-banner.jpg',
    date: '2026-07-15T08:00:00+08:00',
    endDate: '2026-07-15T18:00:00+08:00',
    location: 'Victoria Park, Hong Kong',
    fundraisingGoal: 500000,
    amountRaised: 287500,
    participantCount: 342,
    participantGoal: 500,
    sponsors: [
      { id: 's1', name: 'Hong Kong Community Foundation', tier: 'platinum' },
      { id: 's2', name: 'Pacific Century Group', tier: 'gold' },
      { id: 's3', name: 'HSBC', tier: 'gold' },
      { id: 's4', name: 'Swire Properties', tier: 'silver' },
    ],
    schedule: [
      { id: 'sch1', time: '08:00', title: 'Registration & Check-in', description: 'Collect your race kit and warm up', location: 'Main Entrance' },
      { id: 'sch2', time: '09:00', title: 'Opening Ceremony', description: 'Welcome address and mission sharing', location: 'Main Stage' },
      { id: 'sch3', time: '09:30', title: '10km Run Starts', description: 'Competitive and fun run categories', location: 'Start Line' },
      { id: 'sch4', time: '10:00', title: '5km Family Run Starts', description: 'Perfect for families with children', location: 'Start Line' },
      { id: 'sch5', time: '12:00', title: 'Community Lunch', description: 'Enjoy local food stalls and connect with fellow runners', location: 'Food Village' },
      { id: 'sch6', time: '14:00', title: 'Awards Ceremony', description: 'Celebrating our top fundraisers and runners', location: 'Main Stage' },
      { id: 'sch7', time: '15:00', title: 'Charity Auction', description: 'Bid on exclusive items to support our cause', location: 'Auction Tent' },
      { id: 'sch8', time: '17:00', title: 'Closing & Thank You', description: 'Gratitude ceremony and group photo', location: 'Main Stage' },
    ],
    contributionTypes: [
      { type: 'donation', title: 'Financial Support', description: 'Every dollar directly supports educational materials, tutoring, and after-school programs for children in need.' },
      { type: 'time', title: 'Volunteer Your Time', description: 'Help us on event day with registration, water stations, or cheering stations. No experience needed!' },
      { type: 'skills', title: 'Share Your Skills', description: 'Are you a photographer, first-aider, or event coordinator? We need your expertise!' },
    ],
    status: 'upcoming',
    featured: true,
    createdAt: '2026-01-15T00:00:00+08:00',
    updatedAt: '2026-05-01T00:00:00+08:00',
  },
  {
    id: '2',
    slug: 'mothers-day-celebration-2026',
    title: "Mother's Day Celebration 2026",
    subtitle: 'Honoring Single Mothers',
    description: 'A special celebration honoring the incredible single mothers in our community. Join us for a day of pampering, workshops, and community building.',
    mission: 'To recognize and support single mothers who work tirelessly to provide for their families, offering them a day of rest and appreciation.',
    bannerImage: '/images/mothers-day-banner.jpg',
    date: '2026-05-10T10:00:00+08:00',
    endDate: '2026-05-10T16:00:00+08:00',
    location: 'Tsim Sha Tsui Community Center',
    fundraisingGoal: 150000,
    amountRaised: 98000,
    participantCount: 96,
    participantGoal: 120,
    sponsors: [
      { id: 's5', name: 'Women for Women HK', tier: 'platinum' },
      { id: 's6', name: 'Family First Foundation', tier: 'gold' },
    ],
    schedule: [
      { id: 'sch9', time: '10:00', title: 'Welcome & Registration', description: 'Light refreshments provided', location: 'Main Hall' },
      { id: 'sch10', time: '10:30', title: 'Wellness Workshop', description: 'Self-care and stress management techniques', location: 'Workshop Room A' },
      { id: 'sch11', time: '12:00', title: 'Lunch & Networking', description: 'Connect with other mothers and share stories', location: 'Dining Hall' },
      { id: 'sch12', time: '14:00', title: 'Pampering Sessions', description: 'Complimentary haircuts, manicures, and massages', location: 'Wellness Zone' },
      { id: 'sch13', time: '15:30', title: 'Closing Ceremony', description: 'Gift distribution and group celebration', location: 'Main Hall' },
    ],
    contributionTypes: [
      { type: 'donation', title: 'Sponsor a Mother', description: 'Your donation provides gift packages, meals, and wellness treatments for mothers in need.' },
      { type: 'time', title: 'Event Support', description: 'Help with setup, serving meals, or childcare during the event.' },
      { type: 'skills', title: 'Professional Services', description: 'Hairstylists, nail technicians, and massage therapists needed for pampering sessions.' },
    ],
    status: 'upcoming',
    featured: false,
    createdAt: '2026-02-01T00:00:00+08:00',
    updatedAt: '2026-04-15T00:00:00+08:00',
  },
  {
    id: '3',
    slug: 'summer-learning-camp-2026',
    title: 'Summer Learning Camp 2026',
    subtitle: 'Igniting Young Minds',
    description: 'A two-week intensive summer camp providing educational enrichment, creative arts, and life skills training for underprivileged children aged 6-14.',
    mission: 'To bridge the educational gap during summer holidays, ensuring that children from low-income families continue to learn and grow.',
    bannerImage: '/images/summer-camp-banner.jpg',
    date: '2026-08-01T09:00:00+08:00',
    endDate: '2026-08-14T17:00:00+08:00',
    location: 'Multiple Locations Across Hong Kong',
    fundraisingGoal: 300000,
    amountRaised: 45000,
    participantCount: 78,
    participantGoal: 200,
    sponsors: [
      { id: 's7', name: 'Education First HK', tier: 'platinum' },
      { id: 's8', name: 'Youth Development Fund', tier: 'silver' },
    ],
    schedule: [
      { id: 'sch14', time: '09:00', title: 'Morning Assembly', description: 'Daily briefing and energizer activities' },
      { id: 'sch15', time: '09:30', title: 'Academic Sessions', description: 'English, Math, and Science workshops' },
      { id: 'sch16', time: '12:00', title: 'Lunch Break', description: 'Nutritious meals provided' },
      { id: 'sch17', time: '13:00', title: 'Creative Arts', description: 'Music, art, and drama classes' },
      { id: 'sch18', time: '15:00', title: 'Sports & Recreation', description: 'Team building and physical activities' },
      { id: 'sch19', time: '16:30', title: 'Reflection & Closing', description: 'Daily journal writing and sharing' },
    ],
    contributionTypes: [
      { type: 'donation', title: 'Sponsor a Child', description: 'HK$1,500 sponsors one child for the entire two-week camp including meals, materials, and activities.' },
      { type: 'time', title: 'Teaching Assistant', description: 'Help our teachers in classrooms, supervise activities, or mentor students.' },
      { type: 'skills', title: 'Guest Instructor', description: 'Share your expertise in arts, sports, coding, or any special skill with our campers.' },
    ],
    status: 'upcoming',
    featured: false,
    createdAt: '2026-03-01T00:00:00+08:00',
    updatedAt: '2026-05-10T00:00:00+08:00',
  },
]

export function getEventBySlug(slug: string): Event | undefined {
  return mockEvents.find(event => event.slug === slug)
}

export function getFeaturedEvents(): Event[] {
  return mockEvents.filter(event => event.featured)
}

export function getUpcomingEvents(): Event[] {
  return mockEvents.filter(event => event.status === 'upcoming')
}
