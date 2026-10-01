import { getBrowserSupabase } from "@/lib/supabase-browser";
import { storedPetPhotoUrl } from "@/lib/pet-photo";
import { preparePetPhoto } from "@/utils/preparePetPhoto";

async function uploadOnce(file: File) {
  const supabase = getBrowserSupabase();
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const filePath = `orders/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("pet-photos").upload(filePath, file, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });
  if (error) throw new Error(error.message || "Photo upload failed");

  const { data } = supabase.storage.from("pet-photos").getPublicUrl(filePath);
  const publicUrl = storedPetPhotoUrl(data.publicUrl);
  if (!publicUrl) throw new Error("The photo was uploaded but the saved link was invalid.");
  return publicUrl;
}

async function uploadThroughServer(file: File) {
  const body = new FormData();
  body.set("file", file);
  const res = await fetch("/api/pet-photo", { method: "POST", body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.url) {
    throw new Error(data?.error || "We couldn't save the pet photo. Please try again.");
  }
  const publicUrl = storedPetPhotoUrl(data.url);
  if (!publicUrl) throw new Error("The photo was uploaded but the saved link was invalid.");
  return publicUrl;
}

export async function uploadPetPhotoFile(file: File) {
  const prepared = await preparePetPhoto(file);
  try {
    return await uploadOnce(prepared);
  } catch (firstError) {
    try {
      return await uploadOnce(prepared);
    } catch {
      try {
        return await uploadThroughServer(prepared);
      } catch (err) {
        const fallback = err instanceof Error ? err.message : "";
        const first = firstError instanceof Error ? firstError.message : "";
        throw new Error(fallback || first || "We couldn't save the pet photo. Please try again.");
      }
    }
  }
}
