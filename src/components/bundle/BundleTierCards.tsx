"use client";

import { Check, Gift } from "lucide-react";
import { useUploadedMedia } from "@/components/SiteMedia";
import { CornerMark, SectionHeading } from "@/components/everyday/ui";
import {
  bundleInclusionLabel,
  bundleInclusions,
  fill,
  type BundleTier,
  type EverydayContent,
} from "@/lib/everyday-content";
import { bundleTierAmount, formatRupee, type PriceCatalog } from "@/lib/pricing";

type Inclusion = ReturnType<typeof bundleInclusions>[number];

const TIERS: BundleTier[] = ["essential", "signature"];

function TierArt({ prefix, tier, alt }: { prefix: string; tier: BundleTier; alt: string }) {
  const photo = useUploadedMedia(`${prefix}-tier-${tier}`);
  if (photo) return <img src={photo} alt={alt} className="h-full w-full object-cover" />;
  return (
    <span className="flex h-full w-full items-center justify-center text-[#A97659]" aria-hidden>
      <Gift size={30} strokeWidth={1.5} />
    </span>
  );
}

/** Gift Bundle step 1: Essential or Signature. Nothing is preselected unless `tier` is already set. */
export function BundleTierCards({
  content,
  catalog,
  mediaPrefix,
  tier,
  onTier,
  error,
}: {
  content: EverydayContent;
  catalog: PriceCatalog;
  mediaPrefix: string;
  tier: BundleTier | "";
  onTier: (t: BundleTier) => void;
  error?: string;
}) {
  const bundle = content.bundle;
  if (!bundle) return null;
  const essentialItems = new Set<Inclusion>(bundleInclusions("essential"));

  const cards = TIERS.filter((id) => (id === "essential" ? bundle.essentialVisible : bundle.signatureVisible)).map((id) => {
    const title = id === "essential" ? bundle.essentialTitle : bundle.signatureTitle;
    const description = id === "essential" ? bundle.essentialDescription : bundle.signatureDescription;
    const badge = id === "essential" ? bundle.essentialBadge : bundle.signatureBadge;
    // Signature with its "Everything in Essential, plus:" line lists only what it adds.
    const all = bundleInclusions(id);
    const items = (id === "signature" && description.trim() ? all.filter((item) => !essentialItems.has(item)) : all)
      .map((item) => bundleInclusionLabel(content, item))
      .filter((label) => label.trim());
    const price = bundle.tierPriceLabel ? fill(bundle.tierPriceLabel, { price: formatRupee(bundleTierAmount(catalog, id)) }) : "";
    return { id, title, description, badge, items, price };
  });
  if (!cards.length) return null;

  return (
    <div className="space-y-3">
      <SectionHeading>{bundle.tierHeading}</SectionHeading>
      <div className="space-y-2.5 sm:space-y-3" role="radiogroup" aria-label={bundle.tierHeading || "Bundle"}>
        {cards.map((card) => {
          const selected = tier === card.id;
          return (
            <button
              key={card.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onTier(card.id)}
              className={`relative flex w-full min-w-0 items-stretch gap-2.5 rounded-[12px] p-2 text-left transition-all sm:gap-3 sm:rounded-[14px] sm:p-2.5 ${
                card.badge ? "bg-[#FFF9F2]" : "bg-[#FEFAF6]"
              } ${
                selected
                  ? "border border-[#A97659] shadow-[0_0_0_1px_#A97659]"
                  : error
                    ? "border border-red-300"
                    : "border border-[#E3DCD5] hover:border-[#C9B9A8]"
              }`}
            >
              <span className="relative block w-[76px] shrink-0 self-start overflow-hidden rounded-[8px] bg-[#F1E7DC] min-[375px]:w-[88px] sm:w-[104px] sm:rounded-[10px]">
                <span className="block aspect-square w-full">
                  <TierArt prefix={mediaPrefix} tier={card.id} alt={card.title} />
                </span>
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1 pr-7 pt-0.5 sm:gap-1.5">
                {card.badge ? (
                  <span className="w-max max-w-full rounded-full bg-[#A97659] px-2 py-0.5 text-[10px] font-bold uppercase leading-[1.3] tracking-wide text-white sm:px-2.5 sm:text-[11px]">
                    {card.badge}
                  </span>
                ) : null}
                <span className="break-words text-[14px] font-semibold leading-tight text-[#2D2D2D] sm:text-[16px]">{card.title}</span>
                {card.description ? (
                  <span className="break-words text-[12px] font-medium leading-snug text-[#6B5E53] sm:text-[13px]">{card.description}</span>
                ) : null}
                {card.items.length ? (
                  <span className="flex flex-col gap-1">
                    {card.items.map((item) => (
                      <span key={item} className="flex items-start gap-1.5 text-[12px] leading-snug text-[#2D2D2D] sm:text-[13px]">
                        <Check size={14} strokeWidth={2.5} className="mt-[3px] shrink-0 text-[#A97659]" aria-hidden />
                        <span className="min-w-0 break-words">{item}</span>
                      </span>
                    ))}
                  </span>
                ) : null}
                {card.price ? (
                  <span className="mt-auto pt-1">
                    <span className="inline-flex min-h-[20px] items-center rounded-full bg-[#F9EFE4] px-2 text-[11px] font-semibold leading-tight text-gray-500 sm:min-h-[22px] sm:px-2.5 sm:text-[12px]">
                      {card.price}
                    </span>
                  </span>
                ) : null}
              </span>
              <CornerMark selected={selected} size={20} className="absolute right-2 top-2 sm:right-2.5 sm:top-2.5" />
            </button>
          );
        })}
      </div>
      {error ? <p className="text-[12px] font-semibold text-red-500">{error}</p> : null}
    </div>
  );
}
