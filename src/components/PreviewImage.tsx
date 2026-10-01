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
