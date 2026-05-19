import { Suspense } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import { Loader2 } from "lucide-react"

export default async function DashboardPage() {
  // TODO: Remove bypass and restore Supabase auth when configured
  // const supabase = await createClient()
  // const { data: { user } } = await supabase.auth.getUser()
  // if (!user) redirect("/auth/login?redirect=/dashboard")

  const mockUserData = {
    id: "dev-bypass",
    email: "dev@placeholder.com",
    firstName: "Member",
    lastName: "",
    avatarUrl: null,
    totalPoints: 285,
    tier: "silver" as const,
    eventsAttended: 8,
    totalDonated: 750,
    hoursVolunteered: 24,
  }

  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <DashboardSidebar user={mockUserData} />
          <Suspense fallback={
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          }>
            <DashboardOverview user={mockUserData} />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  )
}
