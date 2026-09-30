import "server-only";

import { unstable_cache, revalidatePath, revalidateTag } from "next/cache";
import sharp from "sharp";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  fallbackUrl,
  IMAGE_UPLOAD_LIMIT,
  MEDIA_SLOTS,
  mediaSlot,
  VIDEO_UPLOAD_LIMIT,
  type MediaSlot,
} from "@/lib/site-media-catalog";

const BUCKET = "site-media";
const MANIFEST = "manifest.json";
const CACHE_TAG = "site-media";

type ManifestEntry = {
  url: string;
  path: string;
  bytes: number;
  updatedAt: string;
};

type Manifest = {
  version: 1;
  slots: Record<string, ManifestEntry>;
};

export type SiteMediaSlotView = {
  id: string;
  group: string;
  label: string;
  hint: string;
  kind: MediaSlot["kind"];
  fallbackUrl: string;
  url: string;
  custom: boolean;
  updatedAt: string | null;
};

export type SiteMediaAdmin = {
  ready: boolean;
  error?: string;
  slots: SiteMediaSlotView[];
};

const EMPTY_MANIFEST: Manifest = { version: 1, slots: {} };

let bucketReady: Promise<void> | null = null;
let writeChain: Promise<unknown> = Promise.resolve();

function withWriteLock<T>(task: () => Promise<T>): Promise<T> {
  const run = writeChain.then(task, task);
  writeChain = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

function supabaseHost() {
  const raw = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  try {
    return new URL(raw).host;
  } catch {
    return "";
  }
}

function isManagedUrl(url: string) {
  const host = supabaseHost();
  if (!host) return false;
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      parsed.host === host &&
      parsed.pathname.startsWith(`/storage/v1/object/public/${BUCKET}/`)
    );
  } catch {
    return false;
  }
}

function isMissingObject(error: { message?: string; status?: number; statusCode?: string | number } | null) {
  if (!error) return false;
  const status = Number(error.status ?? error.statusCode);
  if (status === 404) return true;
  return /not found|404/i.test(error.message || "");
}

function emptyManifest(): Manifest {
  return { version: 1, slots: {} };
}

function parseManifest(raw: string): Manifest | null {
  try {
    const parsed = JSON.parse(raw) as Partial<Manifest>;
    if (!parsed || parsed.version !== 1 || !parsed.slots || typeof parsed.slots !== "object") return null;
    const slots: Record<string, ManifestEntry> = {};
    for (const [id, entry] of Object.entries(parsed.slots)) {
      if (!mediaSlot(id) || !entry || typeof entry !== "object") continue;
      const row = entry as Partial<ManifestEntry>;
      if (typeof row.url !== "string" || typeof row.path !== "string" || !isManagedUrl(row.url)) continue;
      if (!row.path.startsWith(`replacements/${id}/`)) continue;
      slots[id] = {
        url: row.url,
        path: row.path,
        bytes: Number(row.bytes) || 0,
        updatedAt: typeof row.updatedAt === "string" ? row.updatedAt : "",
      };
    }
    return { version: 1, slots };
  } catch {
    return null;
  }
}

async function readManifest(): Promise<{ ok: true; manifest: Manifest } | { ok: false; error: string }> {
  const { data, error } = await supabaseAdmin.storage.from(BUCKET).download(MANIFEST);
  if (error || !data) {
    if (isMissingObject(error)) return { ok: true, manifest: emptyManifest() };
    const message = error?.message || "";
    if (/bucket not found|does not exist/i.test(message)) return { ok: true, manifest: emptyManifest() };
    return { ok: false, error: "The media library could not be read. Nothing was changed." };
  }
  const parsed = parseManifest(await data.text());
  if (!parsed) return { ok: false, error: "The media library file is damaged. Nothing was changed." };
  return { ok: true, manifest: parsed };
}

function overridesFrom(manifest: Manifest) {
  const overrides: Record<string, string> = {};
  for (const [id, entry] of Object.entries(manifest.slots)) {
    if (entry.url) overrides[id] = entry.url;
  }
  return overrides;
}

async function fetchOverrides() {
  try {
    const read = await readManifest();
    if (!read.ok) return {};
    return overridesFrom(read.manifest);
  } catch {
    return {};
  }
}

const loadCachedOverrides = unstable_cache(fetchOverrides, ["site-media-overrides-v2"], {
  tags: [CACHE_TAG],
  revalidate: 60,
});

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(fallback), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      () => {
        clearTimeout(timer);
        resolve(fallback);
      }
    );
  });
}

/** Overrides for the shop. Missing storage, or a slow response, keeps the original files. */
export async function loadSiteMedia() {
  return withTimeout(loadCachedOverrides(), 8000, {});
}

async function ensureBucket() {
  if (!bucketReady) {
    bucketReady = (async () => {
      const { data, error } = await supabaseAdmin.storage.listBuckets();
      if (error) throw new Error(error.message || "Could not reach storage.");
      if ((data || []).some((bucket) => bucket.id === BUCKET || bucket.name === BUCKET)) return;
      const { error: createError } = await supabaseAdmin.storage.createBucket(BUCKET, { public: true });
      if (createError && !/already exists/i.test(createError.message || "")) {
        throw new Error(createError.message || "Could not create storage.");
      }
    })().catch((error) => {
      bucketReady = null;
      throw error;
    });
  }
  return bucketReady;
}

function viewsFrom(manifest: Manifest): SiteMediaSlotView[] {
  return MEDIA_SLOTS.map((slot) => {
    const entry = manifest.slots[slot.id];
    const original = fallbackUrl(slot);
    return {
      id: slot.id,
      group: slot.group,
      label: slot.label,
      hint: slot.hint,
      kind: slot.kind,
      fallbackUrl: original,
      url: entry?.url || original,
      custom: Boolean(entry?.url),
      updatedAt: entry?.updatedAt || null,
    };
  });
}

export async function describeSiteMedia(): Promise<SiteMediaAdmin> {
  try {
    await ensureBucket();
  } catch (error) {
    return {
      ready: false,
      error:
        error instanceof Error
          ? `${error.message} In Supabase, open Storage, create a public bucket named site-media, then try again.`
          : "Storage is not ready. Create a public bucket named site-media, then try again.",
      slots: viewsFrom(EMPTY_MANIFEST),
    };
  }

  const read = await readManifest();
  if (!read.ok) {
    return { ready: false, error: read.error, slots: viewsFrom(EMPTY_MANIFEST) };
  }
  return { ready: true, slots: viewsFrom(read.manifest) };
}

function isJpeg(bytes: Buffer) {
  return bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

function isPng(bytes: Buffer) {
  return bytes.length > 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
}

function isWebp(bytes: Buffer) {
  return bytes.length > 12 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
}

function isMp4(bytes: Buffer) {
  return bytes.length > 12 && bytes.toString("ascii", 4, 8) === "ftyp";
}

function isWebm(bytes: Buffer) {
  return bytes.length > 4 && bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3;
}

async function optimizeImage(bytes: Buffer, maxEdge: number) {
  if (!isJpeg(bytes) && !isPng(bytes) && !isWebp(bytes)) {
    return { ok: false as const, error: "Use a JPG, PNG, or WebP photo." };
  }
  try {
    const output = await sharp(bytes, { failOn: "none", limitInputPixels: 40_000_000, animated: false })
      .rotate()
      .resize({ width: maxEdge, height: maxEdge, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80, effort: 4, smartSubsample: true })
      .toBuffer();
    if (!output.length) return { ok: false as const, error: "That photo could not be prepared. Try another file." };
    return { ok: true as const, body: output, contentType: "image/webp", ext: "webp" };
  } catch {
    return { ok: false as const, error: "That photo could not be prepared. Try a JPG, PNG, or WebP." };
  }
}

function prepareVideo(bytes: Buffer) {
  if (isMp4(bytes)) return { ok: true as const, body: bytes, contentType: "video/mp4", ext: "mp4" };
  if (isWebm(bytes)) return { ok: true as const, body: bytes, contentType: "video/webm", ext: "webm" };
  return {
    ok: false as const,
    error: "Upload an MP4 or WebM video. MOV files often will not play in the browser.",
  };
}

async function uploadObject(path: string, body: Buffer, contentType: string) {
  const { error } = await supabaseAdmin.storage.from(BUCKET).upload(path, body, {
    contentType,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) return { ok: false as const, error: "The file could not be saved. Try again." };
  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
  if (!isManagedUrl(data.publicUrl)) return { ok: false as const, error: "The file was saved but the link was invalid." };
  return { ok: true as const, url: data.publicUrl };
}

async function removeObject(path: string) {
  if (!path.startsWith("replacements/")) return;
  await supabaseAdmin.storage.from(BUCKET).remove([path]);
}

function publish() {
  revalidateTag(CACHE_TAG);
  revalidatePath("/");
}

export async function saveSiteMedia(slotId: string, bytes: Buffer) {
  const slot = mediaSlot(slotId);
  if (!slot) return { ok: false as const, error: "That place on the site does not exist." };

  const limit = slot.kind === "video" ? VIDEO_UPLOAD_LIMIT : IMAGE_UPLOAD_LIMIT;
  if (!bytes.length) return { ok: false as const, error: "Choose a file first." };
  if (bytes.length > limit) {
    const mb = Math.round(limit / (1024 * 1024));
    return { ok: false as const, error: `That file is too large. Keep it under ${mb} MB.` };
  }

  const prepared = slot.kind === "image" ? await optimizeImage(bytes, slot.maxEdge) : prepareVideo(bytes);
  if (!prepared.ok) return prepared;

  return withWriteLock(async () => {
    try {
      await ensureBucket();
    } catch {
      return {
        ok: false as const,
        error: "Storage is not ready. In Supabase, create a public bucket named site-media, then try again.",
      };
    }

    const current = await readManifest();
    if (!current.ok) return { ok: false as const, error: current.error };

    const path = `replacements/${slot.id}/${crypto.randomUUID()}.${prepared.ext}`;
    const uploaded = await uploadObject(path, prepared.body, prepared.contentType);
    if (!uploaded.ok) return uploaded;

    const previous = current.manifest.slots[slot.id];
    const updatedAt = new Date().toISOString();
    const next: Manifest = {
      version: 1,
      slots: {
        ...current.manifest.slots,
        [slot.id]: { url: uploaded.url, path, bytes: prepared.body.length, updatedAt },
      },
    };

    const written = await supabaseAdmin.storage.from(BUCKET).upload(MANIFEST, Buffer.from(JSON.stringify(next)), {
      contentType: "application/json",
      cacheControl: "60",
      upsert: true,
    });
    if (written.error) {
      await removeObject(path);
      return { ok: false as const, error: "The file was uploaded but the site could not switch to it. Try again." };
    }

    if (previous?.path && previous.path !== path) await removeObject(previous.path);
    publish();
    return { ok: true as const, url: uploaded.url, updatedAt };
  });
}

export async function clearSiteMedia(slotId: string) {
  const slot = mediaSlot(slotId);
  if (!slot) return { ok: false as const, error: "That place on the site does not exist." };

  return withWriteLock(async () => {
    const current = await readManifest();
    if (!current.ok) return { ok: false as const, error: current.error };
    const previous = current.manifest.slots[slot.id];
    if (!previous) return { ok: true as const };

    const slots = { ...current.manifest.slots };
    delete slots[slot.id];
    const written = await supabaseAdmin.storage.from(BUCKET).upload(
      MANIFEST,
      Buffer.from(JSON.stringify({ version: 1, slots })),
      { contentType: "application/json", cacheControl: "60", upsert: true }
    );
    if (written.error) return { ok: false as const, error: "The original file could not be restored. Try again." };
    if (previous.path) await removeObject(previous.path);
    publish();
    return { ok: true as const };
  });
}
