import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/components/auth/auth-provider'
import { createClient } from '@/lib/supabase/server'
import './globals.css'

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: '--font-serif',
  display: 'swap',
})

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Ultimate United - Making A Difference Everyday',
  description: 'A nonprofit organization dedicated to promoting education and providing resources to underprivileged communities in Hong Kong. Join us in making a difference today.',
  keywords: ['nonprofit', 'Hong Kong', 'charity', 'education', 'community', 'fundraising', 'events'],
  openGraph: {
    title: 'Ultimate United - Making A Difference Everyday',
    description: 'A nonprofit organization dedicated to promoting education and providing resources to underprivileged communities in Hong Kong.',
    type: 'website',
    locale: 'en_HK',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Resolve the signed-in user once from the auth cookie and share it app-wide.
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const authUser = user
    ? {
        id: user.id,
        email: user.email ?? null,
        firstName: (user.user_metadata?.first_name as string | undefined) ?? null,
      }
    : null

  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} bg-background`}>
      <body className="font-sans antialiased">
        <AuthProvider initialUser={authUser}>
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </AuthProvider>
      </body>
    </html>
  )
}
