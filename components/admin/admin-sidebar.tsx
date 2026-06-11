"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { LayoutDashboard, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

/** Add new admin sections here as they're built. */
const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, match: (p: string) => p === "/admin" },
  {
    href: "/admin/events",
    label: "Events",
    icon: Calendar,
    match: (p: string) => p.startsWith("/admin/events"),
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="lg:w-64 flex-shrink-0">
      <Card className="sticky top-24">
        <CardContent className="p-4">
          <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Admin
          </p>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = item.match(pathname)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </CardContent>
      </Card>
    </aside>
  )
}
