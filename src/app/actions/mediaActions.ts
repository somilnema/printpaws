"use server";

import { getAdminSession } from "@/lib/admin-auth";
import {
  beginSiteMediaVideoUpload,
  clearSiteMedia,
  describeSiteMedia,
  discardSiteMediaUpload,
  finishSiteMediaVideoUpload,
  saveSiteMedia,
  type SiteMediaAdmin,
} from "@/lib/site-media";

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

export async function startSiteMediaVideoUpload(input: { slot: string; type: string; size: number }) {
  const session = await getAdminSession();
  if (!session) return { ok: false as const, error: "Sign in again to continue." };

  const slot = String(input.slot || "");
  const type = String(input.type || "");
  const size = Number(input.size) || 0;
  return beginSiteMediaVideoUpload(slot, size, type);
}

export async function completeSiteMediaVideoUpload(input: { slot: string; path: string; size: number }) {
  const session = await getAdminSession();
  if (!session) return { ok: false as const, error: "Sign in again to continue." };

  const slot = String(input.slot || "");
  const path = String(input.path || "");
  const size = Number(input.size) || 0;
  return finishSiteMediaVideoUpload(slot, path, size);
}

export async function cancelSiteMediaVideoUpload(input: { path: string }) {
  const session = await getAdminSession();
  if (!session) return { ok: false as const, error: "Sign in again to continue." };
  return discardSiteMediaUpload(String(input.path || ""));
}

export async function resetSiteMedia(slotId: string) {
  const session = await getAdminSession();
  if (!session) return { ok: false as const, error: "Sign in again to continue." };
  return clearSiteMedia(slotId);
}
