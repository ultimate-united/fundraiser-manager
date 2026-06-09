import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  outputFileTracingRoot: __dirname,
  experimental: {
    // Reuse the client-side Router Cache for dynamic routes when navigating
    // (default dynamic=0 refetches on every tab switch). Dashboard tabs now
    // serve from cache for 30s; bust it after mutations with router.refresh().
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
}

export default nextConfig
