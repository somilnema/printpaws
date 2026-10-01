const MAX_EDGE = 1600;
const MAX_BYTES = 450_000;

function fitInside(width: number, height: number, maxEdge: number) {
  const longest = Math.max(width, height);
  if (longest <= maxEdge) return { width, height };
  const scale = maxEdge / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function encodeJpeg(bitmap: ImageBitmap, width: number, height: number, quality: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.resolve(null);
  ctx.drawImage(bitmap, 0, 0, width, height);
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", quality);
  });
}

export async function prepareImageFile(
  file: File,
  options: { maxEdge?: number; maxBytes?: number } = {},
): Promise<File> {
  const maxEdge = options.maxEdge ?? MAX_EDGE;
  const maxBytes = options.maxBytes ?? MAX_BYTES;
  const accepted = /image\/(jpeg|png|webp)/.test(file.type);

  if (file.type === "image/jpeg" && file.size <= maxBytes) return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    try {
      bitmap = await createImageBitmap(file);
    } catch {
      if (accepted && file.size <= Math.max(maxBytes, 1_800_000)) return file;
      throw new Error("This photo format isn't supported. Please upload a JPG or PNG.");
    }
  }

  try {
    const size = fitInside(bitmap.width, bitmap.height, maxEdge);
    const alreadyFits = size.width === bitmap.width && size.height === bitmap.height;
    if (accepted && alreadyFits && file.size <= maxBytes) return file;

    let blob = await encodeJpeg(bitmap, size.width, size.height, 0.82);
    if (blob && blob.size > maxBytes) {
      const ratio = Math.min(1, Math.sqrt(maxBytes / blob.size));
      const smaller = await encodeJpeg(
        bitmap,
        Math.max(1, Math.round(size.width * ratio)),
        Math.max(1, Math.round(size.height * ratio)),
        0.72,
      );
      if (smaller) blob = smaller;
    }

    if (!blob) {
      if (accepted) return file;
      throw new Error("This photo format isn't supported. Please upload a JPG or PNG.");
    }
    if (accepted && blob.size >= file.size && file.size <= maxBytes) return file;
    return new File([blob], "photo.jpg", { type: "image/jpeg" });
  } finally {
    bitmap.close();
  }
}

export function preparePetPhoto(file: File) {
  return prepareImageFile(file);
}
