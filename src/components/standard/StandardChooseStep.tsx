"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { Eye, PawPrint, User } from "lucide-react";
import {
  formatRupee,
  isOptionSelectable,
  isOptionVisible,
  parseSize,
  PORTRAIT_STYLE_LABELS,
  sizeOptionMeta,
  sizesForStyle,
  type OptionMeta,
  type PortraitStyle,
  type PriceCatalog,
} from "@/lib/pricing";
import { useMedia, useUploadedMedia } from "@/components/SiteMedia";
import {
  CornerMark,
  PrimaryButton,
  SectionHeading,
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

export type StandardPetOption = { id: string; label: string; image: string };

type Props = {
  catalog: PriceCatalog;
  portraitStyle: PortraitStyle;
  onStyle: (style: PortraitStyle) => void;
  selectedSize: string;
  onSize: (size: string) => void;
  selectedPets: string;
  onPets: (pets: string) => void;
  petOptions: readonly StandardPetOption[];
  /** Admin → Media "Human + Pet" photo. A person + paw glyph until one is uploaded. */
  humanPetImage?: string;
  onPreview: () => void;
  onContinue: () => void;
  footer?: ReactNode;
};

const STYLE_FALLBACK: Record<PortraitStyle, string> = {
  framed: "/framestyle/everyday-style-framed.jpg",
  canvas: "/framestyle/everyday-style-canvas.jpg",
};

const STYLE_COPY: Record<PortraitStyle, { tagline: string }> = {
  framed: { tagline: "A ready-to-hang framed portrait for your home." },
  canvas: { tagline: "Gallery-wrapped canvas with a premium finish." },
};

/** Same border treatment as the Everyday configurator: hairline border, brown ring when chosen. */
export function tileBorder(selectable: boolean, selected: boolean) {
  if (!selectable) return "border border-[#E8D6C8] opacity-60";
  return selected ? "border border-[#A97659] shadow-[0_0_0_1px_#A97659]" : "border border-[#E8D6C8] hover:border-[#C9B9A8]";
}

function styleCardBorder(selectable: boolean, selected: boolean) {
  if (!selectable) return "border border-[#E3DCD5] opacity-60";
  return selected ? "border border-[#A97659] shadow-[0_0_0_1px_#A97659]" : "border border-[#E3DCD5] hover:border-[#C9B9A8]";
}

/** '12"x16"' → "12 × 16" */
function sizeLabel(size: string) {
  return size.replace(/"/g, "").replace(/\s*x\s*/i, " × ");
}

function sizeDims(size: string) {
  return parseSize(size) || { w: 4, h: 5 };
}

function PriceChip({ included, label }: { included: boolean; label: string }) {
  return (
    <span
      className={`inline-flex min-h-[20px] items-center rounded-full px-2 text-[11px] font-semibold leading-tight sm:min-h-[22px] sm:px-2.5 sm:text-[12px] ${
        included ? "bg-[#E8F3E8] text-[#2E7D32]" : "bg-[#F9EFE4] text-gray-500"
      }`}
    >
      {label}
    </span>
  );
}

/** Admin badge (e.g. "🔥 Best Seller") centred on a tile's top border. Long text wraps instead of being cut off. */
function TopBadge({ meta }: { meta?: OptionMeta }) {
  if (!meta?.badge) return null;
  return (
    <span className="absolute left-1/2 top-0 w-max max-w-[calc(100%+4px)] -translate-x-1/2 -translate-y-1/2 rounded-[8px] bg-[#A97659] px-1.5 py-0.5 text-center text-[8px] font-bold uppercase leading-[1.25] tracking-wide text-white sm:max-w-[calc(100%+6px)] sm:rounded-[10px] sm:px-2 sm:text-[9px]">
      {meta.badge}
    </span>
  );
}

/**
 * Step 1 of the standard flow (Memorial Portrait) in the Everyday box feel: tall style cards with a
 * Preview on each, equal-width size tiles, and centred pet-count boxes with Included / upgrade chips.
 */
export function StandardChooseStep({
  catalog,
  portraitStyle,
  onStyle,
  selectedSize,
  onSize,
  selectedPets,
  onPets,
  petOptions,
  humanPetImage,
  onPreview,
  onContinue,
  footer,
}: Props) {
  const media = useMedia();
  const framedPhoto = useUploadedMedia("everyday-style-framed");
  const canvasPhoto = useUploadedMedia("everyday-style-canvas");
  const styleImage = (style: PortraitStyle) =>
    (style === "framed" ? framedPhoto : canvasPhoto) || media(STYLE_FALLBACK[style]);

  const styles = (["framed", "canvas"] as const).filter((style) => isOptionVisible(catalog.options.styles[style]));

  const petsExtra = catalog.pets[selectedPets] ?? 0;
  const sizes = sizesForStyle(portraitStyle, catalog)
    .map((size) => ({
      size,
      meta: sizeOptionMeta(catalog, portraitStyle, size),
      price: ((portraitStyle === "framed" ? catalog.framed : catalog.canvas)[size] ?? 0) + petsExtra,
    }))
    .filter((row) => isOptionVisible(row.meta));
  const anySizeBadge = sizes.some((row) => row.meta?.badge);
  // The outline icon grows with the real print height, so the largest size reads as the largest.
  const tallest = Math.max(...sizes.map((row) => sizeDims(row.size).h), 1);

  const pets = petOptions.filter((pet) => isOptionVisible(catalog.options.pets[pet.id]));
  const anyPetBadge = pets.some((pet) => catalog.options.pets[pet.id]?.badge);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* 1. Portrait style — tall Everyday-style boxes with Preview on each card */}
      <div className="space-y-2.5 sm:space-y-3">
        <SectionHeading>1. Choose Your Portrait Style</SectionHeading>
        <div className={styleGridClass} role="radiogroup" aria-label="Portrait style">
          {styles.map((style) => {
            const meta = catalog.options.styles[style];
            const selectable = isOptionSelectable(meta);
            const selected = portraitStyle === style;
            const title = PORTRAIT_STYLE_LABELS[style];
            return (
              <div
                key={style}
                className={`${styleCardShellClass} ${styleCardBorder(selectable, selected)}`}
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={!selectable}
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
                      {selectable ? STYLE_COPY[style].tagline : "Temporarily unavailable"}
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
                    Preview
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Size — equal-width centred boxes */}
      <div className="space-y-2.5 sm:space-y-3">
        <SectionHeading>2. Choose Your Size</SectionHeading>
        <div
          className={`grid ${optionGridGapClass} ${anySizeBadge ? "pt-2.5 sm:pt-3" : "pt-1"}`}
          style={{ gridTemplateColumns: `repeat(${Math.max(sizes.length, 1)}, minmax(0, 1fr))` }}
          role="radiogroup"
          aria-label="Size"
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
                role="radio"
                aria-checked={selected}
                disabled={!selectable}
                onClick={() => selectable && onSize(size)}
                className={`${optionTileClass} ${tileBorder(selectable, selected)}`}
              >
                {selectable ? (
                  <CornerMark selected={selected} size={18} className={`absolute right-1 ${anySizeBadge ? "top-4" : "top-1"} sm:right-1.5 ${anySizeBadge ? "sm:top-5" : "sm:top-1.5"}`} />
                ) : null}
                <TopBadge meta={meta} />
                <span className="flex h-[40px] items-end justify-center sm:h-[50px]" aria-hidden>
                  <span
                    className="block rounded-[1px] border-[1.5px] border-[#2D2D2D] bg-white"
                    style={{ width: iconW, height: iconH }}
                  />
                </span>
                <span className={`mt-2 sm:mt-3 ${optionLabelClass}`}>{sizeLabel(size)}</span>
                <span className={optionPriceClass}>
                  {selectable ? formatRupee(price) : "Out of Stock"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Number of pets — centred selection boxes with Included / upgrade chips */}
      {pets.length ? (
        <div className="space-y-2.5 sm:space-y-3">
          <SectionHeading>3. Number of Pets</SectionHeading>
          <div
            className={`grid grid-cols-2 ${optionGridGapClass} sm:grid-cols-3 ${anyPetBadge ? "pt-2.5 sm:pt-3" : ""}`}
            role="radiogroup"
            aria-label="Number of pets"
          >
            {pets.map((pet) => {
              const meta = catalog.options.pets[pet.id];
              const selectable = isOptionSelectable(meta);
              const selected = selectedPets === pet.id;
              const extra = catalog.pets[pet.id] ?? 0;
              const included = pet.id === "one" || !(extra > 0);
              return (
                <button
                  key={pet.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={!selectable}
                  onClick={() => selectable && onPets(pet.id)}
                  className={`${optionTileClass} gap-1 sm:gap-1.5 ${tileBorder(selectable, selected)}`}
                >
                  {selectable ? (
                    <CornerMark selected={selected} size={18} className={`absolute right-1 ${anyPetBadge ? "top-4" : "top-1"} sm:right-1.5 ${anyPetBadge ? "sm:top-5" : "sm:top-1.5"}`} />
                  ) : null}
                  <TopBadge meta={meta} />
                  <span className="relative block h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-[#F1E7DC] sm:h-12 sm:w-12">
                    {pet.id === "human" ? (
                      humanPetImage ? (
                        <img src={humanPetImage} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center gap-0.5 text-[#A97659]">
                          <User size={14} strokeWidth={2.25} className="sm:h-4 sm:w-4" />
                          <PawPrint size={12} strokeWidth={2.25} className="sm:h-3.5 sm:w-3.5" />
                        </span>
                      )
                    ) : (
                      <Image src={pet.image} alt="" fill sizes="48px" className="object-cover" />
                    )}
                  </span>
                  <span className={optionLabelClass}>{pet.label}</span>
                  {selectable ? (
                    <span className="mt-0.5">
                      <PriceChip
                        included={included}
                        label={included ? "Included" : `+${formatRupee(extra)}`}
                      />
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold leading-tight text-[#8B7B6B] sm:text-[12px]">Temporarily unavailable</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <PrimaryButton label="Continue" onClick={onContinue} />
      {footer}
    </div>
  );
}
