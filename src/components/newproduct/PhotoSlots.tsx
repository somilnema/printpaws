"use client";

import { Check, CloudUpload, RefreshCw, Trash2 } from "lucide-react";
import { PhotoUploadBar, PreviewImage } from "@/components/PreviewImage";
import { SectionHeading } from "@/components/everyday/ui";
import type { SlotState, SlotUploads } from "@/components/everyday/useSlotUploads";
import { fill, type EverydayContent } from "@/lib/everyday-content";

/** One labelled photo box: desk "pet-1".."pet-N", bundle exactly "pet-1". */
export type PhotoSlotSpec = { key: string; label: string };

function formatBytes(bytes: number) {
  if (!bytes) return "";
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

type TileCopy = {
  uploadTitle: string;
  uploadHint: string;
  uploadingLabel: string;
  removeLabel: string;
  replaceLabel: string;
  retryLabel: string;
  uploadFailedLabel: string;
};

function SlotTile({
  inputId,
  label,
  state,
  copy,
  error,
  onPick,
  onRemove,
  onRetry,
}: {
  inputId: string;
  label: string;
  state?: SlotState;
  copy: TileCopy;
  error?: string;
  onPick: (file: File) => void;
  onRemove: () => void;
  onRetry: () => void;
}) {
  const failed = state?.status === "error";
  return (
    <div className="space-y-2">
      {label ? <p className="min-w-0 break-words text-[15px] font-semibold leading-tight text-[#2D2D2D]">{label}</p> : null}
      <input
        type="file"
        id={inputId}
        className="hidden"
        accept="image/*,.heic,.heif"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onPick(file);
        }}
      />
      {!state ? (
        <label
          htmlFor={inputId}
          className={`flex min-h-[112px] w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-[12px] border-2 border-dashed px-4 py-4 text-center transition-colors ${
            error ? "border-red-400 bg-red-50/40" : "border-[#C9B9A8] bg-[#FFFDF9] hover:bg-[#FBF5EE]"
          }`}
        >
          <CloudUpload size={28} strokeWidth={1.5} className="text-[#2D2D2D]" />
          <span className="mt-1 text-[15px] font-semibold text-[#2D2D2D]">{copy.uploadTitle}</span>
          {copy.uploadHint ? <span className="text-[13px] text-[#6B5E53]">{copy.uploadHint}</span> : null}
        </label>
      ) : (
        <div
          className={`space-y-2.5 rounded-[12px] border bg-white p-3 ${
            failed || error ? "border-red-300" : state.status === "saved" ? "border-[#CFE5D0]" : "border-[#EBD6C8]"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <PreviewImage
                src={state.previewUrl}
                alt={label || state.fileName}
                busy={state.status === "uploading"}
                className="h-[64px] w-[64px] rounded-[10px]"
              />
              {state.status === "saved" ? (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#2E7D32] ring-2 ring-white">
                  <Check size={12} strokeWidth={3} className="text-white" />
                </span>
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-medium text-[#2D2D2D]">{state.fileName}</p>
              <p className="mt-0.5 flex items-center gap-1 text-[12px] text-[#6B5E53]">
                {state.status === "uploading" ? (
                  `${copy.uploadingLabel} ${Math.round(state.progress)}%`
                ) : state.status === "saved" ? (
                  <>
                    <Check size={13} strokeWidth={3} className="shrink-0 text-[#2E7D32]" aria-hidden />
                    <span>{formatBytes(state.fileSize)}</span>
                  </>
                ) : (
                  formatBytes(state.fileSize)
                )}
              </p>
              {failed ? (
                <button type="button" onClick={onRetry} className="mt-1 text-left text-[12px] font-semibold text-red-600">
                  {state.error || copy.uploadFailedLabel} {copy.retryLabel}
                </button>
              ) : null}
            </div>
          </div>
          {state.status === "uploading" ? <PhotoUploadBar percent={state.progress} label={copy.uploadingLabel} /> : null}
          <div className="flex flex-wrap gap-2">
            <label
              htmlFor={inputId}
              className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-[8px] border border-[#E3D9CF] bg-white px-3 text-[13px] font-medium text-[#2D2D2D] transition-colors hover:bg-[#FAF7F2]"
            >
              <RefreshCw size={14} />
              {copy.replaceLabel}
            </label>
            <button
              type="button"
              onClick={onRemove}
              className="inline-flex h-9 items-center gap-1.5 rounded-[8px] bg-[#F9EFE4] px-3 text-[13px] font-medium text-[#8C5A3F] transition-colors hover:bg-[#F3E3D3]"
            >
              <Trash2 size={14} />
              {copy.removeLabel}
            </button>
          </div>
        </div>
      )}
      {error ? <p className="text-[12px] font-semibold text-red-500">{error}</p> : null}
    </div>
  );
}

/** Upload boxes for the new products (Desk Portrait: one per pet, Gift Bundle: one). Replaces EverydayUploadStep's single upload. */
export function PhotoSlots({
  specs,
  uploads,
  content,
  note,
  errors,
  onChange,
  replaceLabel,
  heading,
}: {
  specs: PhotoSlotSpec[];
  uploads: SlotUploads;
  content: EverydayContent;
  /** e.g. "You selected: 2 Pets (Horizontal layout)". */
  note?: string;
  /** Validation messages keyed `photo:${slot.key}`. */
  errors: Record<string, string>;
  /** Called after a box gets a new photo or loses one. */
  onChange?: (key: string) => void;
  replaceLabel?: string;
  /** Section heading; desk.uploadHeading (Desk Portrait) or step3.uploadHeading when omitted. */
  heading?: string;
}) {
  const step3 = content.step3;
  const title = heading ?? (content.desk ? content.desk.uploadHeading : step3.uploadHeading);
  // Handoffs: "Photo Guidelines for Best Results" sits under the upload tiles (tips are the admin Photo guide tips).
  const guidelinesTitle = (content.desk?.guidelinesTitle ?? content.bundle?.guidelinesTitle ?? "").trim();
  const guideTips = content.photoGuide.tips.map((tip) => tip.trim()).filter(Boolean).slice(0, 6);
  const copy: TileCopy = {
    uploadTitle: step3.uploadTitle,
    uploadHint: fill(step3.uploadHint, { max: step3.uploadMaxMb }),
    uploadingLabel: step3.uploadingLabel,
    removeLabel: step3.removeLabel,
    replaceLabel: replaceLabel || content.flow?.replaceLabel || step3.uploadTitle,
    retryLabel: step3.retryLabel,
    uploadFailedLabel: step3.uploadFailedLabel,
  };

  return (
    <div className="space-y-3">
      {title ? <SectionHeading>{title}</SectionHeading> : null}
      {note ? (
        <p className="rounded-[10px] bg-[#FAF4EC] px-3.5 py-2.5 text-[14px] font-medium leading-snug text-[#2D2D2D]">{note}</p>
      ) : null}
      <div className="space-y-4">
        {specs.map((spec) => (
          <SlotTile
            key={spec.key}
            inputId={`np-photo-${spec.key}`}
            label={spec.label}
            state={uploads.slots[spec.key]}
            copy={copy}
            error={errors[`photo:${spec.key}`]}
            onPick={(file) => {
              uploads.pick(spec.key, file);
              onChange?.(spec.key);
            }}
            onRemove={() => {
              uploads.remove(spec.key);
              onChange?.(spec.key);
            }}
            onRetry={() => uploads.retry(spec.key)}
          />
        ))}
      </div>
      {guidelinesTitle && guideTips.length ? (
        <div className="rounded-[12px] border border-[#E8D6C8] bg-[#FAF4EC] px-3.5 py-3">
          <p className="text-[14px] font-semibold text-[#2D2D2D]">{guidelinesTitle}</p>
          <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
            {guideTips.map((tip) => (
              <li key={tip} className="flex min-w-0 items-start gap-1.5 text-[12.5px] leading-snug text-[#6B5E53]">
                <span className="mt-[1px] inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#4F9A5B] text-[10px] font-bold text-white">
                  ✓
                </span>
                <span className="min-w-0 break-words">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
