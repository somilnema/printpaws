"use client";

import { useState } from "react";

export function PreviewImage({
  src,
  alt,
  className = "",
  busy = false,
}: {
  src: string;
  alt: string;
  className?: string;
  busy?: boolean;
}) {
  const [loadedSrc, setLoadedSrc] = useState("");
  const ready = Boolean(src) && loadedSrc === src;

  return (
    <div className={`relative overflow-hidden bg-[#e8e6e3] ${className}`}>
      <div
        className={`absolute inset-0 animate-pulse bg-[#e4e2df] transition-opacity duration-200 ${ready ? "pointer-events-none opacity-0" : "opacity-100"}`}
        aria-hidden
      />
      {src ? (
        <img
          src={src}
          alt={alt}
          decoding="async"
          onLoad={() => setLoadedSrc(src)}
          onError={() => setLoadedSrc(src)}
          className={`h-full w-full object-cover transition-opacity duration-200 ${ready ? "opacity-100" : "opacity-0"}`}
        />
      ) : null}
      {busy ? (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute inset-y-0 w-1/2 animate-photo-shimmer bg-gradient-to-r from-transparent via-white/75 to-transparent" />
        </div>
      ) : null}
    </div>
  );
}

export function PhotoUploadBar({
  percent,
  label = "Uploading photo",
  detail,
}: {
  percent: number;
  label?: string;
  detail?: string;
}) {
  const shown = Math.min(100, Math.max(0, Math.round(percent)));
  const width = Math.min(100, Math.max(shown, 8));

  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-center justify-between text-[11px] font-bold text-[#1a1a1b]">
        <span>{label}</span>
        <span>{shown}%</span>
      </div>
      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-[#e7e5e4]"
        role="progressbar"
        aria-valuenow={shown}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className="relative h-full overflow-hidden rounded-full bg-[#A87B62] transition-[width] duration-200 ease-out"
          style={{ width: `${width}%` }}
        >
          <div className="absolute inset-y-0 w-1/2 animate-photo-shimmer bg-gradient-to-r from-transparent via-white/55 to-transparent" />
        </div>
      </div>
      {detail ? <p className="mt-1.5 text-[11px] text-[#6b7280]">{detail}</p> : null}
    </div>
  );
}
