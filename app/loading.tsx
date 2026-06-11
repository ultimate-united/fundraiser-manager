import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * App-wide loading fallback (catch-all). Next shows this instantly on navigation
 * to any dynamic route that lacks its own loading.tsx, so the URL flips right away
 * and the user sees a skeleton instead of the previous page sitting "stuck".
 * More specific routes (e.g. /dashboard) override this with their own loading.tsx.
 */
export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl space-y-8 px-4 py-16 sm:px-6 lg:px-8">
          <div className="space-y-3">
            <Skeleton className="h-10 w-2/3 max-w-md" />
            <Skeleton className="h-5 w-1/2 max-w-sm" />
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-72 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
