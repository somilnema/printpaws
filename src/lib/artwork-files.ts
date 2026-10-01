import { supabaseAdmin } from "@/lib/supabase-admin";

export const ORIGINALS_BUCKET = "artwork-originals";
export const PROOF_PREFIX = "proofs";

const ORIGINAL_EXTS = ["jpg", "png", "webp"] as const;

const ORIGINAL_TYPES: Record<(typeof ORIGINAL_EXTS)[number], string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export function originalObjectPath(orderId: string, versionId: string, ext: string) {
  return `${orderId}/${versionId}.${ext}`;
}

export function proofObjectPath(orderId: string, versionId: string) {
  return `${PROOF_PREFIX}/${orderId}/${versionId}.jpg`;
}

let originalsBucketReady = false;

async function ensureOriginalsBucket() {
  if (originalsBucketReady) return;
  const existing = await supabaseAdmin.storage.getBucket(ORIGINALS_BUCKET);
  if (existing.data) {
    originalsBucketReady = true;
    return;
  }
  const created = await supabaseAdmin.storage.createBucket(ORIGINALS_BUCKET, {
    public: false,
    fileSizeLimit: 20 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  });
  if (created.error && !/already exists|duplicate/i.test(created.error.message)) {
    throw new Error(created.error.message);
  }
  originalsBucketReady = true;
}

export async function createOriginalUploadUrl(orderId: string, versionId: string, ext: string) {
  await ensureOriginalsBucket();
  const path = originalObjectPath(orderId, versionId, ext);
  const { data, error } = await supabaseAdmin.storage.from(ORIGINALS_BUCKET).createSignedUploadUrl(path);
  if (error || !data) {
    throw new Error(error?.message || "The upload could not be started.");
  }
  return { signedUrl: data.signedUrl, path };
}

export async function readOriginalArtwork(orderId: string, versionId: string, ext: string) {
  const path = originalObjectPath(orderId, versionId, ext);
  const downloaded = await supabaseAdmin.storage.from(ORIGINALS_BUCKET).download(path);
  if (downloaded.error || !downloaded.data) return null;
  return Buffer.from(await downloaded.data.arrayBuffer());
}

export async function saveCustomerProof(orderId: string, versionId: string, bytes: Buffer) {
  const path = proofObjectPath(orderId, versionId);
  const uploaded = await supabaseAdmin.storage.from("pet-photos").upload(path, bytes, {
    contentType: "image/jpeg",
    upsert: false,
  });
  if (uploaded.error) {
    throw new Error(uploaded.error.message || "The preview could not be saved.");
  }
  const { data } = supabaseAdmin.storage.from("pet-photos").getPublicUrl(path);
  return data.publicUrl;
}

export async function removeArtworkFiles(orderId: string, versionId: string) {
  await supabaseAdmin.storage.from("pet-photos").remove([proofObjectPath(orderId, versionId)]);
  await supabaseAdmin.storage
    .from(ORIGINALS_BUCKET)
    .remove(ORIGINAL_EXTS.map((ext) => originalObjectPath(orderId, versionId, ext)));
}

export async function downloadOriginalArtwork(orderId: string, versionId: string) {
  for (const ext of ORIGINAL_EXTS) {
    const path = originalObjectPath(orderId, versionId, ext);
    const downloaded = await supabaseAdmin.storage.from(ORIGINALS_BUCKET).download(path);
    if (!downloaded.error && downloaded.data) {
      const bytes = Buffer.from(await downloaded.data.arrayBuffer());
      return { bytes, ext, contentType: ORIGINAL_TYPES[ext] };
    }
  }
  return null;
}
