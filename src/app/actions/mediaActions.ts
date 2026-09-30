"use server";

import { getAdminSession } from "@/lib/admin-auth";
import { clearSiteMedia, describeSiteMedia, saveSiteMedia, type SiteMediaAdmin } from "@/lib/site-media";

export type { SiteMediaAdmin, SiteMediaSlotView } from "@/lib/site-media";

export async function getSiteMediaAdmin(): Promise<SiteMediaAdmin | null> {
  const session = await getAdminSession();
  if (!session) return null;
  return describeSiteMedia();
}

export async function replaceSiteMedia(formData: FormData) {
  const session = await getAdminSession();
  if (!session) return { ok: false as const, error: "Sign in again to continue." };

  const slot = String(formData.get("slot") || "");
  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false as const, error: "Choose a file first." };

  const bytes = Buffer.from(await file.arrayBuffer());
  return saveSiteMedia(slot, bytes);
}

export async function resetSiteMedia(slotId: string) {
  const session = await getAdminSession();
  if (!session) return { ok: false as const, error: "Sign in again to continue." };
  return clearSiteMedia(slotId);
}
