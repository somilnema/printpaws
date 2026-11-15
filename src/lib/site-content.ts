import "server-only";

import { unstable_cache, revalidatePath, revalidateTag } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { backgroundTileSlot } from "@/lib/backgrounds";
import { clearSiteMedia, ensureSiteMediaBucket } from "@/lib/site-media";
import {
  CONFIGURATOR_MEDIA,
  defaultContent,
  mergeProductContent,
  type ConfiguratorProduct,
  type EverydayContent,
} from "@/lib/everyday-content";
import { DEFAULT_LANDING_CONTENT, mergeLandingContent, type LandingContent } from "@/lib/landing-content";

// Stored next to the media manifest in the public site-media bucket: no SQL setup needed.
const BUCKET = "site-media";
const CONTENT_FILES: Record<ConfiguratorProduct, string> = {
  everyday: "content/everyday.json",
  multi_pet: "content/multi-pet.json",
  you_and_your_pet: "content/you-and-your-pet.json",
};
const CACHE_TAG = "site-content";

export type EverydayContentAdmin = {
  ready: boolean;
  error?: string;
  content: EverydayContent;
  updatedAt: string | null;
};

type Stored = { version: 1; updatedAt: string; content: unknown };

function isMissingObject(error: { message?: string; status?: number; statusCode?: string | number } | null) {
  if (!error) return false;
  const status = Number(error.status ?? error.statusCode);
  if (status === 404 || status === 400) return true;
  return /not found|404|does not exist/i.test(error.message || "");
}

async function readStored(
  product: ConfiguratorProduct
): Promise<{ ok: true; stored: Stored | null } | { ok: false; error: string }> {
  const { data, error } = await supabaseAdmin.storage.from(BUCKET).download(CONTENT_FILES[product]);
  if (error || !data) {
    if (isMissingObject(error)) return { ok: true, stored: null };
    return { ok: false, error: "The configurator text could not be read. Nothing was changed." };
  }
  try {
    const parsed = JSON.parse(await data.text()) as Partial<Stored>;
    if (!parsed || parsed.version !== 1) return { ok: false, error: "The saved configurator text is damaged." };
    return {
      ok: true,
      stored: { version: 1, updatedAt: String(parsed.updatedAt || ""), content: parsed.content },
    };
  } catch {
    return { ok: false, error: "The saved configurator text is damaged." };
  }
}

async function fetchProductContent(product: ConfiguratorProduct): Promise<EverydayContent> {
  try {
    const read = await readStored(product);
    if (!read.ok || !read.stored) return defaultContent(product);
    return mergeProductContent(product, read.stored.content);
  } catch {
    return defaultContent(product);
  }
}

// The product is part of the cache key (unstable_cache keys on the arguments).
const loadCachedContent = unstable_cache(fetchProductContent, ["configurator-content-v2"], {
  tags: [CACHE_TAG],
  revalidate: 60,
});

/** Configurator content for the shop. Missing storage or a slow response falls back to the defaults. */
export async function loadProductContent(product: ConfiguratorProduct): Promise<EverydayContent> {
  const fallback = new Promise<EverydayContent>((resolve) => setTimeout(() => resolve(defaultContent(product)), 8000));
  try {
    return await Promise.race([loadCachedContent(product), fallback]);
  } catch {
    return defaultContent(product);
  }
}

export async function loadEverydayContent(): Promise<EverydayContent> {
  return loadProductContent("everyday");
}

export async function describeProductContent(product: ConfiguratorProduct): Promise<EverydayContentAdmin> {
  try {
    await ensureSiteMediaBucket();
  } catch (error) {
    return {
      ready: false,
      error:
        error instanceof Error
          ? `${error.message} In Supabase, open Storage, create a public bucket named site-media, then try again.`
          : "Storage is not ready. Create a public bucket named site-media, then try again.",
      content: defaultContent(product),
      updatedAt: null,
    };
  }
  const read = await readStored(product);
  if (!read.ok) return { ready: false, error: read.error, content: defaultContent(product), updatedAt: null };
  return {
    ready: true,
    content: read.stored ? mergeProductContent(product, read.stored.content) : defaultContent(product),
    updatedAt: read.stored?.updatedAt || null,
  };
}

export async function describeEverydayContent(): Promise<EverydayContentAdmin> {
  return describeProductContent("everyday");
}

function publish() {
  revalidateTag(CACHE_TAG);
  revalidatePath("/portraits/[slug]", "page");
}

/** Removes tile photos of backgrounds that are gone, so re-adding one starts clean. */
async function clearRemovedTiles(product: ConfiguratorProduct, previous: Stored | null, next: EverydayContent) {
  if (!previous) return;
  const kept = new Set(next.backgrounds.map((bg) => bg.id));
  const removed = mergeProductContent(product, previous.content).backgrounds.filter((bg) => bg.custom && !kept.has(bg.id));
  for (const bg of removed) {
    await clearSiteMedia(backgroundTileSlot(bg.id, CONFIGURATOR_MEDIA[product].prefix)).catch(() => undefined);
  }
}

export async function saveProductContent(product: ConfiguratorProduct, input: unknown) {
  const content = mergeProductContent(product, input);
  try {
    await ensureSiteMediaBucket();
  } catch {
    return {
      ok: false as const,
      error: "Storage is not ready. In Supabase, create a public bucket named site-media, then try again.",
    };
  }
  const previous = await readStored(product);
  const updatedAt = new Date().toISOString();
  const body: Stored = { version: 1, updatedAt, content };
  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(CONTENT_FILES[product], Buffer.from(JSON.stringify(body)), {
      contentType: "application/json",
      cacheControl: "60",
      upsert: true,
    });
  if (error) return { ok: false as const, error: "The text could not be saved. Try again." };
  if (previous.ok) await clearRemovedTiles(product, previous.stored, content);
  publish();
  return { ok: true as const, content, updatedAt };
}

export async function saveEverydayContent(input: unknown) {
  return saveProductContent("everyday", input);
}

export async function resetProductContent(product: ConfiguratorProduct) {
  const previous = await readStored(product);
  const { error } = await supabaseAdmin.storage.from(BUCKET).remove([CONTENT_FILES[product]]);
  if (error && !isMissingObject(error)) return { ok: false as const, error: "The defaults could not be restored. Try again." };
  if (previous.ok) await clearRemovedTiles(product, previous.stored, defaultContent(product));
  publish();
  return { ok: true as const, content: defaultContent(product) };
}

export async function resetEverydayContent() {
  return resetProductContent("everyday");
}

// Landing page and home page copy (Admin → Landing & home → Page text): the same bucket, its own file and cache tag.
const LANDING_FILE = "content/landing.json";
const LANDING_TAG = "landing-content";

export type LandingContentAdmin = {
  ready: boolean;
  error?: string;
  content: LandingContent;
  updatedAt: string | null;
};

async function readLandingStored(): Promise<{ ok: true; stored: Stored | null } | { ok: false; error: string }> {
  const { data, error } = await supabaseAdmin.storage.from(BUCKET).download(LANDING_FILE);
  if (error || !data) {
    if (isMissingObject(error)) return { ok: true, stored: null };
    return { ok: false, error: "The landing page text could not be read. Nothing was changed." };
  }
  try {
    const parsed = JSON.parse(await data.text()) as Partial<Stored>;
    if (!parsed || parsed.version !== 1) return { ok: false, error: "The saved landing page text is damaged." };
    return { ok: true, stored: { version: 1, updatedAt: String(parsed.updatedAt || ""), content: parsed.content } };
  } catch {
    return { ok: false, error: "The saved landing page text is damaged." };
  }
}

async function fetchLandingContent(): Promise<LandingContent> {
  try {
    const read = await readLandingStored();
    if (!read.ok || !read.stored) return DEFAULT_LANDING_CONTENT;
    return mergeLandingContent(read.stored.content);
  } catch {
    return DEFAULT_LANDING_CONTENT;
  }
}

const loadCachedLanding = unstable_cache(fetchLandingContent, ["landing-content-v1"], {
  tags: [LANDING_TAG],
  revalidate: 60,
});

/** Landing and home page copy for the shop. Missing storage or a slow response falls back to the defaults. */
export async function loadLandingContent(): Promise<LandingContent> {
  const fallback = new Promise<LandingContent>((resolve) => setTimeout(() => resolve(DEFAULT_LANDING_CONTENT), 8000));
  try {
    return await Promise.race([loadCachedLanding(), fallback]);
  } catch {
    return DEFAULT_LANDING_CONTENT;
  }
}

export async function describeLandingContent(): Promise<LandingContentAdmin> {
  try {
    await ensureSiteMediaBucket();
  } catch (error) {
    return {
      ready: false,
      error:
        error instanceof Error
          ? `${error.message} In Supabase, open Storage, create a public bucket named site-media, then try again.`
          : "Storage is not ready. Create a public bucket named site-media, then try again.",
      content: DEFAULT_LANDING_CONTENT,
      updatedAt: null,
    };
  }
  const read = await readLandingStored();
  if (!read.ok) return { ready: false, error: read.error, content: DEFAULT_LANDING_CONTENT, updatedAt: null };
  return {
    ready: true,
    content: read.stored ? mergeLandingContent(read.stored.content) : DEFAULT_LANDING_CONTENT,
    updatedAt: read.stored?.updatedAt || null,
  };
}

function publishLanding() {
  revalidateTag(LANDING_TAG);
  revalidatePath("/landing");
  revalidatePath("/");
}

export async function saveLandingContent(input: unknown) {
  const content = mergeLandingContent(input);
  try {
    await ensureSiteMediaBucket();
  } catch {
    return {
      ok: false as const,
      error: "Storage is not ready. In Supabase, create a public bucket named site-media, then try again.",
    };
  }
  const updatedAt = new Date().toISOString();
  const body: Stored = { version: 1, updatedAt, content };
  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(LANDING_FILE, Buffer.from(JSON.stringify(body)), {
      contentType: "application/json",
      cacheControl: "60",
      upsert: true,
    });
  if (error) return { ok: false as const, error: "The text could not be saved. Try again." };
  publishLanding();
  return { ok: true as const, content, updatedAt };
}

export async function resetLandingContent() {
  const { error } = await supabaseAdmin.storage.from(BUCKET).remove([LANDING_FILE]);
  if (error && !isMissingObject(error)) return { ok: false as const, error: "The defaults could not be restored. Try again." };
  publishLanding();
  return { ok: true as const, content: DEFAULT_LANDING_CONTENT };
}
