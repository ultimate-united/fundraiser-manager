import { createClient } from "@/lib/supabase/server"

/**
 * Base URL of the FastAPI backend. Defaults to local dev; override with
 * NEXT_PUBLIC_API_URL in production deploys.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

/**
 * Low-level server-side fetch to the FastAPI backend, forwarding the caller's
 * Supabase JWT as a Bearer token. Throws on any non-2xx so failures surface at
 * the nearest error.tsx boundary (React 19 / App Router pattern) — callers in
 * the per-category Data Access Layer do NOT swallow this.
 *
 * Server-only: reads the auth cookie via the server Supabase client. Use it
 * through the typed DAL functions (lib/api/<resource>), not directly in pages.
 */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const token = session?.access_token

  const res = await fetch(`${API_BASE}/api/v1${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error(`API ${init?.method ?? "GET"} ${path} failed: ${res.status} ${await res.text()}`)
  }
  return res.json() as Promise<T>
}
