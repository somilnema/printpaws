"use client";

import { Cat, ChevronDown, Dog, PawPrint } from "lucide-react";
import { CountedInput } from "@/components/everyday/EverydayPersonalizeStep";
import { SectionHeading } from "@/components/everyday/ui";
import type { EverydayContent, PetTypeId } from "@/lib/everyday-content";

const BREED_MAX = 40;

const TYPE_ICON: Record<PetTypeId, typeof Dog> = { dog: Dog, cat: Cat, other: PawPrint };

/** Gift Bundle step 3: optional pet type, breed and age for the artist. */
export function PetDetailsSection({
  content,
  ages,
  petType,
  onPetType,
  breed,
  onBreed,
  age,
  onAge,
}: {
  content: EverydayContent;
  ages: string[];
  petType: PetTypeId | "";
  onPetType: (t: PetTypeId | "") => void;
  breed: string;
  onBreed: (v: string) => void;
  age: string;
  onAge: (v: string) => void;
}) {
  const bundle = content.bundle;
  if (!bundle || !bundle.showPetDetails) return null;
  const types: { id: PetTypeId; label: string }[] = [
    { id: "dog", label: bundle.dogLabel },
    { id: "cat", label: bundle.catLabel },
    { id: "other", label: bundle.otherLabel },
  ];
  const ageOptions = ages.filter((option) => option.trim());
  const optional = content.step3.optionalLabel;

  return (
    <div className="space-y-4">
      <SectionHeading>
        {bundle.petDetailsHeading}
        {optional ? <span className="font-normal text-[#6B5E53]"> {optional}</span> : null}
      </SectionHeading>

      <div className="space-y-2">
        <p id="bundle-pet-type-label" className="text-[14px] font-medium text-[#2D2D2D]">
          {bundle.petTypeLabel}
        </p>
        <div className="grid grid-cols-3 gap-2.5" role="group" aria-labelledby="bundle-pet-type-label">
          {types.map(({ id, label }) => {
            const selected = petType === id;
            const Icon = TYPE_ICON[id];
            return (
              <button
                key={id}
                type="button"
                aria-pressed={selected}
                onClick={() => onPetType(selected ? "" : id)}
                className={`flex h-11 min-w-0 items-center justify-center gap-1.5 rounded-[10px] px-2 text-[14px] font-medium transition-all ${
                  selected
                    ? "border border-[#A97659] bg-[#F9EFE4] text-[#A97659] shadow-[0_0_0_1px_#A97659]"
                    : "border border-[#E8D6C8] bg-white text-[#2D2D2D] hover:border-[#C9B9A8]"
                }`}
              >
                <Icon size={17} strokeWidth={1.75} className="shrink-0" aria-hidden />
                <span className="min-w-0 truncate">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="bundle-pet-breed" className="block text-[14px] font-medium text-[#2D2D2D]">
          {bundle.breedLabel}
        </label>
        <CountedInput
          id="bundle-pet-breed"
          value={breed}
          onValue={onBreed}
          placeholder={bundle.breedPlaceholder}
          max={BREED_MAX}
        />
      </div>

      {ageOptions.length > 0 ? (
        <div className="space-y-2">
          <label htmlFor="bundle-pet-age" className="block text-[14px] font-medium text-[#2D2D2D]">
            {bundle.ageLabel}
          </label>
          <div className="relative">
            <select
              id="bundle-pet-age"
              value={ageOptions.includes(age) ? age : ""}
              onChange={(e) => onAge(e.target.value)}
              className={`h-[46px] w-full appearance-none rounded-[10px] border border-[#EBD6C8] bg-white pl-4 pr-10 text-[16px] outline-none transition-colors focus:border-[#A97659] ${
                age ? "text-[#2D2D2D]" : "text-[#B0A29A]"
              }`}
            >
              <option value="">{bundle.agePlaceholder}</option>
              {ageOptions.map((option) => (
                <option key={option} value={option} className="text-[#2D2D2D]">
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown
              size={18}
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B5E53]"
              aria-hidden
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
