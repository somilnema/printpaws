"use client";

import type { ReactNode } from "react";
import { Check, CloudUpload, Images, Layers, Plus, RefreshCw, Trash2, Users } from "lucide-react";
import { PhotoUploadBar, PreviewImage } from "@/components/PreviewImage";
import { CornerMark, SectionHeading } from "@/components/everyday/ui";
import type { SlotState, SlotUploads } from "@/components/everyday/useSlotUploads";
import { fill, type EverydayContent } from "@/lib/everyday-content";
import {
  methodCopy,
  referenceKeys,
  type FlowProduct,
  type PhotoMethod,
  type SlotSpec,
} from "@/lib/product-order";

const METHOD_ICON: Record<PhotoMethod, typeof Users> = { group: Users, separate: Images, mixed: Layers };

function formatBytes(bytes: number) {
  if (!bytes) return "";
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** "How would you like to upload your photos?" Only the methods switched on in the admin are offered. */
export function MethodCards({
  content,
  methods,
  method,
  onMethod,
}: {
  content: EverydayContent;
  methods: PhotoMethod[];
  method: PhotoMethod;
  onMethod: (next: PhotoMethod) => void;
}) {
  const flow = content.flow;
  if (!flow || methods.length < 2) return null;
  return (
    <div className="space-y-3">
      <SectionHeading>{flow.methodHeading}</SectionHeading>
      <div
        className="grid gap-2.5"
        role="radiogroup"
        aria-label={flow.methodHeading}
        style={{ gridTemplateColumns: `repeat(${methods.length}, minmax(0, 1fr))` }}
      >
        {methods.map((id) => {
          const copy = methodCopy(flow, id);
          const Icon = METHOD_ICON[id];
          const selected = method === id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onMethod(id)}
              className={`relative flex min-h-[96px] flex-col items-center gap-1 rounded-[10px] bg-white px-1.5 pb-2.5 pt-3 text-center transition-all sm:min-h-[120px] sm:gap-1.5 sm:px-2 sm:pb-3 sm:pt-4 ${
                selected ? "border border-[#A97659] bg-[#FEFAF6] shadow-[0_0_0_1px_#A97659]" : "border border-[#E8D6C8] hover:border-[#C9B9A8]"
              }`}
            >
              <CornerMark selected={selected} size={18} className="absolute right-1 top-1 sm:right-1.5 sm:top-1.5" />
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F9EFE4] text-[#A97659] sm:h-9 sm:w-9">
                <Icon size={18} strokeWidth={1.75} className="sm:h-5 sm:w-5" />
              </span>
              <span className="text-[12px] font-semibold leading-tight text-[#2D2D2D] sm:text-[13px]">{copy.title}</span>
              {copy.description ? (
                <span className="line-clamp-2 text-[11px] leading-snug text-[#6B5E53] sm:text-[11.5px]">{copy.description}</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type BoxCopy = {
  uploadTitle: string;
  uploadHint: string;
  uploadingLabel: string;
  removeLabel: string;
  replaceLabel: string;
  requiredLabel: string;
  optionalLabel: string;
  retryLabel: string;
  uploadFailedLabel: string;
};

function SlotBox({
  inputId,
  label,
  required,
  state,
  copy,
  error,
  onPick,
  onRemove,
  onRetry,
  children,
}: {
  inputId: string;
  label: string;
  required: boolean;
  state?: SlotState;
  copy: BoxCopy;
  error?: string;
  onPick: (file: File) => void;
  onRemove: () => void;
  onRetry: () => void;
  children?: ReactNode;
}) {
  const input = (
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
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0 truncate text-[15px] font-semibold text-[#2D2D2D]">{label}</span>
        {required ? (
          <span className="shrink-0 rounded-full bg-[#A97659] px-2.5 py-0.5 text-[11px] font-semibold text-white">
            {copy.requiredLabel}
          </span>
        ) : (
          <span className="shrink-0 text-[12px] text-[#6B5E53]">{copy.optionalLabel}</span>
        )}
      </div>
      {input}
      {!state ? (
        <label
          htmlFor={inputId}
          className={`flex min-h-[104px] w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-[12px] border-2 border-dashed px-4 py-4 text-center transition-colors ${
            error ? "border-red-400 bg-red-50/40" : "border-[#C9B9A8] bg-[#FFFDF9] hover:bg-[#FBF5EE]"
          }`}
        >
          <CloudUpload size={28} strokeWidth={1.5} className="text-[#2D2D2D]" />
          <span className="mt-1 text-[15px] font-semibold text-[#2D2D2D]">{copy.uploadTitle}</span>
          <span className="text-[13px] text-[#6B5E53]">{copy.uploadHint}</span>
        </label>
      ) : (
        <div className="space-y-2 rounded-[12px] border border-[#EBD6C8] bg-white p-3">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <PreviewImage
                src={state.previewUrl}
                alt={label}
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
              <p className="mt-0.5 text-[12px] text-[#6B5E53]">
                {state.status === "uploading" ? `${copy.uploadingLabel} ${Math.round(state.progress)}%` : formatBytes(state.fileSize)}
              </p>
              {state.status === "error" ? (
                <button type="button" onClick={onRetry} className="mt-1 text-left text-[12px] font-semibold text-red-600">
                  {state.error || copy.uploadFailedLabel} {copy.retryLabel}
                </button>
              ) : null}
            </div>
          </div>
          {state.status === "uploading" ? <PhotoUploadBar percent={state.progress} /> : null}
          <div className="flex gap-2">
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
          {children}
        </div>
      )}
      {error ? <p className="text-[12px] font-semibold text-red-500">{error}</p> : null}
    </div>
  );
}

/** The upload boxes for the chosen method, then optional reference photos (Mixed) and the group-photo confirmation. */
export function SlotUploadsSection({
  product,
  content,
  method,
  specs,
  uploads,
  petCount,
  confirmGroup,
  onConfirmGroup,
  showConfirm,
  errors,
  onSlotChange,
}: {
  product: FlowProduct;
  content: EverydayContent;
  method: PhotoMethod;
  specs: SlotSpec[];
  uploads: SlotUploads;
  petCount: number;
  confirmGroup: boolean;
  onConfirmGroup: (on: boolean) => void;
  showConfirm: boolean;
  errors: Record<string, string>;
  /** Called after a box gets a new photo or loses one. */
  onSlotChange?: (key: string) => void;
}) {
  const flow = content.flow;
  if (!flow) return null;
  const step3 = content.step3;
  const copy: BoxCopy = {
    uploadTitle: step3.uploadTitle,
    uploadHint: fill(step3.uploadHint, { max: step3.uploadMaxMb }),
    uploadingLabel: step3.uploadingLabel,
    removeLabel: step3.removeLabel,
    replaceLabel: flow.replaceLabel,
    requiredLabel: flow.requiredLabel,
    optionalLabel: step3.optionalLabel,
    retryLabel: step3.retryLabel,
    uploadFailedLabel: step3.uploadFailedLabel,
  };
  const refs = referenceKeys(flow, method);
  const usedRefs = refs.filter((key) => uploads.slots[key]);
  const nextRef = refs.find((key) => !uploads.slots[key]);
  const petOptions = Array.from({ length: petCount }, (_, i) => i + 1);

  return (
    <div className="space-y-5">
      {specs.map((spec) => (
        <SlotBox
          key={spec.key}
          inputId={`flow-photo-${spec.key}`}
          label={spec.label}
          required={spec.required}
          state={uploads.slots[spec.key]}
          copy={copy}
          error={errors[`photo:${spec.key}`]}
          onPick={(file) => {
            uploads.pick(spec.key, file);
            onSlotChange?.(spec.key);
          }}
          onRemove={() => {
            uploads.remove(spec.key);
            onSlotChange?.(spec.key);
          }}
          onRetry={() => uploads.retry(spec.key)}
        />
      ))}

      {showConfirm ? (
        <label className="flex min-h-[44px] cursor-pointer items-start gap-3 rounded-[10px] bg-[#FAF4EC] px-3.5 py-3">
          <input
            type="checkbox"
            checked={confirmGroup}
            onChange={(e) => onConfirmGroup(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 accent-[#A97659]"
          />
          <span className="text-[14px] leading-snug text-[#2D2D2D]">{flow.confirmGroupLabel}</span>
        </label>
      ) : null}
      {showConfirm && errors.confirmGroup ? (
        <p className="-mt-3 text-[12px] font-semibold text-red-500">{errors.confirmGroup}</p>
      ) : null}

      {refs.length > 0 ? (
        <div className="space-y-3 rounded-[12px] bg-[#FAF4EC] p-3.5">
          <div>
            <p className="text-[15px] font-semibold leading-tight text-[#2D2D2D]">
              {flow.referencesHeading}
              <span className="font-normal text-[#6B5E53]"> {content.step2.optionalLabel}</span>
            </p>
            {flow.referencesDescription ? (
              <p className="mt-1 text-[13px] leading-snug text-[#6B5E53]">{flow.referencesDescription}</p>
            ) : null}
          </div>
          {usedRefs.map((key, index) => {
            const state = uploads.slots[key];
            return (
              <SlotBox
                key={key}
                inputId={`flow-photo-${key}`}
                label={`${index + 1}.`}
                required={false}
                state={state}
                copy={copy}
                error={errors[`photo:${key}`]}
                onPick={(file) => uploads.pick(key, file)}
                onRemove={() => uploads.remove(key)}
                onRetry={() => uploads.retry(key)}
              >
                {product === "multi_pet" && petCount > 0 ? (
                  <label className="flex items-center gap-2 pt-1 text-[13px] text-[#6B5E53]">
                    <span className="shrink-0">{flow.referenceForLabel}</span>
                    <select
                      value={state?.pet ?? ""}
                      onChange={(e) => uploads.setPet(key, e.target.value ? Number(e.target.value) : undefined)}
                      className="h-9 min-w-0 flex-1 rounded-[8px] border border-[#E3D9CF] bg-white px-2 text-[14px] text-[#2D2D2D] outline-none focus:border-[#A97659]"
                    >
                      <option value="">{flow.referenceAnyone}</option>
                      {petOptions.map((pet) => (
                        <option key={pet} value={pet}>
                          {fill(flow.petSlotLabel, { n: pet })}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}
              </SlotBox>
            );
          })}
          {nextRef ? (
            <>
              <input
                type="file"
                id={`flow-photo-${nextRef}`}
                className="hidden"
                accept="image/*,.heic,.heif"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) uploads.pick(nextRef, file);
                }}
              />
              <label
                htmlFor={`flow-photo-${nextRef}`}
                className="flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-dashed border-[#C9B9A8] bg-white px-3 text-[14px] font-medium text-[#A97659] transition-colors hover:bg-[#FFFDF9]"
              >
                <Plus size={18} />
                {flow.referenceAddLabel}
              </label>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/** Optional note for the artist with a live counter (150 characters by default). */
export function ArtistNote({
  content,
  value,
  onValue,
}: {
  content: EverydayContent;
  value: string;
  onValue: (v: string) => void;
}) {
  const flow = content.flow;
  if (!flow || !flow.showInstructions) return null;
  const max = flow.instructionsMax;
  return (
    <div className="space-y-2">
      <label htmlFor="flow-artist-note" className="block text-[16px] font-semibold leading-tight text-[#2D2D2D]">
        {flow.instructionsHeading}
        <span className="font-normal text-[#6B5E53]"> {content.step2.optionalLabel}</span>
      </label>
      <div className="relative">
        <textarea
          id="flow-artist-note"
          rows={3}
          value={value}
          maxLength={max}
          onChange={(e) => onValue(e.target.value.slice(0, max))}
          placeholder={flow.instructionsPlaceholder}
          className="block w-full resize-none rounded-[10px] border border-[#EBD6C8] bg-white px-4 pb-7 pt-3 text-[16px] leading-6 text-[#2D2D2D] outline-none transition-colors placeholder:text-[#B0A29A] focus:border-[#A97659]"
        />
        <span className="pointer-events-none absolute bottom-2 right-3 text-[12px] text-[#8B8B7D]">
          {value.length} / {max}
        </span>
      </div>
      {flow.instructionsHint ? <p className="mt-1.5 text-[12px] leading-snug text-[#6B5E53]">{flow.instructionsHint}</p> : null}
    </div>
  );
}
