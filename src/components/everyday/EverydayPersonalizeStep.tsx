"use client";

import Image from "next/image";
import { Check, ArrowRight, ArrowLeft, Zap, Crown } from "lucide-react";
import type { PriceCatalog, PortraitStyle } from "@/lib/pricing";
import { formatRupee, isLimitedEditionBackground } from "@/lib/pricing";

type Bg = {
  name: string;
  value: string;
  textColor: string;
  isImage?: boolean;
  limited?: boolean;
  label?: string;
};

type Props = {
  portraitStyle: PortraitStyle;
  selectedFrame: string;
  onFrame: (frame: string) => void;
  backgrounds: Bg[];
  selectedBg: string;
  onBg: (name: string) => void;
  catalog: PriceCatalog;
  includePetName: boolean;
  onIncludePetName: (v: boolean) => void;
  petName: string;
  onPetName: (v: string) => void;
  includeSubtitle: boolean;
  onIncludeSubtitle: (v: boolean) => void;
  subtitle: string;
  onSubtitle: (v: string) => void;
  subtitleMax: number;
  priorityPreview: boolean;
  onPriorityPreview: (v: boolean) => void;
  fieldErrors: Record<string, string>;
  onBack: () => void;
  onContinue: () => void;
};

function Toggle({
  on,
  onToggle,
  label,
}: {
  on: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
      className="relative inline-flex h-6 w-11 min-h-[44px] min-w-[44px] items-center justify-center"
    >
      <span className={`relative block h-6 w-11 rounded-full ${on ? "bg-[#A97659]" : "bg-[#D9CDB8]"}`}>
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            on ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}

function BackgroundTile({
  bg,
  selected,
  onSelect,
  premiumPrice,
}: {
  bg: Bg;
  selected: boolean;
  onSelect: () => void;
  premiumPrice?: number;
}) {
  const limited = Boolean(bg.limited || isLimitedEditionBackground(bg.name));
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`relative flex flex-col items-stretch gap-1.5 rounded-[12px] border-2 p-1 text-left transition-all ${
        selected ? "border-[#A97659] shadow-sm" : "border-transparent hover:border-[#EBD6C8]"
      }`}
    >
      <span
        className="relative block aspect-square w-full overflow-hidden rounded-[10px]"
        style={{
          backgroundColor: bg.isImage ? undefined : bg.value,
          backgroundImage: bg.isImage ? `url(${bg.value})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {bg.isImage ? (
          <Image src={bg.value} alt="" fill sizes="108px" className="object-cover" />
        ) : null}
        {selected ? (
          <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#A97659] shadow-sm">
            <Check size={11} className="text-white" strokeWidth={3} />
          </span>
        ) : null}
      </span>
      <span className="px-0.5 text-[11px] font-semibold leading-tight text-[#2D2D2D] truncate">
        {bg.label || bg.name}
      </span>
      {limited && typeof premiumPrice === "number" ? (
        <span className="px-0.5 text-[10px] font-bold text-[#A97659]">+{formatRupee(premiumPrice)}</span>
      ) : null}
    </button>
  );
}

export function EverydayPersonalizeStep({
  portraitStyle,
  selectedFrame,
  onFrame,
  backgrounds,
  selectedBg,
  onBg,
  catalog,
  includePetName,
  onIncludePetName,
  petName,
  onPetName,
  includeSubtitle,
  onIncludeSubtitle,
  subtitle,
  onSubtitle,
  subtitleMax,
  priorityPreview,
  onPriorityPreview,
  fieldErrors,
  onBack,
  onContinue,
}: Props) {
  const standardBgs = backgrounds.filter((bg) => !bg.limited && !isLimitedEditionBackground(bg.name));
  const limitedBgs = backgrounds.filter((bg) => bg.limited || isLimitedEditionBackground(bg.name));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <button
          type="button"
          onClick={onBack}
          className="flex min-h-[44px] items-center gap-1 text-xs font-bold text-[#6B5E53] hover:text-[#2D2D2D] transition-colors uppercase"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <span className="text-base font-semibold text-[#2D2D2D]">Personalize Your Portrait</span>
      </div>

      <p className="text-sm leading-relaxed text-[#6B5E53]">
        Choose a background and add optional details to make it uniquely yours.
      </p>

      {portraitStyle === "framed" ? (
        <div className="space-y-3">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B5E53]">
            Frame Color
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                { id: "black", label: "Black Frame" },
                { id: "white", label: "White Frame" },
              ] as const
            ).map((frame) => {
              const selected = selectedFrame === frame.id;
              return (
                <button
                  key={frame.id}
                  type="button"
                  onClick={() => onFrame(frame.id)}
                  className={`group relative flex min-h-[44px] items-center justify-center rounded-[10px] p-3.5 text-center transition-all ${
                    selected
                      ? "border-2 border-[#A97659] bg-white shadow-sm z-10"
                      : "border border-[#E8D6C8] bg-white hover:border-[#C9B9A8]"
                  }`}
                >
                  <span className="font-bold text-[#2D2D2D] text-sm">{frame.label}</span>
                  {selected ? (
                    <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#A97659]">
                      <Check size={10} className="text-white" strokeWidth={3} />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        <label className="block text-base font-semibold text-[#2D2D2D]">Choose a Background</label>
        <div className="grid grid-cols-3 gap-3">
          {standardBgs.map((bg) => (
            <BackgroundTile
              key={bg.name}
              bg={bg}
              selected={selectedBg === bg.name}
              onSelect={() => onBg(bg.name)}
            />
          ))}
        </div>
      </div>

      {limitedBgs.length > 0 ? (
        <div className="space-y-3 rounded-[12px] border border-[#EBD6C8] bg-[#FAF4EC] p-3">
          <div className="flex items-center gap-1.5">
            <Crown size={16} className="text-[#A97659]" />
            <h3 className="text-base font-semibold text-[#2D2D2D]">
              Limited Edition Backgrounds + {formatRupee(catalog.premiumBackground)}
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {limitedBgs.map((bg) => (
              <BackgroundTile
                key={bg.name}
                bg={bg}
                selected={selectedBg === bg.name}
                onSelect={() => onBg(bg.name)}
                premiumPrice={catalog.premiumBackground}
              />
            ))}
          </div>
        </div>
      ) : null}

      <div className="space-y-3 rounded-[12px] border border-[#EBD6C8] bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#2D2D2D]">Add Your Pet&apos;s Name</p>
            <p className="text-[12px] text-[#6B5E53] leading-[17px]">Optional — shown on your portrait</p>
          </div>
          <Toggle
            on={includePetName}
            onToggle={() => onIncludePetName(!includePetName)}
            label="Include pet name"
          />
        </div>
        {includePetName ? (
          <div>
            <input
              type="text"
              value={petName}
              maxLength={20}
              onChange={(e) => onPetName(e.target.value.slice(0, 20))}
              placeholder="Enter your pet’s name"
              className={`h-[46px] w-full rounded-[8px] border-[1.5px] px-4 text-sm outline-none focus:border-[#A97659] ${
                fieldErrors.petName ? "border-red-400 bg-red-50/40" : "border-[#EBD6C8]"
              }`}
            />
            <div className="mt-1.5 flex items-center justify-between">
              {fieldErrors.petName ? (
                <p className="text-[11px] font-bold text-red-500">{fieldErrors.petName}</p>
              ) : (
                <span />
              )}
              <span className="text-[12px] text-[#6B5E53]">
                {petName.length}/20
              </span>
            </div>
          </div>
        ) : null}
      </div>

      <div className="space-y-3 rounded-[12px] border border-[#EBD6C8] bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#2D2D2D]">Add a Subtitle</p>
            <p className="text-[12px] text-[#6B5E53] leading-[17px]">Optional nickname or short message</p>
          </div>
          <Toggle
            on={includeSubtitle}
            onToggle={() => onIncludeSubtitle(!includeSubtitle)}
            label="Include subtitle"
          />
        </div>
        {includeSubtitle ? (
          <div>
            <input
              type="text"
              value={subtitle}
              maxLength={subtitleMax}
              onChange={(e) => onSubtitle(e.target.value.slice(0, subtitleMax))}
              placeholder="Our Little Sunshine"
              className={`h-[46px] w-full rounded-[8px] border-[1.5px] px-4 text-sm outline-none focus:border-[#A97659] ${
                fieldErrors.subtitle ? "border-red-400 bg-red-50/40" : "border-[#EBD6C8]"
              }`}
            />
            <div className="mt-1.5 flex items-center justify-between">
              {fieldErrors.subtitle ? (
                <p className="text-[11px] font-bold text-red-500">{fieldErrors.subtitle}</p>
              ) : (
                <p className="text-[12px] text-[#B0A29A]">e.g. Our Little Sunshine</p>
              )}
              <span className="text-[12px] text-[#6B5E53]">
                {subtitle.length}/{subtitleMax}
              </span>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex min-h-[72px] items-center justify-between gap-3 rounded-[12px] border border-[#EBD6C8] bg-[#FAF4EC] px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-white text-[#A97659]">
            <Zap size={18} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#2D2D2D]">
              Priority Preview + {formatRupee(catalog.priorityPreview)}
            </p>
            <p className="mt-0.5 text-[12px] leading-[17px] text-[#6B5E53]">
              Get your first portrait preview within 6 working hours.
            </p>
          </div>
        </div>
        <Toggle
          on={priorityPreview}
          onToggle={() => onPriorityPreview(!priorityPreview)}
          label="Priority Preview"
        />
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="mt-2 flex h-[52px] w-full items-center justify-center gap-2 rounded-[10px] bg-[#A97659] text-base font-semibold uppercase text-white transition-all hover:bg-[#966c55] active:scale-[0.98]"
      >
        CONTINUE <ArrowRight size={18} />
      </button>
    </div>
  );
}
