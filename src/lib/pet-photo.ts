const PHOTO_PATH = "/storage/v1/object/public/pet-photos/";
const PROOF_PATH = "/storage/v1/object/public/pet-photos/proofs/";

export function storedPetPhotoUrl(value: unknown, supabaseHost = "") {
  const url = String(value ?? "").trim();
  if (!url) return "";
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return "";
    if (!parsed.pathname.includes(PHOTO_PATH)) return "";
    if (supabaseHost && parsed.host !== supabaseHost) return "";
    return url;
  } catch {
    return "";
  }
}

export function isWatermarkedProof(value: unknown) {
  const url = storedPetPhotoUrl(value);
  return url.includes(PROOF_PATH);
}

export async function petPhotoIsReachable(url: string) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, { method: "GET", redirect: "follow", cache: "no-store" });
      const type = (res.headers.get("content-type") || "").toLowerCase();
      const ok = res.ok && (type.startsWith("image/") || type.includes("octet-stream"));
      await res.body?.cancel();
      if (ok) return true;
    } catch {
      // Retry once. A brand-new upload can miss the first read.
    }
    if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 400));
  }
  return false;
}
