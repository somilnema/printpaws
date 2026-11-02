"use client";

import { Upload, ArrowRight, ArrowLeft, Check, Trash2, RefreshCw } from "lucide-react";
import { PhotoUploadBar, PreviewImage } from "@/components/PreviewImage";

type Props = {
  showPhotoGuide: () => void;
  selectedFile: File | null;
  photoPreviewUrl: string;
  photoStatus: "idle" | "uploading" | "saved" | "error";
  photoProgress: number;
  photoError: string;
  onPickFile: (file: File) => void;
  onReplaceClick: () => void;
  onRemovePhoto: () => void;
  onRetryUpload: () => void;
  fieldErrors: Record<string, string>;
  customerName: string;
  onCustomerName: (v: string) => void;
  customerPhone: string;
  onCustomerPhone: (v: string) => void;
  customerEmail: string;
  onCustomerEmail: (v: string) => void;
  onBack: () => void;
  onAddToCart: () => void;
  fileInputId?: string;
};

export function EverydayUploadStep({
  showPhotoGuide,
  selectedFile,
  photoPreviewUrl,
  photoStatus,
  photoProgress,
  photoError,
  onPickFile,
  onReplaceClick,
  onRemovePhoto,
  onRetryUpload,
  fieldErrors,
  customerName,
  onCustomerName,
  customerPhone,
  onCustomerPhone,
  customerEmail,
  onCustomerEmail,
  onBack,
  onAddToCart,
  fileInputId = "everyday-pet-photo-upload",
}: Props) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <button
          type="button"
          onClick={onBack}
          className="flex min-h-[44px] items-center gap-1 text-xs font-bold text-[#77716C] hover:text-[#292522] transition-colors uppercase"
        >
          <ArrowLeft size={14} /> Back
        </button>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={showPhotoGuide}
          className="min-h-[44px] rounded-full bg-[#A97659]/10 px-3 text-[11px] font-bold uppercase tracking-wider text-[#A97659]"
        >
          Photo Guide
        </button>
      </div>

      <div
        className={`rounded-[10px] border-[1.5px] border-dashed p-4 ${
          fieldErrors.photo ? "border-red-400 bg-red-50/40" : "border-[#E3DDD7] bg-[#FBF4EA]/40"
        }`}
      >
        <input
          type="file"
          id={fileInputId}
          className="hidden"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) onPickFile(file);
          }}
        />

        {!selectedFile ? (
          <label
            htmlFor={fileInputId}
            className="flex min-h-[120px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-[8px] border-[1.5px] border-[#E3DDD7] bg-white px-4 py-6 text-sm font-bold text-[#292522] shadow-sm"
          >
            <Upload size={22} className="text-[#A97659]" />
            Upload your pet photo
            <span className="text-[12px] font-medium text-[#77716C]">JPG, PNG or WebP</span>
          </label>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <PreviewImage
                src={photoPreviewUrl}
                alt="Uploaded pet"
                busy={photoStatus === "uploading"}
                className="h-[72px] w-[72px] rounded-[8px] border border-[#E3DDD7]"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-medium text-[#77716C]">{selectedFile.name}</p>
                {photoStatus === "saved" ? (
                  <p className="mt-1 flex items-center gap-1 text-[12px] font-semibold text-green-700">
                    <Check size={14} strokeWidth={3} /> Photo uploaded successfully!
                  </p>
                ) : null}
                {photoStatus === "error" ? (
                  <button
                    type="button"
                    onClick={onRetryUpload}
                    className="mt-1 text-left text-[11px] font-bold text-red-600"
                  >
                    {photoError || "Upload failed."} Tap to retry.
                  </button>
                ) : null}
              </div>
            </div>
            {photoStatus === "uploading" ? <PhotoUploadBar percent={photoProgress} /> : null}
            {photoStatus === "saved" ? (
              <p className="text-[12px] leading-[17px] text-[#77716C]">
                Your photo has been received. Our team will use it to create your personalized portrait.
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onReplaceClick}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[8px] border border-[#E3DDD7] bg-white px-3 text-[12px] font-bold text-[#292522]"
              >
                <RefreshCw size={14} /> Replace Photo
              </button>
              <button
                type="button"
                onClick={onRemovePhoto}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[8px] border border-[#E3DDD7] bg-white px-3 text-[12px] font-bold text-red-600"
              >
                <Trash2 size={14} /> Remove
              </button>
            </div>
          </div>
        )}
        {fieldErrors.photo ? (
          <p className="mt-2 text-[11px] font-bold text-red-500">{fieldErrors.photo}</p>
        ) : null}
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-[#292522]">Your Details</h3>
          <p className="mt-1 text-[12px] leading-[17px] text-[#77716C]">
            Where can we reach you with updates about your portrait?
          </p>
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[#77716C]">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => onCustomerName(e.target.value)}
            placeholder="Your full name"
            className={`w-full rounded-[8px] border-[1.5px] px-4 py-3 text-sm outline-none focus:border-[#A97659] ${
              fieldErrors.customerName ? "border-red-400 bg-red-50/40" : "border-[#E3DDD7]"
            }`}
          />
          {fieldErrors.customerName ? (
            <p className="mt-1.5 text-[11px] font-bold text-red-500">{fieldErrors.customerName}</p>
          ) : null}
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[#77716C]">
            Mobile Number <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <span className="flex min-h-[48px] items-center rounded-[8px] border-[1.5px] border-[#E3DDD7] bg-[#FBF4EA] px-3 text-sm font-semibold text-[#292522]">
              +91
            </span>
            <input
              type="tel"
              inputMode="numeric"
              value={customerPhone}
              onChange={(e) => onCustomerPhone(e.target.value.replace(/[^\d+\s-]/g, ""))}
              placeholder="98765 43210"
              className={`min-w-0 flex-1 rounded-[8px] border-[1.5px] px-4 py-3 text-sm outline-none focus:border-[#A97659] ${
                fieldErrors.customerPhone ? "border-red-400 bg-red-50/40" : "border-[#E3DDD7]"
              }`}
            />
          </div>
          {fieldErrors.customerPhone ? (
            <p className="mt-1.5 text-[11px] font-bold text-red-500">{fieldErrors.customerPhone}</p>
          ) : null}
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[#77716C]">
            Email <span className="font-medium normal-case tracking-normal text-[#77716C]">(optional)</span>
          </label>
          <input
            type="email"
            value={customerEmail}
            onChange={(e) => onCustomerEmail(e.target.value)}
            placeholder="you@example.com"
            className={`w-full rounded-[8px] border-[1.5px] px-4 py-3 text-sm outline-none focus:border-[#A97659] ${
              fieldErrors.customerEmail ? "border-red-400 bg-red-50/40" : "border-[#E3DDD7]"
            }`}
          />
          {fieldErrors.customerEmail ? (
            <p className="mt-1.5 text-[11px] font-bold text-red-500">{fieldErrors.customerEmail}</p>
          ) : null}
        </div>

        <p className="rounded-[8px] bg-[#FBF4EA] px-3 py-2.5 text-[12px] leading-[17px] text-[#77716C]">
          You’ll receive a preview before printing, with unlimited revisions to get your portrait just right.
        </p>
      </div>

      <button
        type="button"
        onClick={onAddToCart}
        className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[10px] bg-[#A97659] text-base font-semibold uppercase text-white transition-all hover:bg-[#966c55] active:scale-[0.98]"
      >
        ADD TO CART <ArrowRight size={18} />
      </button>
    </div>
  );
}
