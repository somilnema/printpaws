import "server-only";

import { unstable_cache, revalidatePath, revalidateTag } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { ensureSiteMediaBucket } from "@/lib/site-media";
import { DEFAULT_EVERYDAY_CONTENT, mergeEverydayContent, type EverydayContent } from "@/lib/everyday-content";

// Stored next to the media manifest in the public site-media bucket: no SQL setup needed.
const BUCKET = "site-media";
const EVERYDAY_FILE = "content/everyday.json";
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

async function readStored(): Promise<{ ok: true; stored: Stored | null } | { ok: false; error: string }> {
  const { data, error } = await supabaseAdmin.storage.from(BUCKET).download(EVERYDAY_FILE);
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

async function fetchEverydayContent(): Promise<EverydayContent> {
  try {
    const read = await readStored();
    if (!read.ok || !read.stored) return DEFAULT_EVERYDAY_CONTENT;
    return mergeEverydayContent(read.stored.content);
  } catch {
    return DEFAULT_EVERYDAY_CONTENT;
  }
}

const loadCachedEveryday = unstable_cache(fetchEverydayContent, ["everyday-content-v1"], {
  tags: [CACHE_TAG],
  revalidate: 60,
});

/** Configurator content for the shop. Missing storage or a slow response falls back to the defaults. */
export async function loadEverydayContent(): Promise<EverydayContent> {
  const fallback = new Promise<EverydayContent>((resolve) => setTimeout(() => resolve(DEFAULT_EVERYDAY_CONTENT), 8000));
  try {
    return await Promise.race([loadCachedEveryday(), fallback]);
  } catch {
    return DEFAULT_EVERYDAY_CONTENT;
  }
}

export async function describeEverydayContent(): Promise<EverydayContentAdmin> {
  try {
    await ensureSiteMediaBucket();
  } catch (error) {
    return {
      ready: false,
      error:
        error instanceof Error
          ? `${error.message} In Supabase, open Storage, create a public bucket named site-media, then try again.`
          : "Storage is not ready. Create a public bucket named site-media, then try again.",
      content: DEFAULT_EVERYDAY_CONTENT,
      updatedAt: null,
    };
  }
  const read = await readStored();
  if (!read.ok) return { ready: false, error: read.error, content: DEFAULT_EVERYDAY_CONTENT, updatedAt: null };
  return {
    ready: true,
    content: read.stored ? mergeEverydayContent(read.stored.content) : DEFAULT_EVERYDAY_CONTENT,
    updatedAt: read.stored?.updatedAt || null,
  };
}

function publish() {
  revalidateTag(CACHE_TAG);
  revalidatePath("/portraits/[slug]", "page");
}

export async function saveEverydayContent(input: unknown) {
  const content = mergeEverydayContent(input);
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
    .upload(EVERYDAY_FILE, Buffer.from(JSON.stringify(body)), {
      contentType: "application/json",
      cacheControl: "60",
      upsert: true,
    });
  if (error) return { ok: false as const, error: "The text could not be saved. Try again." };
  publish();
  return { ok: true as const, content, updatedAt };
}

export async function resetEverydayContent() {
  const { error } = await supabaseAdmin.storage.from(BUCKET).remove([EVERYDAY_FILE]);
  if (error && !isMissingObject(error)) return { ok: false as const, error: "The defaults could not be restored. Try again." };
  publish();
  return { ok: true as const, content: DEFAULT_EVERYDAY_CONTENT };
}
