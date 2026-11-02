"use client";

import { Upload, ArrowRight, ArrowLeft, Check, Trash2, RefreshCw, ImageIcon, ShieldCheck, Paintbrush, Truck, Eye } from "lucide-react";
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
          className="flex min-h-[44px] items-center gap-1 text-xs font-bold text-[#6B5E53] hover:text-[#2D2D2D] transition-colors uppercase"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <span className="text-base font-semibold text-[#2D2D2D]">Upload Your Photo</span>
      </div>

      <p className="text-sm leading-relaxed text-[#6B5E53]">
        Choose a clear photo of your furry friend. We&apos;ll turn it into a beautiful, hand-drawn portrait you&apos;ll love.
      </p>

      <button
        type="button"
        onClick={showPhotoGuide}
        className="flex min-h-[72px] w-full items-center gap-3 rounded-[10px] border border-[#EBD6C8] bg-[#F9EFE4] px-4 text-left transition-colors hover:bg-[#F1E7DC]"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-white text-[#A97659]">
          <ImageIcon size={22} />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-[#2D2D2D]">Photo Guide</span>
          <span className="mt-0.5 block text-[12px] leading-[17px] text-[#6B5E53]">
            See example photos and tips for the best results
          </span>
        </span>
      </button>

      <div className="space-y-3">
        <label className="block text-base font-semibold text-[#2D2D2D]">1. Upload a Photo</label>
        <div
          className={`rounded-[12px] border-[1.5px] border-dashed p-4 ${
            fieldErrors.photo
              ? "border-red-400 bg-red-50/40"
              : "border-[#C9B9A8] bg-[#FFFDF9]"
          }`}
        >
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

          {!selectedFile ? (
            <label
              htmlFor={fileInputId}
              className="flex min-h-[120px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-[10px] px-4 py-6 text-center"
            >
              <Upload size={28} className="text-[#A97659]" />
              <span className="text-sm font-bold text-[#2D2D2D]">Choose Image</span>
              <span className="text-[12px] font-medium text-[#6B5E53]">
                JPG, PNG, or HEIC · Max 10MB
              </span>
            </label>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-[10px] border border-[#EBD6C8] bg-white p-3">
                <div className="relative">
                  <PreviewImage
                    src={photoPreviewUrl}
                    alt="Uploaded pet"
                    busy={photoStatus === "uploading"}
                    className="h-[72px] w-[72px] rounded-[8px] border border-[#EBD6C8]"
                  />
                  {photoStatus === "saved" ? (
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-green-600 shadow-sm">
                      <Check size={11} className="text-white" strokeWidth={3} />
                    </span>
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#2D2D2D]">{selectedFile.name}</p>
                  <p className="mt-0.5 text-[12px] text-[#6B5E53]">
                    {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                  {photoStatus === "saved" ? (
                    <p className="mt-1 text-[12px] font-semibold text-green-700">Photo uploaded successfully</p>
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
                <button
                  type="button"
                  onClick={onRemovePhoto}
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[8px] px-2 text-[12px] font-bold text-red-600"
                >
                  <Trash2 size={16} />
                  Remove
                </button>
              </div>
              {photoStatus === "uploading" ? <PhotoUploadBar percent={photoProgress} /> : null}
              {photoStatus === "saved" ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={onReplaceClick}
                    className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[8px] border border-[#EBD6C8] bg-white px-3 text-[12px] font-bold text-[#2D2D2D]"
                  >
                    <RefreshCw size={14} /> Replace Photo
                  </button>
                </div>
              ) : null}
            </div>
          )}
          {fieldErrors.photo ? (
            <p className="mt-2 text-[11px] font-bold text-red-500">{fieldErrors.photo}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-[#2D2D2D]">2. Your Details</h3>
          <p className="mt-1 text-[12px] leading-[17px] text-[#6B5E53]">
            Where can we reach you with updates about your portrait?
          </p>
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[#6B5E53]">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => onCustomerName(e.target.value)}
            placeholder="Your full name"
            className={`h-[46px] w-full rounded-[8px] border-[1.5px] px-4 text-sm outline-none focus:border-[#A97659] ${
              fieldErrors.customerName ? "border-red-400 bg-red-50/40" : "border-[#EBD6C8]"
            }`}
          />
          {fieldErrors.customerName ? (
            <p className="mt-1.5 text-[11px] font-bold text-red-500">{fieldErrors.customerName}</p>
          ) : null}
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[#6B5E53]">
            Mobile Number <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <span className="flex h-[46px] items-center rounded-[8px] border-[1.5px] border-[#EBD6C8] bg-[#F9EFE4] px-3 text-sm font-semibold text-[#2D2D2D]">
              +91
            </span>
            <input
              type="tel"
              inputMode="numeric"
              value={customerPhone}
              onChange={(e) => onCustomerPhone(e.target.value.replace(/[^\d+\s-]/g, ""))}
              placeholder="98765 43210"
              className={`h-[46px] min-w-0 flex-1 rounded-[8px] border-[1.5px] px-4 text-sm outline-none focus:border-[#A97659] ${
                fieldErrors.customerPhone ? "border-red-400 bg-red-50/40" : "border-[#EBD6C8]"
              }`}
            />
          </div>
          {fieldErrors.customerPhone ? (
            <p className="mt-1.5 text-[11px] font-bold text-red-500">{fieldErrors.customerPhone}</p>
          ) : null}
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[#6B5E53]">
            Email Address <span className="font-medium normal-case tracking-normal text-[#6B5E53]">(Optional)</span>
          </label>
          <input
            type="email"
            value={customerEmail}
            onChange={(e) => onCustomerEmail(e.target.value)}
            placeholder="you@example.com"
            className={`h-[46px] w-full rounded-[8px] border-[1.5px] px-4 text-sm outline-none focus:border-[#A97659] ${
              fieldErrors.customerEmail ? "border-red-400 bg-red-50/40" : "border-[#EBD6C8]"
            }`}
          />
          {fieldErrors.customerEmail ? (
            <p className="mt-1.5 text-[11px] font-bold text-red-500">{fieldErrors.customerEmail}</p>
          ) : null}
        </div>

        <div className="flex min-h-[72px] items-start gap-3 rounded-[10px] border border-[#EBD6C8] bg-[#F9EFE4] px-4 py-3">
          <ShieldCheck size={22} className="mt-0.5 shrink-0 text-[#A97659]" />
          <p className="text-[12px] leading-[17px] text-[#6B5E53]">
            You&apos;ll receive a preview before printing, with unlimited revisions to get your portrait just right.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onAddToCart}
        className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[10px] bg-[#A97659] text-base font-semibold uppercase text-white transition-all hover:bg-[#966c55] active:scale-[0.98]"
      >
        ADD TO CART <ArrowRight size={18} />
      </button>

      <div className="grid grid-cols-3 gap-2 px-1">
        {[
          { icon: <Eye size={18} />, label: "Preview before printing" },
          { icon: <Truck size={18} />, label: "Free shipping across India" },
          { icon: <Paintbrush size={18} />, label: "Hand-drawn with love" },
        ].map((item) => (
          <div key={item.label} className="flex flex-col items-center gap-1.5 text-center">
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#E8D6C8] text-[#A97659]">
              {item.icon}
            </span>
            <span className="text-[11px] font-medium leading-tight text-[#6B5E53]">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
