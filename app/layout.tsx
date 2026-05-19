import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} bg-background`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
