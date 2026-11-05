"use server";

import { getAdminSession } from "@/lib/admin-auth";
import {
  describeEverydayContent,
  resetEverydayContent,
  saveEverydayContent,
  type EverydayContentAdmin,
} from "@/lib/site-content";

export type { EverydayContentAdmin } from "@/lib/site-content";

export async function getEverydayContentAdmin(): Promise<EverydayContentAdmin | null> {
  const session = await getAdminSession();
  if (!session) return null;
  return describeEverydayContent();
}

export async function updateEverydayContent(input: unknown) {
  const session = await getAdminSession();
  if (!session) return { ok: false as const, error: "Sign in again to continue." };
  return saveEverydayContent(input);
}

export async function restoreEverydayContent() {
  const session = await getAdminSession();
  if (!session) return { ok: false as const, error: "Sign in again to continue." };
  return resetEverydayContent();
}
