import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

/** Form-shaped skeleton for the event registration page (mirrors its layout). */
export default function RegisterLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader className="space-y-2">
              <Skeleton className="h-7 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Participant / volunteer toggle */}
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
              </div>
              {/* Fields */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full sm:col-span-2" />
              </div>
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-11 w-full" />
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
