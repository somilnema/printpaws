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
import {
  CornerMark,
  PrimaryButton,
  SectionHeading,
  StepIntro,
  TrustStrip,
  optionGridGapClass,
  optionLabelClass,
  optionPriceClass,
  optionTileClass,
  styleCardBodyClass,
  styleCardImageClass,
  styleCardShellClass,
  styleCardTitleClass,
  styleGridClass,
  stylePreviewClass,
} from "@/components/everyday/ui";

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
  /** Price under each size (Everyday). The Gift Bundle keeps prices out of its configurator. */
  showSizePrices?: boolean;
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
  showSizePrices = true,
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
    <div className="space-y-5 sm:space-y-6">
      <StepIntro title={copy.title} description={copy.description} />

      {beforeStyle}

      <div className="space-y-2.5 sm:space-y-3">
        <SectionHeading>{copy.styleHeading}</SectionHeading>
        <div className={styleGridClass}>
          {styles.map((style) => {
            const meta = catalog.options.styles[style];
            const selectable = isOptionSelectable(meta);
            const selected = portraitStyle === style;
            const title = style === "framed" ? copy.framedTitle : copy.canvasTitle;
            const description = style === "framed" ? copy.framedDescription : copy.canvasDescription;
            return (
              <div
                key={style}
                className={`${styleCardShellClass} ${
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
                  className="flex w-full flex-col p-0.5 text-center disabled:cursor-not-allowed sm:p-1"
                >
                  <span className={styleCardImageClass}>
                    <Image
                      src={styleImage(style)}
                      alt={title}
                      fill
                      sizes="(max-width: 640px) 50vw, 300px"
                      className="object-cover"
                    />
                    {selectable ? (
                      <CornerMark selected={selected} size={22} className="absolute right-1.5 top-1.5 sm:right-2 sm:top-2" />
                    ) : null}
                    {meta.badge ? (
                      <span className="absolute left-1.5 top-1.5 max-w-[calc(100%-2.5rem)] rounded-full bg-[#A97659] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white sm:left-2 sm:top-2 sm:px-2 sm:text-[10px]">
                        {meta.badge}
                      </span>
                    ) : null}
                  </span>
                  <span className="flex flex-col items-center gap-1 px-1 pb-2 pt-2 sm:gap-1.5 sm:pb-3 sm:pt-3">
                    <span className={styleCardTitleClass}>{title}</span>
                    <span className={styleCardBodyClass}>
                      {selectable ? description : copy.unavailableLabel}
                    </span>
                  </span>
                </button>
                <div className="mt-auto px-2 pb-2 sm:px-3 sm:pb-3">
                  <button
                    type="button"
                    onClick={onPreview}
                    className={`${stylePreviewClass} ${
                      selected && selectable ? "border-[#A97659]" : "border-[#DBD6D2]"
                    }`}
                  >
                    <Eye size={16} strokeWidth={1.75} className="sm:h-[18px] sm:w-[18px]" />
                    {copy.previewLabel}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {afterStyle}

      <div className="space-y-2.5 sm:space-y-3">
        <div className="space-y-1">
          <SectionHeading>{copy.sizeHeading}</SectionHeading>
          {copy.sizeDescription ? <p className="text-[13px] text-[#6B5E53] sm:text-[14px]">{copy.sizeDescription}</p> : null}
        </div>
        <div
          className={`grid ${optionGridGapClass} ${anyBadge ? "pt-2.5 sm:pt-3" : "pt-1"}`}
          style={{ gridTemplateColumns: `repeat(${Math.max(sizes.length, 1)}, minmax(0, 1fr))` }}
        >
          {sizes.map(({ size, meta, price }) => {
            const selectable = isOptionSelectable(meta);
            const selected = selectedSize === size;
            const { w, h } = sizeDims(size);
            const iconH = Math.round(20 + 22 * (h / tallest));
            const iconW = Math.max(8, Math.round((iconH * w) / h));
            return (
              <button
                key={size}
                type="button"
                disabled={!selectable}
                aria-pressed={selected}
                onClick={() => onSize(size)}
                className={`${optionTileClass} ${
                  !selectable
                    ? "border border-[#E8D6C8] opacity-60"
                    : selected
                      ? "border border-[#A97659] shadow-[0_0_0_1px_#A97659]"
                      : "border border-[#E8D6C8] hover:border-[#C9B9A8]"
                }`}
              >
                {selectable ? (
                  <CornerMark selected={selected} size={18} className={`absolute right-1 ${anyBadge ? "top-4" : "top-1"} sm:right-1.5 ${anyBadge ? "sm:top-5" : "sm:top-1.5"}`} />
                ) : null}
                {meta?.badge ? (
                  // Admin text of any length stays readable: it wraps instead of being cut off.
                  <span className="absolute left-1/2 top-0 w-max max-w-[calc(100%+4px)] -translate-x-1/2 -translate-y-1/2 rounded-[8px] bg-[#A97659] px-1.5 py-0.5 text-center text-[8px] font-bold uppercase leading-[1.25] tracking-wide text-white sm:max-w-[calc(100%+6px)] sm:rounded-[10px] sm:px-2 sm:text-[9px]">
                    {meta.badge}
                  </span>
                ) : null}
                <span className="flex h-[40px] items-end justify-center sm:h-[50px]" aria-hidden>
                  <span
                    className="block rounded-[1px] border-[1.5px] border-[#2D2D2D] bg-white"
                    style={{ width: iconW, height: iconH }}
                  />
                </span>
                <span className={`mt-2 sm:mt-3 ${optionLabelClass}`}>{sizeLabel(size)}</span>
                {selectable && !showSizePrices ? null : (
                  <span className={optionPriceClass}>
                    {selectable ? formatRupee(price + petsExtra) : copy.outOfStockLabel}
                  </span>
                )}
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
