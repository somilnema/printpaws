import { getBrowserSupabase } from "@/lib/supabase-browser";
import { storedPetPhotoUrl } from "@/lib/pet-photo";
import { preparePetPhoto } from "@/utils/preparePetPhoto";

const SERVER_TIMEOUT_MS = 40_000;
const DIRECT_TIMEOUT_MS = 20_000;
const PREPARE_TIMEOUT_MS = 10_000;

export type PhotoUploadProgress = {
  percent: number;
};

function withTimeout<T>(promise: Promise<T>, ms: number, message: string) {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

async function prepareWithLimit(file: File) {
  try {
    return await withTimeout(preparePetPhoto(file), PREPARE_TIMEOUT_MS, "prepare-timeout");
  } catch (err) {
    const accepted = /image\/(jpeg|png|webp)/.test(file.type);
    if (err instanceof Error && err.message === "prepare-timeout" && accepted && file.size <= 1_800_000) {
      return file;
    }
    if (err instanceof Error && err.message === "prepare-timeout") {
      throw new Error("This photo is too large. Please choose a smaller JPG or PNG.");
    }
    throw err;
  }
}

async function uploadOnce(file: File) {
  const supabase = getBrowserSupabase();
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const filePath = `orders/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const { error } = await withTimeout(
    supabase.storage.from("pet-photos").upload(filePath, file, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    }),
    DIRECT_TIMEOUT_MS,
    "The photo upload timed out. Please try again.",
  );
  if (error) throw new Error(error.message || "Photo upload failed");

  const { data } = supabase.storage.from("pet-photos").getPublicUrl(filePath);
  const publicUrl = storedPetPhotoUrl(data.publicUrl);
  if (!publicUrl) throw new Error("The photo was uploaded but the saved link was invalid.");
  return publicUrl;
}

function uploadThroughServer(file: File, onProgress?: (ratio: number) => void) {
  return new Promise<string>((resolve, reject) => {
    const body = new FormData();
    body.set("file", file);
    const xhr = new XMLHttpRequest();
    const timer = window.setTimeout(() => {
      xhr.abort();
    }, SERVER_TIMEOUT_MS);

    const fail = (message: string) => {
      window.clearTimeout(timer);
      reject(new Error(message));
    };

    xhr.open("POST", "/api/pet-photo");
    xhr.upload.onprogress = (event) => {
      if (!onProgress || !event.lengthComputable || event.total <= 0) return;
      onProgress(Math.min(1, event.loaded / event.total));
    };
    xhr.onload = () => {
      window.clearTimeout(timer);
      let data: { url?: string; error?: string } = {};
      try {
        data = JSON.parse(xhr.responseText) as { url?: string; error?: string };
      } catch {
        data = {};
      }
      if (xhr.status < 200 || xhr.status >= 300 || !data.url) {
        reject(new Error(data.error || "We couldn't save the pet photo. Please try again."));
        return;
      }
      const publicUrl = storedPetPhotoUrl(data.url);
      if (!publicUrl) {
        reject(new Error("The photo was uploaded but the saved link was invalid."));
        return;
      }
      resolve(publicUrl);
    };
    xhr.onerror = () => fail("We couldn't save the pet photo. Please try again.");
    xhr.onabort = () => fail("The photo upload timed out. Please try again.");
    xhr.send(body);
  });
}

export async function uploadPetPhotoFile(file: File, onProgress?: (progress: PhotoUploadProgress) => void) {
  onProgress?.({ percent: 8 });
  const prepared = await prepareWithLimit(file);
  onProgress?.({ percent: 18 });

  const reportUpload = (ratio: number) => {
    onProgress?.({ percent: 18 + Math.round(ratio * 78) });
  };

  try {
    const url = await uploadThroughServer(prepared, reportUpload);
    onProgress?.({ percent: 100 });
    return url;
  } catch (serverError) {
    try {
      const url = await uploadOnce(prepared);
      onProgress?.({ percent: 100 });
      return url;
    } catch (err) {
      const direct = err instanceof Error ? err.message : "";
      const server = serverError instanceof Error ? serverError.message : "";
      throw new Error(server || direct || "We couldn't save the pet photo. Please try again.");
    }
  }
}
