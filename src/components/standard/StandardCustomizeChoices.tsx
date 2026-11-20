"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import { formatRupee } from "@/lib/pricing";
import type { BackgroundType } from "@/lib/backgrounds";
import { CornerMark } from "@/components/everyday/ui";
import { tileBorder } from "@/components/standard/StandardChooseStep";

// Step 2 choices of the standard flow (Memorial Portrait) in the Everyday configurator's compact look.
// Same options and events as the classic boxes; only the presentation changes.

const FRAMES = [
  { id: "black", label: "Black Frame" },
  { id: "white", label: "White Frame" },
] as const;

export function StandardFramePicker({
  frame,
  onFrame,
}: {
  frame: string;
  onFrame: (frame: (typeof FRAMES)[number]["id"]) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3" role="radiogroup" aria-label="Frame color">
      {FRAMES.map(({ id, label }) => {
        const selected = frame === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onFrame(id)}
            className={`flex min-h-11 items-center justify-center gap-2 rounded-[10px] bg-white px-2 py-2 transition-all sm:min-h-12 sm:py-2.5 ${tileBorder(true, selected)}`}
          >
            <CornerMark selected={selected} size={18} className="flex-shrink-0" />
            <span className="text-[13px] font-semibold leading-tight text-[#2D2D2D] sm:text-[14px]">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** One row of swatches on every phone (they shrink to fit), capped at 56px on wider screens. */
export function StandardBackgroundPicker({
  backgrounds,
  selected,
  onSelect,
}: {
  backgrounds: BackgroundType[];
  selected: string;
  onSelect: (name: string) => void;
}) {
  const columns = Math.max(1, Math.min(backgrounds.length, 6));
  return (
    <div
      className="grid gap-2 sm:gap-3"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 3.5rem))` }}
      role="radiogroup"
      aria-label="Background color"
    >
      {backgrounds.map((bg) => {
        const on = selected === bg.name;
        return (
          <div key={bg.name} className="flex min-w-0 flex-col items-center gap-1.5">
            <button
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={bg.label || bg.name}
              onClick={() => onSelect(bg.name)}
              className={`flex aspect-square w-full items-center justify-center overflow-hidden rounded-[10px] transition-all ${tileBorder(true, on)}`}
              style={{
                backgroundColor: bg.isImage ? undefined : bg.value,
                backgroundImage: bg.isImage ? `url(${bg.value})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {on ? <Check size={18} className={bg.name === "Black" ? "text-white" : "text-[#2D2D2D]"} strokeWidth={3} /> : null}
            </button>
            <span className="w-full text-center text-[9px] font-bold uppercase leading-tight tracking-wide text-[#6B5E53]">
              {bg.label || bg.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** Add-on tiles with the name and price always visible (the classic tile only shows the name on hover). */
export function StandardAddOnPicker({
  addOns,
  selected,
  onToggle,
  price,
}: {
  addOns: readonly { id: string; label: string; image: string }[];
  selected: string;
  onToggle: (id: string) => void;
  price: number;
}) {
  return (
    <div className="flex flex-wrap gap-2 sm:gap-3">
      {addOns.map((addon) => {
        const on = selected === addon.id;
        return (
          <button
            key={addon.id}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(addon.id)}
            className={`flex w-[6.5rem] flex-col overflow-hidden rounded-[10px] bg-white p-0.5 text-center transition-all sm:w-28 sm:rounded-[12px] sm:p-1 ${tileBorder(true, on)}`}
          >
            <span className="relative block aspect-square w-full overflow-hidden rounded-[8px] bg-[#F1E7DC] sm:rounded-[9px]">
              <Image src={addon.image} alt="" fill sizes="112px" className="object-cover" />
              <CornerMark selected={on} size={18} className="absolute right-1 top-1 sm:right-1.5 sm:top-1.5" />
            </span>
            <span className="px-1 pt-1.5 text-[11px] font-semibold leading-tight text-[#2D2D2D] sm:text-[12px]">{addon.label}</span>
            <span className="pb-1 text-[11px] font-bold leading-tight text-gray-500 sm:text-[12px]">+{formatRupee(price)}</span>
          </button>
        );
      })}
    </div>
  );
}
