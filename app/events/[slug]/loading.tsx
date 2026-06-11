import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Event-detail skeleton, co-located so it fires when navigating deeper from the
 * events list into /events/[slug] (a parent boundary wouldn't re-show). Mirrors
 * the EventHero + tabs layout.
 */
export default function EventDetailLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="relative">
          <Skeleton className="h-64 w-full rounded-none sm:h-80 lg:h-96" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="-mt-16 relative z-10 rounded-2xl border border-border bg-card p-6 shadow-lg sm:p-8 lg:p-10">
              <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
                <div className="flex-1 space-y-4">
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-10 w-2/3" />
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-24 w-full rounded-xl" />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                  </div>
                </div>
                <div className="w-full lg:w-80">
                  <Skeleton className="h-72 w-full rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        </section>
        <div className="mx-auto max-w-7xl space-y-4 px-4 py-12 sm:px-6 lg:px-8">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </main>
      <Footer />
    </div>
  )
}
