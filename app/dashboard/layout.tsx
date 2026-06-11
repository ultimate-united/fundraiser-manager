import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { getDashboardUser } from "@/lib/dashboard"

/**
 * Persistent dashboard shell. The Header + sidebar live here, so navigating
 * between tabs only re-renders {children} (the content) — the sidebar stays put
 * and only the content area shows the loading skeleton (app/dashboard/loading.tsx).
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getDashboardUser()

  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <DashboardSidebar user={user} />
          {children}
        </div>
      </main>
      <Footer />
    </div>
  )
}
