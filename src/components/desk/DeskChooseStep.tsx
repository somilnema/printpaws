"use client";

import { BadgeCheck, Check, Info } from "lucide-react";
import { useUploadedMedia } from "@/components/SiteMedia";
import { CornerMark, PrimaryButton, SectionHeading, StepIntro, TrustStrip } from "@/components/everyday/ui";
import { deskLayout, deskPetsLabel, fill, type DeskPets, type EverydayContent } from "@/lib/everyday-content";
import { deskExtraPetAmount, formatRupee, type PriceCatalog } from "@/lib/pricing";

const PET_ID: Record<DeskPets, "one" | "two" | "three"> = { 1: "one", 2: "two", 3: "three" };

const PET_FALLBACK: Record<DeskPets, string> = {
  1: "/no-of-pets/one-pet.png",
  2: "/no-of-pets/two-pet.png",
  3: "/no-of-pets/three-pet.png",
};

function PetsArt({ prefix, pets, alt }: { prefix: string; pets: DeskPets; alt: string }) {
  // Admin photo for this count (Media → Desk Portrait configurator); otherwise the shared pet-count art.
  const photo = useUploadedMedia(`${prefix}-pets-${pets}`);
  return <img src={photo || PET_FALLBACK[pets]} alt={alt} className="h-full w-full object-cover" />;
}

/** Desk Portrait step 1: how many pets. The layout follows automatically (1 vertical, 2–3 horizontal). */
export function DeskChooseStep({
  content,
  catalog,
  mediaPrefix,
  petCount,
  onPetCount,
  onContinue,
}: {
  content: EverydayContent;
  catalog: PriceCatalog;
  mediaPrefix: string;
  petCount: DeskPets;
  onPetCount: (n: DeskPets) => void;
  onContinue: () => void;
}) {
  const copy = content.step1;
  const desk = content.desk;
  if (!desk) return null;

  const options = ([1, 2, 3] as DeskPets[]).filter(
    (n) => n === 1 || (n === 2 ? desk.showTwoPets : desk.showThreePets)
  );
  const points = desk.infoPoints.filter((point) => point.trim());

  return (
    <div className="space-y-6">
      <StepIntro title={copy.title} description={copy.description} />

      <div className="space-y-3">
        <SectionHeading>{desk.petsHeading}</SectionHeading>
        <div
          className="grid gap-2.5 min-[375px]:gap-3"
          role="radiogroup"
          aria-label={desk.petsHeading || "Number of pets"}
          style={{ gridTemplateColumns: `repeat(${Math.max(options.length, 1)}, minmax(0, 1fr))` }}
        >
          {options.map((n) => {
            const selected = petCount === n;
            const label = deskPetsLabel(content, n);
            const layout = deskLayout(n) === "vertical" ? desk.verticalLabel : desk.horizontalLabel;
            const extra = Math.max(0, deskExtraPetAmount(catalog, PET_ID[n]));
            const chip = extra > 0 && desk.extraPriceLabel ? fill(desk.extraPriceLabel, { price: formatRupee(extra) }) : "";
            return (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onPetCount(n)}
                className={`relative flex min-w-0 flex-col overflow-hidden rounded-[12px] bg-[#FEFAF6] p-1 text-center transition-all ${
                  selected ? "border border-[#A97659] shadow-[0_0_0_1px_#A97659]" : "border border-[#E3DCD5] hover:border-[#C9B9A8]"
                }`}
              >
                <span className="relative block aspect-[4/3] w-full overflow-hidden rounded-[9px] bg-[#F1E7DC]">
                  <PetsArt prefix={mediaPrefix} pets={n} alt={label} />
                  <CornerMark selected={selected} size={20} className="absolute right-1.5 top-1.5" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col items-center gap-1 px-1 pb-2.5 pt-2.5">
                  <span className="break-words text-[15px] font-semibold leading-tight text-[#2D2D2D]">{label}</span>
                  {layout ? (
                    <span className="break-words text-[12px] leading-[1.3] text-[#6B5E53]">{layout}</span>
                  ) : null}
                  {chip ? (
                    <span className="mt-auto pt-1">
                      <span className="inline-flex min-h-[22px] items-center rounded-full bg-[#F9EFE4] px-2 text-[12px] font-semibold leading-tight text-[#A97659]">
                        {chip}
                      </span>
                    </span>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
        {desk.standIncludedLabel ? (
          <span className="inline-flex min-h-[28px] items-center gap-1.5 rounded-full bg-[#E8F3E8] px-3 text-[13px] font-semibold text-[#2E7D32]">
            <BadgeCheck size={16} strokeWidth={2} />
            {desk.standIncludedLabel}
          </span>
        ) : null}
      </div>

      {desk.infoTitle || points.length ? (
        <div className="space-y-2.5 rounded-[12px] bg-[#FAF4EC] px-4 py-3.5">
          {desk.infoTitle ? (
            <p className="flex items-center gap-2 text-[15px] font-semibold leading-tight text-[#2D2D2D]">
              <Info size={18} className="shrink-0 text-[#A97659]" />
              {desk.infoTitle}
            </p>
          ) : null}
          {points.length ? (
            <ul className="space-y-2">
              {points.map((point, index) => (
                <li key={index} className="flex items-start gap-2 text-[13px] leading-snug text-[#6B5E53]">
                  <Check size={15} strokeWidth={2.5} className="mt-0.5 shrink-0 text-[#A97659]" />
                  <span className="min-w-0 break-words">{point}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <PrimaryButton label={copy.continueLabel} onClick={onContinue} />

      {copy.showTrust ? <TrustStrip items={content.trustStep1} /> : null}
    </div>
  );
}
