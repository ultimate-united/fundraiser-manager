"use server"

import { revalidatePath } from "next/cache"

import { approveEvent, rejectEvent, requestChanges } from "@/lib/api/admin"

export async function approveAction(id: string) {
  await approveEvent(id)
  revalidatePath("/admin/review")
}

export async function rejectAction(id: string, note: string) {
  await rejectEvent(id, note)
  revalidatePath("/admin/review")
}

export async function requestChangesAction(id: string, note: string) {
  await requestChanges(id, note)
  revalidatePath("/admin/review")
}
