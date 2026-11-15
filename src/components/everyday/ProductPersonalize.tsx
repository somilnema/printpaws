"use client";

import { CountedInput, ToggleSection } from "@/components/everyday/EverydayPersonalizeStep";
import { CornerMark } from "@/components/everyday/ui";
import { fill, type EverydayContent } from "@/lib/everyday-content";
import { formatRupee } from "@/lib/pricing";
import type { Composition, FlowProduct } from "@/lib/product-order";

/** Name boxes that match the order: one per pet (Multi-Pet), or the chosen composition (You & Your Pet). */
export function NamesSection({
  product,
  content,
  heading,
  on,
  onToggle,
  names,
  onName,
  composition,
  petCount,
}: {
  product: FlowProduct;
  content: EverydayContent;
  heading: string;
  on: boolean;
  onToggle: () => void;
  names: string[];
  onName: (index: number, value: string) => void;
  composition: Composition;
  petCount: number;
}) {
  const copy = content.step2;
  const flow = content.flow;
  if (!flow) return null;

  let fields: { label: string; placeholder: string; max: number }[];
  if (product === "multi_pet") {
    fields = Array.from({ length: petCount }, (_, i) => ({
      label: fill(copy.petNamePlaceholder, { n: i + 1 }),
      placeholder: fill(copy.petNamePlaceholder, { n: i + 1 }),
      max: copy.petNameMax,
    }));
  } else if (composition === "solo") {
    fields = [
      { label: flow.soloPersonLabel, placeholder: flow.soloPersonPlaceholder, max: copy.petNameMax },
      { label: flow.soloPetLabel, placeholder: flow.soloPetPlaceholder, max: copy.petNameMax },
    ];
  } else {
    fields = [{ label: flow.familyNamesLabel, placeholder: flow.familyNamesPlaceholder, max: flow.familyNamesMax }];
  }

  return (
    <ToggleSection
      heading={heading}
      optionalLabel={copy.optionalLabel}
      description={copy.petNameDescription}
      on={on}
      onToggle={onToggle}
      toggleLabel={copy.petNameHeading}
    >
      <div className={`grid gap-3 ${product === "multi_pet" && petCount > 1 ? "sm:grid-cols-2" : ""}`}>
        {fields.map((field, index) => (
          <div key={`${product}-${composition}-${index}`} className="space-y-1.5">
            {product === "you_and_your_pet" && field.label ? (
              <label htmlFor={`names-${index}`} className="block text-[13px] font-medium text-[#6B5E53]">
                {field.label}
              </label>
            ) : null}
            <CountedInput
              id={`names-${index}`}
              label={field.label}
              value={names[index] || ""}
              onValue={(value) => onName(index, value)}
              placeholder={field.placeholder}
              max={field.max}
            />
          </div>
        ))}
      </div>
    </ToggleSection>
  );
}

/** Multi-Pet "A Special Tribute": a subtle halo above exactly one chosen pet. Never inferred from a photo. */
export function TributeSection({
  content,
  heading,
  on,
  onToggle,
  petCount,
  names,
  haloPet,
  onHaloPet,
  price,
  error,
  note,
  onNote,
  noteNeeded,
  noteError,
}: {
  content: EverydayContent;
  heading: string;
  on: boolean;
  onToggle: () => void;
  petCount: number;
  names: string[];
  haloPet: number | null;
  onHaloPet: (pet: number) => void;
  price: number;
  error?: string;
  /** How to recognise the halo pet in a group photo (asked when it has no name on the order). */
  note: string;
  onNote: (value: string) => void;
  noteNeeded: boolean;
  noteError?: string;
}) {
  const flow = content.flow;
  if (!flow) return null;
  const aside = price > 0 && flow.tributePriceLabel ? fill(flow.tributePriceLabel, { price: formatRupee(price) }) : "";

  return (
    <ToggleSection
      heading={heading}
      optionalLabel={content.step2.optionalLabel}
      description={flow.tributeDescription}
      on={on}
      onToggle={onToggle}
      toggleLabel={flow.tributeHeading}
      aside={aside}
    >
      <div className="space-y-2">
        {flow.tributeChooseLabel ? <p className="text-[14px] font-medium text-[#2D2D2D]">{flow.tributeChooseLabel}</p> : null}
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={flow.tributeChooseLabel || flow.tributeHeading}>
          {Array.from({ length: petCount }, (_, i) => {
            const pet = i + 1;
            const selected = haloPet === pet;
            const name = (names[i] || "").trim();
            return (
              <button
                key={pet}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onHaloPet(pet)}
                className={`relative flex min-h-[48px] items-center rounded-[10px] bg-white pl-3 pr-9 text-left transition-all ${
                  selected ? "border border-[#A97659] shadow-[0_0_0_1px_#A97659]" : "border border-[#E8D6C8] hover:border-[#C9B9A8]"
                }`}
              >
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-medium text-[#2D2D2D]">
                    {fill(flow.petSlotLabel, { n: pet })}
                  </span>
                  {name ? <span className="block truncate text-[12px] text-[#6B5E53]">{name}</span> : null}
                </span>
                <CornerMark selected={selected} size={20} className="absolute right-2.5 top-1/2 -translate-y-1/2" />
              </button>
            );
          })}
        </div>
        {error ? <p className="text-[12px] font-semibold text-red-500">{error}</p> : null}
        {haloPet && noteNeeded && flow.tributeNoteLabel ? (
          <div className="space-y-1.5 pt-1">
            <label htmlFor="halo-note" className="block text-[13px] font-medium text-[#6B5E53]">
              {fill(flow.tributeNoteLabel, { pet: fill(flow.petSlotLabel, { n: haloPet }) })}
            </label>
            <CountedInput
              id="halo-note"
              label={flow.tributeNoteLabel}
              value={note}
              onValue={onNote}
              placeholder={flow.tributeNotePlaceholder}
              max={80}
            />
            {noteError ? <p className="text-[12px] font-semibold text-red-500">{noteError}</p> : null}
          </div>
        ) : null}
      </div>
    </ToggleSection>
  );
}
