const UPLOAD_TIMEOUT_MS = 10 * 60_000;

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

export type ArtworkUploadProgress = {
  ratio: number;
  secondsLeft: number | null;
};

export function uploadToSignedUrl(signedUrl: string, file: File, onProgress?: (progress: ArtworkUploadProgress) => void) {
  return new Promise<void>((resolve, reject) => {
    const body = new FormData();
    body.append("cacheControl", "3600");
    body.append("", file);

    const xhr = new XMLHttpRequest();
    const startedAt = performance.now();
    const timer = window.setTimeout(() => xhr.abort(), UPLOAD_TIMEOUT_MS);
    const fail = (message: string) => {
      window.clearTimeout(timer);
      reject(new Error(message));
    };

    xhr.open("PUT", signedUrl);
    xhr.setRequestHeader("x-upsert", "false");
    if (supabaseKey) xhr.setRequestHeader("apikey", supabaseKey);

    xhr.upload.onprogress = (event) => {
      if (!onProgress || !event.lengthComputable || event.total <= 0) return;
      const ratio = Math.min(1, event.loaded / event.total);
      const elapsed = (performance.now() - startedAt) / 1000;
      const rate = elapsed > 0.5 ? event.loaded / elapsed : 0;
      const secondsLeft = rate > 0 ? Math.max(0, Math.ceil((event.total - event.loaded) / rate)) : null;
      onProgress({ ratio, secondsLeft });
    };
    xhr.onload = () => {
      window.clearTimeout(timer);
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
        return;
      }
      let message = "";
      try {
        const data = JSON.parse(xhr.responseText) as { message?: string; error?: string };
        message = data.message || data.error || "";
      } catch {
        message = "";
      }
      reject(new Error(message || "The artwork upload failed. Please try again."));
    };
    xhr.onerror = () => fail("The artwork upload failed. Check your connection and try again.");
    xhr.onabort = () => fail("The artwork upload timed out. Please try again.");
    xhr.send(body);
  });
}

export function formatSecondsLeft(seconds: number | null) {
  if (seconds === null) return "Estimating time…";
  if (seconds <= 1) return "Almost done";
  if (seconds < 60) return `About ${seconds}s left`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest ? `About ${minutes}m ${rest}s left` : `About ${minutes}m left`;
}
