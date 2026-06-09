"use client"

import { createContext, useContext } from "react"

export interface AuthUser {
  id: string
  email: string | null
  firstName: string | null
}

const AuthContext = createContext<{ user: AuthUser | null }>({ user: null })

/**
 * Provides the current user (resolved server-side from the Supabase auth cookie
 * in the root layout) to client components. No client-side fetch/effect — the
 * value refreshes on navigation / router.refresh() after login or sign-out.
 */
export function AuthProvider({
  initialUser,
  children,
}: {
  initialUser: AuthUser | null
  children: React.ReactNode
}) {
  return <AuthContext.Provider value={{ user: initialUser }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
