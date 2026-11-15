"use server";

import { getAdminSession } from "@/lib/admin-auth";
import { clearLandingProductImage } from "@/lib/landing-products";
import {
  describeLandingContent,
  resetLandingContent,
  saveLandingContent,
  type LandingContentAdmin,
} from "@/lib/site-content";

export type { LandingContentAdmin } from "@/lib/site-content";

export async function getLandingContentAdmin(): Promise<LandingContentAdmin | null> {
  const session = await getAdminSession();
  if (!session) return null;
  return describeLandingContent();
}

export async function updateLandingContent(input: unknown) {
  const session = await getAdminSession();
  if (!session) return { ok: false as const, error: "Sign in again to continue." };
  return saveLandingContent(input);
}

export async function restoreLandingContent() {
  const session = await getAdminSession();
  if (!session) return { ok: false as const, error: "Sign in again to continue." };
  return resetLandingContent();
}

export async function removeLandingProductPhoto(id: string) {
  const session = await getAdminSession();
  if (!session) return { ok: false as const, error: "Sign in again to continue." };
  if (typeof id !== "string" || !id) return { ok: false as const, error: "Choose a product first." };
  return clearLandingProductImage(id);
}
