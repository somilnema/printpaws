"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  cancelSiteMediaVideoUpload,
  completeSiteMediaVideoUpload,
  replaceSiteMedia,
  resetSiteMedia,
  startSiteMediaVideoUpload,
  type SiteMediaAdmin,
  type SiteMediaSlotView,
} from "@/app/actions/mediaActions";
import {
  IMAGE_UPLOAD_LIMIT,
  MEDIA_SECTIONS,
  VIDEO_UPLOAD_LIMIT,
  mediaGroups,
  mediaSections,
  mediaSlot,
  shopMediaUrl,
} from "@/lib/site-media-catalog";
import { buttonClass, errorClass, ghostButtonClass, okClass, warnClass } from "@/components/admin/ui";
import { PhotoUploadBar, PreviewImage } from "@/components/PreviewImage";
import { UploadFailDialog, type UploadFailAlert } from "@/components/UploadFailDialog";
import { formatSecondsLeft, uploadToSignedUrl } from "@/lib/uploadArtwork";
import { prepareImageFile } from "@/utils/preparePetPhoto";

function previewSrc(url: string) {
  if (/^https?:\/\//i.test(url)) return url;
  return encodeURI(url);
}

function formatWhen(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isAllowedVideo(file: File) {
  if (file.type === "video/mp4" || file.type === "video/webm") return true;
  return /\.(mp4|webm)$/i.test(file.name);
}

async function isQuickTimeFile(file: File) {
  try {
    const buf = await file.slice(0, 12).arrayBuffer();
    const bytes = new Uint8Array(buf);
    if (bytes.length < 12) return false;
    const box = String.fromCharCode(bytes[4], bytes[5], bytes[6], bytes[7]);
    const brand = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
    return box === "ftyp" && brand === "qt  ";
  } catch {
    return false;
  }
}

function probeBrowserVideo(file: File): Promise<{ ok: true } | { ok: false; error: string }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    const finish = (result: { ok: true } | { ok: false; error: string }) => {
      window.clearTimeout(timer);
      video.removeAttribute("src");
      video.load();
      URL.revokeObjectURL(url);
      resolve(result);
    };

    const timer = window.setTimeout(() => {
      finish({
        ok: false,
        error: "This video could not be read in the browser. Export it as H.264 MP4 (not HEVC/MOV) and try again.",
      });
    }, 10_000);

    video.onloadedmetadata = () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) {
        finish({
          ok: false,
          error: "This video has no playable duration. Export as H.264 MP4 or WebM under 20 MB.",
        });
        return;
      }
      finish({ ok: true });
    };
    video.onerror = () => {
      finish({
        ok: false,
        error: "This browser cannot play that video. Phone MOV/HEVC files often fail — export as H.264 MP4.",
      });
    };
    video.src = url;
  });
}

/** Photos the admin should check for one product, e.g. the background tiles that are on show. */
export type MediaChecklist = {
  title: string;
  /** What customers see for a missing one. */
  note: string;
  items: { slotId: string; label: string }[];
};

const TILE_SECTION = MEDIA_SECTIONS[2];

/** Without a list from the configurator, every tile slot in the group is checked. */
function tileChecklist(group: string, slots: SiteMediaSlotView[]): MediaChecklist[] {
  const items = slots
    .filter((slot) => slot.group === group && mediaSlot(slot.id)?.section === TILE_SECTION)
    .map((slot) => ({ slotId: slot.id, label: slot.label.replace(/^Background tile:\s*/, "") }));
  if (!items.length) return [];
  return [
    {
      title: "Step 2 background tiles",
      note: "A tile without its own photo shows the plain background colour (Limited Edition: its pattern).",
      items,
    },
  ];
}

export function MediaPanel({
  initial,
  onChanged,
  onlyGroups,
  checklist,
}: {
  initial: SiteMediaAdmin;
  onChanged: () => Promise<void>;
  /** Limits the panel to these groups, e.g. the configurator's own photos. */
  onlyGroups?: string[];
  /** Photos to check for the shown group (the configurator passes the tiles that are on show). */
  checklist?: MediaChecklist[];
}) {
  const groups = useMemo(() => mediaGroups().filter((item) => !onlyGroups || onlyGroups.includes(item)), [onlyGroups]);
  const [group, setGroup] = useState(groups[0] || "Product gallery");
  const [focusId, setFocusId] = useState("");
  const [query, setQuery] = useState("");
  const [slots, setSlots] = useState(initial.slots);
  const [ready, setReady] = useState(initial.ready);
  const [setupError, setSetupError] = useState(initial.error || "");
  const [pendingId, setPendingId] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadDetail, setUploadDetail] = useState("");
  const [notice, setNotice] = useState("");
  const [cardError, setCardError] = useState<Record<string, string>>({});
  const [alert, setAlert] = useState<UploadFailAlert | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const draftUrls = useRef<Record<string, string>>({});
  const progressTimer = useRef<number | null>(null);

  useEffect(() => {
    const urls = draftUrls.current;
    return () => {
      Object.values(urls).forEach((url) => URL.revokeObjectURL(url));
      if (progressTimer.current) window.clearInterval(progressTimer.current);
    };
  }, []);

  function rememberDraft(id: string, url: string) {
    const previous = draftUrls.current[id];
    if (previous) URL.revokeObjectURL(previous);
    draftUrls.current[id] = url;
    setDrafts({ ...draftUrls.current });
  }

  function clearDraft(id: string) {
    const previous = draftUrls.current[id];
    delete draftUrls.current[id];
    setDrafts({ ...draftUrls.current });
    if (previous) window.setTimeout(() => URL.revokeObjectURL(previous), 500);
  }

  function showAlert(title: string, message: string, slotId?: string) {
    setAlert({ title, message });
    if (slotId) {
      setCardError((current) => ({ ...current, [slotId]: message }));
    }
  }

  function startFakeProgress() {
    if (progressTimer.current) window.clearInterval(progressTimer.current);
    setUploadProgress(8);
    setUploadDetail("");
    progressTimer.current = window.setInterval(() => {
      setUploadProgress((current) => {
        if (current >= 92) return current;
        const step = current < 40 ? 4 : current < 70 ? 2.5 : 1;
        return Math.min(92, current + step);
      });
    }, 350);
  }

  function stopProgress(done: boolean) {
    if (progressTimer.current) {
      window.clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
    setUploadProgress(done ? 100 : 0);
    if (!done) setUploadDetail("");
  }

  useEffect(() => {
    setSlots(initial.slots);
    setReady(initial.ready);
    setSetupError(initial.error || "");
  }, [initial]);

  const visible = slots.filter((slot) => {
    if (slot.group !== group) return false;
    const haystack = `${slot.label} ${slot.hint}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });
  const sections = mediaSections(group);
  const urlOf = (id: string) => slots.find((item) => item.id === id)?.url || "";
  const nameOf = (id: string) => {
    const found = slots.find((item) => item.id === id);
    return found ? `${found.group} → ${found.label}` : "the original file";
  };
  const lists = (checklist ?? tileChecklist(group, slots))
    .map((list) => ({ ...list, items: list.items.filter((item) => slots.some((slot) => slot.id === item.slotId && slot.group === group)) }))
    .filter((list) => list.items.length > 0);

  function showSlot(id: string) {
    setQuery("");
    setFocusId(id);
    window.setTimeout(() => {
      document.getElementById(`media-slot-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 60);
    window.setTimeout(() => setFocusId((current) => (current === id ? "" : current)), 2500);
  }

  async function uploadVideo(slot: SiteMediaSlotView, file: File) {
    if (await isQuickTimeFile(file)) {
      showAlert(
        "Video format not supported",
        `“${file.name}” is a QuickTime / MOV file. Export it as H.264 MP4 or WebM and try again.`,
        slot.id
      );
      return;
    }

    const playable = await probeBrowserVideo(file);
    if (!playable.ok) {
      showAlert("Video will not play", playable.error, slot.id);
      return;
    }

    const local = URL.createObjectURL(file);
    rememberDraft(slot.id, local);
    setPendingId(slot.id);
    setNotice("");
    setCardError((current) => ({ ...current, [slot.id]: "" }));
    setUploadProgress(4);
    setUploadDetail(formatFileSize(file.size));

    const contentType = file.type === "video/webm" || /\.webm$/i.test(file.name) ? "video/webm" : "video/mp4";
    const started = await startSiteMediaVideoUpload({ slot: slot.id, type: contentType, size: file.size });
    if (!started.ok) {
      clearDraft(slot.id);
      setPendingId("");
      stopProgress(false);
      showAlert("Upload failed", started.error, slot.id);
      return;
    }

    try {
      await uploadToSignedUrl(started.signedUrl, file, ({ ratio, secondsLeft }) => {
        setUploadProgress(5 + Math.round(ratio * 90));
        setUploadDetail(
          `${formatFileSize(file.size * ratio)} of ${formatFileSize(file.size)} · ${formatSecondsLeft(secondsLeft)}`
        );
      });
    } catch (err) {
      void cancelSiteMediaVideoUpload({ path: started.path });
      clearDraft(slot.id);
      setPendingId("");
      stopProgress(false);
      const message = err instanceof Error ? err.message : "The video upload failed. Check your connection and try again.";
      showAlert("Upload failed", message, slot.id);
      return;
    }

    setUploadProgress(96);
    setUploadDetail("Saving to the shop…");
    const finished = await completeSiteMediaVideoUpload({ slot: slot.id, path: started.path, size: file.size });
    setPendingId("");
    clearDraft(slot.id);

    if (!finished.ok) {
      stopProgress(false);
      const tooLarge = /too large|under \d+\s*MB/i.test(finished.error);
      const badFormat = /MOV|QuickTime|MP4|WebM|HEVC|play/i.test(finished.error);
      showAlert(
        tooLarge ? "File is too large" : badFormat ? "Video format not supported" : "Upload failed",
        finished.error,
        slot.id
      );
      return;
    }

    stopProgress(true);
    setUploadDetail("");
    setSlots((current) =>
      current.map((item) =>
        item.id === slot.id ? { ...item, url: finished.url, custom: true, updatedAt: finished.updatedAt } : item
      )
    );
    setReady(true);
    setSetupError("");
    setNotice(`${slot.label} is updated on the shop.`);
    window.setTimeout(() => setUploadProgress(0), 700);
    await onChanged();
  }

  async function uploadImage(slot: SiteMediaSlotView, file: File) {
    const local = URL.createObjectURL(file);
    rememberDraft(slot.id, local);
    setPendingId(slot.id);
    setNotice("");
    setCardError((current) => ({ ...current, [slot.id]: "" }));
    startFakeProgress();

    let payload = file;
    try {
      payload = await prepareImageFile(file, { maxEdge: 2000, maxBytes: 1_400_000 });
    } catch (err) {
      clearDraft(slot.id);
      setPendingId("");
      stopProgress(false);
      const message = err instanceof Error ? err.message : "That photo could not be prepared. Try a JPG or PNG.";
      showAlert("Photo could not be prepared", message, slot.id);
      return;
    }

    const body = new FormData();
    body.set("slot", slot.id);
    body.set("file", payload);

    let result: Awaited<ReturnType<typeof replaceSiteMedia>>;
    try {
      result = await Promise.race([
        replaceSiteMedia(body),
        new Promise<never>((_, reject) => {
          window.setTimeout(() => reject(new Error("The photo upload timed out. Please try again.")), 90_000);
        }),
      ]);
    } catch (err) {
      clearDraft(slot.id);
      setPendingId("");
      stopProgress(false);
      const message = err instanceof Error ? err.message : "The photo could not be uploaded.";
      showAlert("Upload failed", message, slot.id);
      return;
    }

    setPendingId("");
    clearDraft(slot.id);

    if (!result.ok) {
      stopProgress(false);
      const tooLarge = /too large|under \d+\s*MB/i.test(result.error);
      showAlert(tooLarge ? "File is too large" : "Upload failed", result.error, slot.id);
      return;
    }

    stopProgress(true);
    setSlots((current) =>
      current.map((item) =>
        item.id === slot.id ? { ...item, url: result.url, custom: true, updatedAt: result.updatedAt } : item
      )
    );
    setReady(true);
    setSetupError("");
    setNotice(`${slot.label} is updated on the shop.`);
    window.setTimeout(() => setUploadProgress(0), 700);
    await onChanged();
  }

  async function onReplace(slot: SiteMediaSlotView, file: File | null) {
    if (!file) return;

    if (pendingId) {
      showAlert(
        "Upload already in progress",
        `“${slots.find((item) => item.id === pendingId)?.label || "Another file"}” is still uploading. Wait for the progress bar to finish, then try again.`
      );
      return;
    }

    const limit = slot.kind === "video" ? VIDEO_UPLOAD_LIMIT : IMAGE_UPLOAD_LIMIT;
    const limitLabel = formatFileSize(limit);
    if (file.size > limit) {
      showAlert(
        "File is too large",
        `“${file.name}” is ${formatFileSize(file.size)}. ${
          slot.kind === "video" ? "Videos" : "Photos"
        } must stay under ${limitLabel}. Compress the file and try again.`,
        slot.id
      );
      return;
    }

    if (slot.kind === "video") {
      if (!isAllowedVideo(file)) {
        showAlert(
          "Video format not supported",
          `“${file.name}” is not an MP4 or WebM file. MOV and HEVC phone videos often will not play — export as H.264 MP4 and try again.`,
          slot.id
        );
        return;
      }
      await uploadVideo(slot, file);
      return;
    }

    await uploadImage(slot, file);
  }

  async function onReset(slot: SiteMediaSlotView) {
    if (pendingId) {
      showAlert(
        "Upload already in progress",
        "Wait for the current upload to finish before restoring or removing a file."
      );
      return;
    }
    setPendingId(slot.id);
    setNotice("");
    setCardError((current) => ({ ...current, [slot.id]: "" }));
    const result = await resetSiteMedia(slot.id);
    setPendingId("");
    if (!result.ok) {
      showAlert("Could not restore", result.error, slot.id);
      return;
    }
    setSlots((current) =>
      current.map((item) =>
        item.id === slot.id ? { ...item, url: item.fallbackUrl, custom: false, updatedAt: null } : item
      )
    );
    setNotice(
      slot.fallbackUrl
        ? `${slot.label} is back to the original file.`
        : mediaSlot(slot.id)?.inherits
          ? `${slot.label} is removed. The shop shows the shared photo again.`
          : `${slot.label} is removed and hidden on the shop.`
    );
    await onChanged();
  }

  function renderCard(slot: SiteMediaSlotView) {
    const busy = pendingId === slot.id;
    const when = formatWhen(slot.updatedAt);
    const draft = drafts[slot.id];
    const meta = mediaSlot(slot.id);
    const isTile = meta?.section === TILE_SECTION;
    // An empty slot may still show a photo on the shop: the shared one it inherits.
    const inherited = !slot.url && !draft ? shopMediaUrl(slot.id, urlOf) : null;
    const status = slot.custom
      ? slot.fallbackUrl
        ? "Replaced"
        : "Live"
      : slot.fallbackUrl
        ? "Original"
        : inherited?.url
          ? "Using shared"
          : isTile
            ? "Plain colour"
            : "Hidden";
    return (
      <article
        key={slot.id}
        id={`media-slot-${slot.id}`}
        className={`overflow-hidden rounded-3xl border bg-white shadow-sm transition-shadow ${
          focusId === slot.id ? "border-primary ring-2 ring-primary/30" : "border-[#eeeeee]"
        }`}
      >
        <div className="relative aspect-[4/3] bg-[#f3f4f6]">
          {draft ? (
            slot.kind === "video" ? (
              <video
                key={draft}
                src={draft}
                muted
                playsInline
                preload="metadata"
                className={`h-full w-full object-cover ${busy ? "opacity-70" : ""}`}
              />
            ) : (
              <PreviewImage src={draft} alt={slot.label} busy={busy} className="h-full w-full" />
            )
          ) : !slot.url && inherited?.url ? (
            slot.kind === "video" ? (
              <video
                key={inherited.url}
                src={previewSrc(inherited.url)}
                controls
                muted
                playsInline
                preload="metadata"
                className="h-full w-full object-cover opacity-80"
              />
            ) : (
              <img
                key={inherited.url}
                src={previewSrc(inherited.url)}
                alt={slot.label}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover opacity-80"
              />
            )
          ) : !slot.url ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-6 text-center">
              <p className="text-sm font-semibold text-[#6b7280]">
                {busy ? "Uploading…" : `No ${slot.kind} yet`}
              </p>
              <p className="text-xs text-[#9ca3af]">
                {isTile
                  ? "The shop shows the plain background colour until you upload one."
                  : "Nothing shows here on the shop until you upload one (see the note below)."}
              </p>
            </div>
          ) : slot.kind === "video" ? (
            <video
              key={slot.url}
              src={previewSrc(slot.url)}
              controls
              muted
              playsInline
              preload="metadata"
              className={`h-full w-full object-cover ${busy ? "opacity-70" : ""}`}
            />
          ) : (
            <img
              key={slot.url}
              src={previewSrc(slot.url)}
              alt={slot.label}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          )}
          {busy ? (
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
              <div className="absolute inset-y-0 w-1/2 animate-photo-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
            </div>
          ) : null}
          <span
            className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
              slot.custom ? "bg-primary text-white" : "bg-white/95 text-[#6b7280]"
            }`}
          >
            {status}
          </span>
        </div>
        <div className="space-y-3 p-4">
          <div>
            <h2 className="text-base font-bold tracking-tight">{slot.label}</h2>
            <p className="mt-1 text-xs leading-relaxed text-[#9ca3af]">{slot.hint}</p>
            {inherited?.url ? (
              <p className="mt-1 text-[11px] leading-snug text-[#8a5a00]">Showing now: {nameOf(inherited.from)}</p>
            ) : null}
            {when ? <p className="mt-1 text-[11px] text-[#9ca3af]">Updated {when}</p> : null}
          </div>
          {busy ? (
            <PhotoUploadBar
              percent={uploadProgress}
              label={slot.kind === "video" ? "Uploading video" : "Uploading photo"}
              detail={
                uploadDetail ||
                `${slot.kind === "video" ? "Videos" : "Photos"} must stay under ${formatFileSize(
                  slot.kind === "video" ? VIDEO_UPLOAD_LIMIT : IMAGE_UPLOAD_LIMIT
                )}.`
              }
            />
          ) : null}
          {cardError[slot.id] ? <p className={errorClass}>{cardError[slot.id]}</p> : null}
          <div className="flex flex-wrap gap-2">
            <label
              className={`${buttonClass} cursor-pointer ${busy ? "pointer-events-none opacity-50" : pendingId ? "opacity-70" : ""}`}
            >
              {busy ? "Uploading…" : slot.url ? "Replace" : "Upload"}
              <input
                type="file"
                accept={slot.kind === "video" ? "video/mp4,video/webm" : "image/jpeg,image/png,image/webp"}
                className="sr-only"
                disabled={busy}
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  event.target.value = "";
                  void onReplace(slot, file);
                }}
              />
            </label>
            {slot.custom ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void onReset(slot)}
                className={ghostButtonClass}
              >
                {slot.fallbackUrl ? "Restore original" : meta?.inherits ? "Remove (use shared)" : "Remove"}
              </button>
            ) : null}
          </div>
        </div>
      </article>
    );
  }

  const gridClass = "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3";

  return (
    <div className="space-y-4">
      <p className="max-w-3xl text-sm leading-relaxed text-[#6b7280]">
        Replace any shop photo or video here. Photos are resized and saved as WebP. Videos should be H.264 MP4 or WebM, under
        20 MB (not MOV/HEVC). The original file stays in place until you replace it, and you can restore it later.
      </p>
      {!ready && setupError ? <p className={warnClass}>{setupError}</p> : null}
      {notice ? <p className={okClass}>{notice}</p> : null}

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {groups.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setGroup(item)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
              group === item ? "bg-[#1a1a1b] text-white" : "bg-white text-[#6b7280] border border-[#e5e7eb]"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={`Search ${group.toLowerCase()}`}
        className="w-full max-w-sm rounded-xl border border-[#e5e7eb] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
      />

      {lists.map((list) => {
        const missing = list.items.filter((item) => !slots.find((slot) => slot.id === item.slotId)?.custom);
        return (
          <div key={list.title} className={missing.length ? warnClass : okClass}>
            <p className="font-semibold">
              {list.title}: {list.items.length - missing.length} of {list.items.length} have their own photo.
            </p>
            {missing.length ? (
              <>
                <p className="mt-1 text-xs">{list.note} Still missing (tap to upload):</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {missing.map((item) => (
                    <button
                      key={item.slotId}
                      type="button"
                      onClick={() => showSlot(item.slotId)}
                      className="rounded-full border border-[#f1d9a8] bg-white px-2.5 py-1 text-xs font-semibold text-[#8a5a00] hover:border-[#8a5a00]"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        );
      })}

      {visible.length === 0 ? (
        <p className="text-sm text-[#6b7280]">Nothing in this section matches that search.</p>
      ) : sections.length ? (
        <div className="space-y-8">
          {[...sections, ""].map((section) => {
            const rows = visible.filter((slot) => (mediaSlot(slot.id)?.section || "") === section);
            if (!rows.length) return null;
            return (
              <section key={section || "other"} className="space-y-3">
                <h3 className="flex flex-wrap items-baseline gap-x-2 text-sm font-bold text-[#1a1a1b]">
                  {section || "Other"}
                  <span className="text-xs font-normal text-[#9ca3af]">
                    {rows.filter((slot) => slot.custom).length} of {rows.length} uploaded here
                  </span>
                </h3>
                <div className={gridClass}>{rows.map(renderCard)}</div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className={gridClass}>{visible.map(renderCard)}</div>
      )}

      <UploadFailDialog alert={alert} onClose={() => setAlert(null)} />
    </div>
  );
}
