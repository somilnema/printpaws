"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { Eye } from "lucide-react";
import {
  formatRupee,
  isOptionSelectable,
  isOptionVisible,
  parseSize,
  sizeOptionMeta,
  sizesForStyle,
  type PriceCatalog,
  type PortraitStyle,
} from "@/lib/pricing";
import type { EverydayContent } from "@/lib/everyday-content";
import { useMedia, useUploadedMedia } from "@/components/SiteMedia";
import { CornerMark, PrimaryButton, SectionHeading, StepIntro, TrustStrip } from "@/components/everyday/ui";

type Props = {
  content: EverydayContent;
  catalog: PriceCatalog;
  /** Pet upgrade added to every size price (always one pet here, kept for safety). */
  petsExtra: number;
  portraitStyle: PortraitStyle;
  onStyle: (style: PortraitStyle) => void;
  selectedSize: string;
  onSize: (size: string) => void;
  onPreview: () => void;
  onContinue: () => void;
  /** Keeps Continue disabled (e.g. Gift Bundle until a bundle is chosen). Everyday never sets it. */
  continueDisabled?: boolean;
  footer?: ReactNode;
  /** Media slot prefix for the style card photos ("multi-pet", "you-pet"). Everyday when omitted. */
  mediaPrefix?: string;
  /** Section shown above the style cards (You & Your Pet composition). */
  beforeStyle?: ReactNode;
  /** Section shown between the style cards and the sizes (Multi-Pet pet count). */
  afterStyle?: ReactNode;
  /** False hides a size, e.g. one Multi-Pet keeps off sale for this many pets. */
  isSizeOffered?: (size: string) => boolean;
};

const STYLE_IMAGE: Record<PortraitStyle, string> = {
  framed: "/framestyle/everyday-style-framed.jpg",
  canvas: "/framestyle/everyday-style-canvas.jpg",
};

/** '12"x16"' → "12 × 16" */
function sizeLabel(size: string) {
  return size.replace(/"/g, "").replace(/\s*x\s*/i, " × ");
}

function sizeDims(size: string) {
  return parseSize(size) || { w: 4, h: 5 };
}

export function EverydayChooseStep({
  content,
  catalog,
  petsExtra,
  portraitStyle,
  onStyle,
  selectedSize,
  onSize,
  onPreview,
  onContinue,
  continueDisabled = false,
  footer,
  mediaPrefix = "everyday",
  beforeStyle,
  afterStyle,
  isSizeOffered,
}: Props) {
  const media = useMedia();
  const copy = content.step1;
  // The product's own card photo wins; otherwise the Everyday photo (or its admin replacement).
  const framedPhoto = useUploadedMedia(`${mediaPrefix}-style-framed`);
  const canvasPhoto = useUploadedMedia(`${mediaPrefix}-style-canvas`);
  const styleImage = (style: PortraitStyle) => (style === "framed" ? framedPhoto : canvasPhoto) || media(STYLE_IMAGE[style]);

  const styles = (["framed", "canvas"] as const).filter((style) => isOptionVisible(catalog.options.styles[style]));
  const sizes = sizesForStyle(portraitStyle, catalog)
    .map((size) => ({
      size,
      meta: sizeOptionMeta(catalog, portraitStyle, size),
      price: (portraitStyle === "framed" ? catalog.framed[size] : catalog.canvas[size]) ?? 0,
    }))
    .filter((row) => isOptionVisible(row.meta) && (!isSizeOffered || isSizeOffered(row.size)));
  const anyBadge = sizes.some((row) => row.meta?.badge);

  // Outline icon grows with the real print size (40 × 50 for the largest).
  const tallest = Math.max(...sizes.map((row) => sizeDims(row.size).h), 1);

  return (
    <div className="space-y-6">
      <StepIntro title={copy.title} description={copy.description} />

      {beforeStyle}

      <div className="space-y-3">
        <SectionHeading>{copy.styleHeading}</SectionHeading>
        <div className="grid grid-cols-2 gap-3">
          {styles.map((style) => {
            const meta = catalog.options.styles[style];
            const selectable = isOptionSelectable(meta);
            const selected = portraitStyle === style;
            const title = style === "framed" ? copy.framedTitle : copy.canvasTitle;
            const description = style === "framed" ? copy.framedDescription : copy.canvasDescription;
            return (
              <div
                key={style}
                className={`relative flex flex-col overflow-hidden rounded-[14px] bg-[#FEFAF6] transition-all ${
                  !selectable
                    ? "border border-[#E3DCD5] opacity-60"
                    : selected
                      ? "border border-[#A97659] shadow-[0_0_0_1px_#A97659]"
                      : "border border-[#E3DCD5] hover:border-[#C9B9A8]"
                }`}
              >
                <button
                  type="button"
                  disabled={!selectable}
                  aria-pressed={selected}
                  onClick={() => onStyle(style)}
                  className="flex w-full flex-col p-1 text-center disabled:cursor-not-allowed"
                >
                  <span className="relative block aspect-[2/3] w-full overflow-hidden rounded-[10px] bg-[#F1E7DC]">
                    <Image
                      src={styleImage(style)}
                      alt={title}
                      fill
                      sizes="(max-width: 640px) 50vw, 300px"
                      className="object-cover"
                    />
                    {selectable ? <CornerMark selected={selected} size={28} className="absolute right-2 top-2" /> : null}
                    {meta.badge ? (
                      <span className="absolute left-2 top-2 rounded-full bg-[#A97659] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                        {meta.badge}
                      </span>
                    ) : null}
                  </span>
                  <span className="flex flex-col items-center gap-1.5 px-1 pb-3 pt-3">
                    <span className="text-[16px] font-semibold leading-tight text-[#2D2D2D]">{title}</span>
                    <span className="text-[13px] leading-[1.4] text-[#6B5E53]">
                      {selectable ? description : copy.unavailableLabel}
                    </span>
                  </span>
                </button>
                <div className="mt-auto px-3 pb-3">
                  <button
                    type="button"
                    onClick={onPreview}
                    className={`flex h-10 w-full items-center justify-center gap-2 rounded-[10px] border bg-white text-[14px] font-medium text-[#2D2D2D] transition-colors hover:bg-[#FAF7F2] ${
                      selected && selectable ? "border-[#A97659]" : "border-[#DBD6D2]"
                    }`}
                  >
                    <Eye size={18} strokeWidth={1.75} />
                    {copy.previewLabel}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {afterStyle}

      <div className="space-y-3">
        <div className="space-y-1">
          <SectionHeading>{copy.sizeHeading}</SectionHeading>
          {copy.sizeDescription ? <p className="text-[14px] text-[#6B5E53]">{copy.sizeDescription}</p> : null}
        </div>
        <div
          className={`grid gap-3 ${anyBadge ? "pt-3" : "pt-1"}`}
          style={{ gridTemplateColumns: `repeat(${Math.max(sizes.length, 1)}, minmax(0, 1fr))` }}
        >
          {sizes.map(({ size, meta, price }) => {
            const selectable = isOptionSelectable(meta);
            const selected = selectedSize === size;
            const { w, h } = sizeDims(size);
            const iconH = Math.round(24 + 26 * (h / tallest));
            const iconW = Math.round((iconH * w) / h);
            return (
              <button
                key={size}
                type="button"
                disabled={!selectable}
                aria-pressed={selected}
                onClick={() => onSize(size)}
                className={`relative flex min-h-[120px] flex-col items-center justify-center rounded-[10px] bg-white px-2 pb-3 pt-4 text-center transition-all disabled:cursor-not-allowed ${
                  !selectable
                    ? "border border-[#E8D6C8] opacity-60"
                    : selected
                      ? "border border-[#A97659] shadow-[0_0_0_1px_#A97659]"
                      : "border border-[#E8D6C8] hover:border-[#C9B9A8]"
                }`}
              >
                {selectable ? (
                  <CornerMark selected={selected} size={20} className={`absolute right-1.5 ${anyBadge ? "top-5" : "top-1.5"}`} />
                ) : null}
                {meta?.badge ? (
                  // Admin text of any length stays readable: it wraps instead of being cut off.
                  <span className="absolute left-1/2 top-0 w-max max-w-[calc(100%+6px)] -translate-x-1/2 -translate-y-1/2 rounded-[10px] bg-[#A97659] px-2 py-0.5 text-center text-[9px] font-bold uppercase leading-[1.25] tracking-wide text-white">
                    {meta.badge}
                  </span>
                ) : null}
                <span className="flex h-[50px] items-end justify-center" aria-hidden>
                  <span
                    className="block rounded-[1px] border-[1.5px] border-[#2D2D2D] bg-white"
                    style={{ width: iconW, height: iconH }}
                  />
                </span>
                <span className="mt-3 text-[15px] font-semibold leading-tight text-[#2D2D2D]">{sizeLabel(size)}</span>
                <span className="mt-1 text-[16px] font-bold text-[#A97659]">
                  {selectable ? formatRupee(price + petsExtra) : copy.outOfStockLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <PrimaryButton label={copy.continueLabel} onClick={onContinue} disabled={continueDisabled} />

      {copy.showTrust ? <TrustStrip items={content.trustStep1} /> : null}
      {footer}
    </div>
  );
}
