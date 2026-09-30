"use client";

import { useEffect, useMemo, useState } from "react";
import { replaceSiteMedia, resetSiteMedia, type SiteMediaAdmin, type SiteMediaSlotView } from "@/app/actions/mediaActions";
import { IMAGE_UPLOAD_LIMIT, VIDEO_UPLOAD_LIMIT, mediaGroups } from "@/lib/site-media-catalog";
import { buttonClass, errorClass, ghostButtonClass, okClass, warnClass } from "@/components/admin/ui";

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

export function MediaPanel({
  initial,
  onChanged,
}: {
  initial: SiteMediaAdmin;
  onChanged: () => Promise<void>;
}) {
  const groups = useMemo(() => mediaGroups(), []);
  const [group, setGroup] = useState(groups[0] || "Product gallery");
  const [query, setQuery] = useState("");
  const [slots, setSlots] = useState(initial.slots);
  const [ready, setReady] = useState(initial.ready);
  const [setupError, setSetupError] = useState(initial.error || "");
  const [pendingId, setPendingId] = useState("");
  const [notice, setNotice] = useState("");
  const [cardError, setCardError] = useState<Record<string, string>>({});

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

  async function onReplace(slot: SiteMediaSlotView, file: File | null) {
    if (!file || pendingId) return;
    const limit = slot.kind === "video" ? VIDEO_UPLOAD_LIMIT : IMAGE_UPLOAD_LIMIT;
    if (file.size > limit) {
      const mb = Math.round(limit / (1024 * 1024));
      setCardError((current) => ({ ...current, [slot.id]: `That file is too large. Keep it under ${mb} MB.` }));
      return;
    }
    setPendingId(slot.id);
    setNotice("");
    setCardError((current) => ({ ...current, [slot.id]: "" }));
    const body = new FormData();
    body.set("slot", slot.id);
    body.set("file", file);
    const result = await replaceSiteMedia(body);
    setPendingId("");
    if (!result.ok) {
      setCardError((current) => ({ ...current, [slot.id]: result.error }));
      return;
    }
    setSlots((current) =>
      current.map((item) =>
        item.id === slot.id ? { ...item, url: result.url, custom: true, updatedAt: result.updatedAt } : item
      )
    );
    setReady(true);
    setSetupError("");
    setNotice(`${slot.label} is updated on the shop.`);
    await onChanged();
  }

  async function onReset(slot: SiteMediaSlotView) {
    if (pendingId) return;
    setPendingId(slot.id);
    setNotice("");
    setCardError((current) => ({ ...current, [slot.id]: "" }));
    const result = await resetSiteMedia(slot.id);
    setPendingId("");
    if (!result.ok) {
      setCardError((current) => ({ ...current, [slot.id]: result.error }));
      return;
    }
    setSlots((current) =>
      current.map((item) =>
        item.id === slot.id ? { ...item, url: item.fallbackUrl, custom: false, updatedAt: null } : item
      )
    );
    setNotice(`${slot.label} is back to the original file.`);
    await onChanged();
  }

  return (
    <div className="space-y-4">
      <p className="max-w-3xl text-sm leading-relaxed text-[#6b7280]">
        Replace any shop photo or video here. Photos are resized and saved as WebP. Videos should be MP4 or WebM, under 20 MB.
        The original file stays in place until you replace it, and you can restore it later.
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

      {visible.length === 0 ? (
        <p className="text-sm text-[#6b7280]">Nothing in this section matches that search.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((slot) => {
            const busy = pendingId === slot.id;
            const when = formatWhen(slot.updatedAt);
            return (
              <article key={slot.id} className="overflow-hidden rounded-3xl border border-[#eeeeee] bg-white shadow-sm">
                <div className="relative aspect-[4/3] bg-[#f3f4f6]">
                  {slot.kind === "video" ? (
                    <video
                      key={slot.url}
                      src={previewSrc(slot.url)}
                      controls
                      muted
                      playsInline
                      preload="none"
                      className="h-full w-full object-cover"
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
                  <span
                    className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                      slot.custom ? "bg-primary text-white" : "bg-white/95 text-[#6b7280]"
                    }`}
                  >
                    {slot.custom ? "Replaced" : "Original"}
                  </span>
                </div>
                <div className="space-y-3 p-4">
                  <div>
                    <h2 className="text-base font-bold tracking-tight">{slot.label}</h2>
                    <p className="mt-1 text-xs leading-relaxed text-[#9ca3af]">{slot.hint}</p>
                    {when ? <p className="mt-1 text-[11px] text-[#9ca3af]">Updated {when}</p> : null}
                  </div>
                  {cardError[slot.id] ? <p className={errorClass}>{cardError[slot.id]}</p> : null}
                  <div className="flex flex-wrap gap-2">
                    <label className={`${buttonClass} cursor-pointer ${busy ? "pointer-events-none opacity-50" : ""}`}>
                      {busy ? "Saving…" : "Replace"}
                      <input
                        type="file"
                        accept={slot.kind === "video" ? "video/mp4,video/webm" : "image/jpeg,image/png,image/webp"}
                        className="sr-only"
                        disabled={Boolean(pendingId)}
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
                        disabled={Boolean(pendingId)}
                        onClick={() => void onReset(slot)}
                        className={ghostButtonClass}
                      >
                        Restore original
                      </button>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
