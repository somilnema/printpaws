"use client";

import { PawPrint, User, Users } from "lucide-react";
import { useUploadedMedia } from "@/components/SiteMedia";
import { CornerMark, SectionHeading } from "@/components/everyday/ui";
import { fill, type EverydayContent } from "@/lib/everyday-content";
import { formatRupee, isOptionSelectable, isOptionVisible, type PriceCatalog } from "@/lib/pricing";
import { MULTI_PET_COUNTS, petCountNumber, type Composition } from "@/lib/product-order";

function PriceChip({ included, label }: { included: boolean; label: string }) {
  if (!label) return null;
  return (
    <span
      className={`inline-flex min-h-[22px] items-center rounded-full px-2.5 text-[12px] font-semibold leading-tight ${
        included ? "bg-[#E8F3E8] text-[#2E7D32]" : "bg-[#F9EFE4] text-[#A97659]"
      }`}
    >
      {label}
    </span>
  );
}

function CompositionArt({ composition }: { composition: Composition }) {
  const photo = useUploadedMedia(composition === "solo" ? "you-pet-composition-solo" : "you-pet-composition-family");
  if (photo) return <img src={photo} alt="" className="h-full w-full object-cover" />;
  return (
    <span className="flex h-full w-full items-center justify-center gap-1 text-[#A97659]">
      {composition === "solo" ? <User size={26} strokeWidth={1.75} /> : <Users size={28} strokeWidth={1.75} />}
      <PawPrint size={22} strokeWidth={1.75} />
    </span>
  );
}

/** You & Your Pet: exactly one of two compositions. No people or pet counters; the family choice is one flat upgrade. */
export function CompositionCards({
  content,
  catalog,
  composition,
  onComposition,
}: {
  content: EverydayContent;
  catalog: PriceCatalog;
  composition: Composition;
  onComposition: (next: Composition) => void;
}) {
  const flow = content.flow;
  if (!flow) return null;
  const familyPrice = Math.max(0, catalog.familyUpgrade);
  const cards: { id: Composition; title: string; description: string; price: string; included: boolean }[] = [
    { id: "solo", title: flow.soloTitle, description: flow.soloDescription, price: flow.includedLabel, included: true },
    {
      id: "family",
      title: flow.familyTitle,
      description: flow.familyDescription,
      price: familyPrice > 0 ? fill(flow.upgradeLabel, { price: formatRupee(familyPrice) }) : flow.includedLabel,
      included: familyPrice <= 0,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <SectionHeading>{flow.choiceHeading}</SectionHeading>
        {flow.choiceDescription ? <p className="text-[14px] text-[#6B5E53]">{flow.choiceDescription}</p> : null}
      </div>
      <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label={flow.choiceHeading}>
        {cards.map((card) => {
          const selected = composition === card.id;
          return (
            <button
              key={card.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onComposition(card.id)}
              className={`relative flex flex-col overflow-hidden rounded-[14px] bg-[#FEFAF6] p-1 text-center transition-all ${
                selected ? "border border-[#A97659] shadow-[0_0_0_1px_#A97659]" : "border border-[#E3DCD5] hover:border-[#C9B9A8]"
              }`}
            >
              <span className="relative block aspect-[4/3] w-full overflow-hidden rounded-[10px] bg-[#F1E7DC]">
                <CompositionArt composition={card.id} />
                <CornerMark selected={selected} size={24} className="absolute right-2 top-2" />
              </span>
              <span className="flex flex-1 flex-col items-center gap-1.5 px-1.5 pb-3 pt-3">
                <span className="text-[15px] font-semibold leading-tight text-[#2D2D2D]">{card.title}</span>
                {card.description ? <span className="text-[13px] leading-[1.4] text-[#6B5E53]">{card.description}</span> : null}
                <span className="mt-auto pt-1">
                  <PriceChip included={card.included} label={card.price} />
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Multi-Pet: compact pet-count cards. Two pets are included; the surcharge starts with the third pet. */
export function PetCountCards({
  content,
  catalog,
  selectedPets,
  onPets,
}: {
  content: EverydayContent;
  catalog: PriceCatalog;
  selectedPets: string;
  onPets: (pets: string) => void;
}) {
  const flow = content.flow;
  if (!flow) return null;
  const base = catalog.pets.two ?? 0;
  // Counts above the production maximum are hidden in Pricing, so they never show here.
  const options = MULTI_PET_COUNTS.filter((id) => isOptionVisible(catalog.options.pets[id]));
  if (!options.length) return null;

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <SectionHeading>{flow.choiceHeading}</SectionHeading>
        {flow.choiceDescription ? <p className="text-[14px] text-[#6B5E53]">{flow.choiceDescription}</p> : null}
      </div>
      <div
        className="grid gap-3"
        role="radiogroup"
        aria-label={flow.choiceHeading}
        style={{ gridTemplateColumns: `repeat(${Math.max(options.length, 1)}, minmax(0, 1fr))` }}
      >
        {options.map((id) => {
          const meta = catalog.options.pets[id];
          const selectable = isOptionSelectable(meta);
          const selected = selectedPets === id;
          const surcharge = Math.max(0, (catalog.pets[id] ?? 0) - base);
          const included = id === "two" || surcharge <= 0;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={!selectable}
              onClick={() => onPets(id)}
              className={`relative flex min-h-[104px] flex-col items-center justify-center gap-1 rounded-[10px] bg-white px-2 pb-3 pt-4 text-center transition-all disabled:cursor-not-allowed ${
                !selectable
                  ? "border border-[#E8D6C8] opacity-60"
                  : selected
                    ? "border border-[#A97659] shadow-[0_0_0_1px_#A97659]"
                    : "border border-[#E8D6C8] hover:border-[#C9B9A8]"
              }`}
            >
              {selectable ? <CornerMark selected={selected} size={20} className="absolute right-1.5 top-1.5" /> : null}
              {meta?.badge ? (
                <span className="absolute left-1/2 top-0 w-max max-w-[calc(100%+6px)] -translate-x-1/2 -translate-y-1/2 rounded-[10px] bg-[#A97659] px-2 py-0.5 text-[9px] font-bold uppercase leading-[1.25] tracking-wide text-white">
                  {meta.badge}
                </span>
              ) : null}
              <span className="text-[26px] font-bold leading-none text-[#A97659]">{petCountNumber(id)}</span>
              {flow.petsWord ? <span className="text-[14px] font-medium leading-tight text-[#2D2D2D]">{flow.petsWord}</span> : null}
              <span className="mt-1">
                {selectable ? (
                  <PriceChip
                    included={included}
                    label={included ? flow.includedLabel : fill(flow.upgradeLabel, { price: formatRupee(surcharge) })}
                  />
                ) : (
                  <span className="text-[12px] font-semibold text-[#8B7B6B]">{content.step1.outOfStockLabel}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
