"use client";

import type { ReactNode } from "react";
import { Check, ChevronRight, CloudUpload, ImageIcon, Mail, Phone, ShieldCheck, Trash2, User } from "lucide-react";
import { PhotoUploadBar, PreviewImage } from "@/components/PreviewImage";
import type { EverydayContent } from "@/lib/everyday-content";
import { PrimaryButton, SectionHeading, StepIntro, TrustStrip } from "@/components/everyday/ui";

type Props = {
  content: EverydayContent;
  showPhotoGuide: () => void;
  selectedFile: File | null;
  photoPreviewUrl: string;
  photoStatus: "idle" | "uploading" | "saved" | "error";
  photoProgress: number;
  photoError: string;
  onPickFile: (file: File) => void;
  onRemovePhoto: () => void;
  onRetryUpload: () => void;
  fieldErrors: Record<string, string>;
  customerName: string;
  onCustomerName: (v: string) => void;
  customerPhone: string;
  onCustomerPhone: (v: string) => void;
  customerEmail: string;
  onCustomerEmail: (v: string) => void;
  onAddToCart: () => void;
  fileInputId?: string;
};

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** Field with the icon on the left and the label sitting inside the box, above the value. */
function DetailField({
  id,
  icon,
  label,
  required,
  optionalLabel,
  error,
  children,
}: {
  id: string;
  icon: ReactNode;
  label: string;
  required?: boolean;
  optionalLabel?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div
        className={`flex min-h-[58px] items-center gap-3 rounded-[10px] border bg-white px-4 transition-colors focus-within:border-[#A97659] ${
          error ? "border-red-400 bg-red-50/40" : "border-[#EBD6C8]"
        }`}
      >
        <span className="shrink-0 text-[#A97659]">{icon}</span>
        <div className="min-w-0 flex-1 py-1.5">
          <label htmlFor={id} className="block text-[13px] font-medium leading-tight text-[#6B5E53]">
            {label}
            {required ? <span className="text-red-500"> *</span> : null}
            {optionalLabel ? <span className="font-normal"> {optionalLabel}</span> : null}
          </label>
          {children}
        </div>
      </div>
      {error ? <p className="mt-1.5 text-[12px] font-semibold text-red-500">{error}</p> : null}
    </div>
  );
}

const inputClass =
  "mt-0.5 block w-full bg-transparent text-[16px] leading-6 text-[#2D2D2D] outline-none placeholder:text-[#B0A29A]";

export function EverydayUploadStep({
  content,
  showPhotoGuide,
  selectedFile,
  photoPreviewUrl,
  photoStatus,
  photoProgress,
  photoError,
  onPickFile,
  onRemovePhoto,
  onRetryUpload,
  fieldErrors,
  customerName,
  onCustomerName,
  customerPhone,
  onCustomerPhone,
  customerEmail,
  onCustomerEmail,
  onAddToCart,
  fileInputId = "everyday-pet-photo-upload",
}: Props) {
  const copy = content.step3;

  return (
    <div className="space-y-6">
      <StepIntro title={copy.title} description={copy.description} />

      <button
        type="button"
        onClick={showPhotoGuide}
        className="flex min-h-[72px] w-full items-center gap-3 rounded-[10px] bg-[#F9EFE4] px-4 py-3 text-left transition-colors hover:bg-[#F4E6D8]"
      >
        <ImageIcon size={24} strokeWidth={1.75} className="shrink-0 text-[#A97659]" />
        <span className="min-w-0 flex-1">
          <span className="block text-[16px] font-semibold leading-tight text-[#A97659]">{copy.guideTitle}</span>
          {copy.guideDescription ? (
            <span className="mt-0.5 block text-[14px] leading-snug text-[#6B5E53]">{copy.guideDescription}</span>
          ) : null}
        </span>
        <ChevronRight size={20} className="shrink-0 text-[#6B5E53]" />
      </button>

      <div className="space-y-3">
        <SectionHeading>{copy.uploadHeading}</SectionHeading>
        <input
          type="file"
          id={fileInputId}
          className="hidden"
          accept="image/*,.heic,.heif"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) onPickFile(file);
          }}
        />
        <label
          htmlFor={fileInputId}
          className={`flex min-h-[120px] w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-[12px] border-2 border-dashed px-4 py-5 text-center transition-colors ${
            fieldErrors.photo ? "border-red-400 bg-red-50/40" : "border-[#C9B9A8] bg-[#FFFDF9] hover:bg-[#FBF5EE]"
          }`}
        >
          <CloudUpload size={32} strokeWidth={1.5} className="text-[#2D2D2D]" />
          <span className="mt-1 text-[16px] font-semibold text-[#2D2D2D]">{copy.uploadTitle}</span>
          <span className="text-[14px] text-[#6B5E53]">{copy.uploadHint}</span>
        </label>
        {fieldErrors.photo ? <p className="text-[12px] font-semibold text-red-500">{fieldErrors.photo}</p> : null}

        {selectedFile ? (
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <PreviewImage
                  src={photoPreviewUrl}
                  alt="Uploaded pet"
                  busy={photoStatus === "uploading"}
                  className="h-[72px] w-[72px] rounded-[10px]"
                />
                {photoStatus === "saved" ? (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#2E7D32] ring-2 ring-white">
                    <Check size={12} strokeWidth={3} className="text-white" />
                  </span>
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium text-[#2D2D2D]">{selectedFile.name}</p>
                <p className="mt-0.5 text-[12px] text-[#6B5E53]">
                  {photoStatus === "uploading" ? copy.uploadingLabel : formatBytes(selectedFile.size)}
                </p>
                {photoStatus === "error" ? (
                  <button type="button" onClick={onRetryUpload} className="mt-1 text-left text-[12px] font-semibold text-red-600">
                    {photoError || "Upload failed."} Tap to retry.
                  </button>
                ) : null}
              </div>
              <button
                type="button"
                onClick={onRemovePhoto}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[8px] bg-[#F9EFE4] px-3 text-[14px] font-medium text-[#8C5A3F] transition-colors hover:bg-[#F3E3D3]"
              >
                <Trash2 size={16} />
                {copy.removeLabel}
              </button>
            </div>
            {photoStatus === "uploading" ? <PhotoUploadBar percent={photoProgress} /> : null}
          </div>
        ) : null}
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <SectionHeading>{copy.detailsHeading}</SectionHeading>
          {copy.detailsDescription ? (
            <p className="text-[14px] leading-snug text-[#6B5E53]">{copy.detailsDescription}</p>
          ) : null}
        </div>

        <DetailField id="everyday-name" icon={<User size={20} />} label={copy.nameLabel} required error={fieldErrors.customerName}>
          <input
            id="everyday-name"
            type="text"
            autoComplete="name"
            value={customerName}
            onChange={(e) => onCustomerName(e.target.value)}
            placeholder={copy.namePlaceholder}
            className={inputClass}
          />
        </DetailField>

        <DetailField id="everyday-phone" icon={<Phone size={20} />} label={copy.phoneLabel} required error={fieldErrors.customerPhone}>
          <div className="mt-0.5 flex items-center gap-3">
            <span className="shrink-0 text-[16px] text-[#2D2D2D]">+91</span>
            <span aria-hidden className="h-5 w-px shrink-0 bg-[#EBD6C8]" />
            <input
              id="everyday-phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              value={customerPhone}
              onChange={(e) => onCustomerPhone(e.target.value.replace(/[^\d+\s-]/g, ""))}
              placeholder={copy.phonePlaceholder}
              className="block min-w-0 flex-1 bg-transparent text-[16px] leading-6 text-[#2D2D2D] outline-none placeholder:text-[#B0A29A]"
            />
          </div>
        </DetailField>

        <DetailField
          id="everyday-email"
          icon={<Mail size={20} />}
          label={copy.emailLabel}
          optionalLabel={copy.optionalLabel}
          error={fieldErrors.customerEmail}
        >
          <input
            id="everyday-email"
            type="email"
            autoComplete="email"
            value={customerEmail}
            onChange={(e) => onCustomerEmail(e.target.value)}
            placeholder={copy.emailPlaceholder}
            className={inputClass}
          />
        </DetailField>

        {copy.reassurance ? (
          <div className="flex min-h-[72px] items-center gap-3 rounded-[10px] bg-[#F9EFE4] px-4 py-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F1E2D3] text-[#A97659]">
              <ShieldCheck size={24} strokeWidth={1.75} />
            </span>
            <p className="text-[14px] leading-snug text-[#6B5E53]">{copy.reassurance}</p>
          </div>
        ) : null}
      </div>

      <PrimaryButton label={copy.addToCartLabel} onClick={onAddToCart} />

      {copy.showTrust ? <TrustStrip items={content.trust} /> : null}
    </div>
  );
}
