import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { SettingsContent } from "@/components/dashboard/settings-content"
import { getMe, getNotifications } from "@/lib/api/users"
import { getDashboardUser } from "@/lib/dashboard"

export default async function DashboardSettingsPage() {
  const user = await getDashboardUser("/dashboard/settings")
  const [profile, notifications] = await Promise.all([getMe(), getNotifications()])

  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <DashboardSidebar user={user} />
          <SettingsContent
            user={user}
            profile={{ firstName: profile.first_name, lastName: profile.last_name }}
            notifications={notifications}
          />
        </div>
      </main>
      <Footer />
    </div>
  )
}
