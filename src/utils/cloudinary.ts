// Site media lives in a public Supabase Storage bucket (`site-media`).
// Cloudinary is no longer used — that account is disabled.
// If the Supabase URL is missing (local dev without env), we fall back to /public.

const SITE_MEDIA_BUCKET = "site-media";

const SITE_IMAGES = new Set([
  "10th Image.png",
  "2nd Image.png",
  "3rd Image.png",
  "4th Image (2).png",
  "5th Image (2).png",
  "5th Image.png",
  "6th Image.png",
  "7th Image.png",
  "8th Image.png",
  "9th Image.png",
  "Main Image (1).png",
  "Main Image.png",
]);

const SITE_VIDEOS = new Set([
  "IMG_3784 (1).MOV",
  "IMG_4486.MOV",
  "IMG_5470.MOV",
  "IMG_5473.MOV",
  "IMG_5498.MOV",
  "IMG_5573.MOV",
  "IMG_5576.MOV",
  "IMG_6005.MOV",
  "IMG_6007.MOV",
  "IMG_6165.MOV",
  "IMG_6181.MOV",
  "IMG_6239.MOV",
]);

function getSupabaseUrl(): string {
  return (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
}

function supabasePublicUrl(folder: string, fileName: string): string | null {
  const base = getSupabaseUrl();
  if (!base) return null;
  return `${base}/storage/v1/object/public/${SITE_MEDIA_BUCKET}/${folder}/${encodeURIComponent(fileName)}`;
}

/**
 * Resolves a gallery/media key to a durable public URL.
 * Production: Supabase Storage. Local without env: files in /public.
 */
export const getCloudinaryUrl = (key: string): string => {
  const cleanKey = key.startsWith("/") ? key.substring(1) : key;

  if (SITE_IMAGES.has(cleanKey)) {
    return supabasePublicUrl("new_images", cleanKey) || `/${encodeURI(`new images/${cleanKey}`)}`;
  }

  if (SITE_VIDEOS.has(cleanKey)) {
    return supabasePublicUrl("new_videos", cleanKey) || `/${encodeURI(`new videos/${cleanKey}`)}`;
  }

  if (!cleanKey.startsWith("http")) {
    return "/" + encodeURI(cleanKey);
  }

  return key;
};
