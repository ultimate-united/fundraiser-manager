"use client" // Error boundaries must be Client Components

import { Button } from "@/components/ui/button"

/**
 * Segment error boundary for the dashboard. Any throw from a DAL fetch (e.g. the
 * backend is down or returns non-2xx) surfaces here instead of a half-rendered page.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 py-24 text-center">
      <h2 className="font-serif text-2xl font-bold">We couldn&apos;t load your dashboard</h2>
      <p className="text-muted-foreground max-w-md text-sm">
        Something went wrong talking to the server. This is usually temporary.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
