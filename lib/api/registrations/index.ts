import { apiFetch } from "@/lib/api/client"

import { registrationEndpoints } from "./endpoints"
import type { RegistrationOut } from "./types"

/** The current user's event registrations (all statuses). */
export function getMyRegistrations() {
  return apiFetch<RegistrationOut[]>(registrationEndpoints.mine)
}

export type { RegistrationOut, RegistrationRole, RegistrationStatus } from "./types"
