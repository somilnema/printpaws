const MAX_EDGE = 2000;
const MAX_BYTES = 900_000;

export async function preparePetPhoto(file: File): Promise<File> {
  if (file.size <= MAX_BYTES && /image\/(jpeg|png|webp)/.test(file.type)) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    let scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    let quality = 0.86;
    let blob: Blob | null = null;

    for (let attempt = 0; attempt < 5; attempt++) {
      const width = Math.max(1, Math.round(bitmap.width * scale));
      const height = Math.max(1, Math.round(bitmap.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) break;
      ctx.drawImage(bitmap, 0, 0, width, height);
      blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
      if (blob && blob.size <= MAX_BYTES) break;
      quality = Math.max(0.45, quality - 0.12);
      scale *= 0.75;
    }

    bitmap.close();
    if (!blob) {
      throw new Error("This photo format isn't supported. Please upload a JPG or PNG.");
    }
    return new File([blob], "pet-photo.jpg", { type: "image/jpeg" });
  } catch (err) {
    if (/image\/(jpeg|png|webp)/.test(file.type)) return file;
    if (err instanceof Error && err.message.includes("isn't supported")) throw err;
    throw new Error("This photo format isn't supported. Please upload a JPG or PNG.");
  }
}
