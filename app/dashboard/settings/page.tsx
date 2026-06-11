import { SettingsContent } from "@/components/dashboard/settings-content"
import { getMe, getNotifications } from "@/lib/api/users"
import { getDashboardUser } from "@/lib/dashboard"

export default async function DashboardSettingsPage() {
  const user = await getDashboardUser()
  const [profile, notifications] = await Promise.all([getMe(), getNotifications()])

  return (
    <SettingsContent
      user={user}
      profile={{ firstName: profile.first_name, lastName: profile.last_name }}
      notifications={notifications}
    />
  )
}
