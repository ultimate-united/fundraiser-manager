import { redirect } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { getMe } from "@/lib/api/users"
import { createClient } from "@/lib/supabase/server"

/** Admin-only shell: requires login + profile.role === 'admin'. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login?redirect=/admin")

  let role: string | null = null
  try {
    role = (await getMe()).role
  } catch {
    role = null
  }
  if (role !== "admin") redirect("/dashboard")

  return (
    <div className="flex min-h-screen flex-col bg-secondary/30">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
      <Footer />
    </div>
  )
}
