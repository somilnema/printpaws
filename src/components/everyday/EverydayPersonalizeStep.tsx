"use client";

import Image from "next/image";
import { Check, ArrowRight, ArrowLeft, Zap } from "lucide-react";
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
      className={`relative inline-flex h-7 w-12 min-h-[44px] min-w-[44px] items-center justify-center`}
    >
      <span className={`relative block h-7 w-12 rounded-full ${on ? "bg-[#A97659]" : "bg-[#E3DDD7]"}`}>
        <span
          className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${
            on ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>
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
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <button
          type="button"
          onClick={onBack}
          className="flex min-h-[44px] items-center gap-1 text-xs font-bold text-[#77716C] hover:text-[#292522] transition-colors uppercase"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <span className="text-base font-semibold text-[#292522]">Personalize Your Portrait</span>
      </div>

      {portraitStyle === "framed" ? (
        <div className="space-y-3">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#77716C]">
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
                  className={`group relative flex min-h-[44px] items-center justify-center p-3.5 rounded-[10px] border-[2px] transition-all text-center ${
                    selected
                      ? "border-[#A97659] shadow-md bg-white z-10"
                      : "border-[#E3DDD7] hover:border-gray-300 bg-white"
                  }`}
                >
                  <span className="font-bold text-[#292522] text-sm">{frame.label}</span>
                  {selected ? (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#A97659] flex items-center justify-center">
                      <Check size={10} className="text-white" strokeWidth={3} />
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#77716C]">
          Background
        </label>
        <div className="grid grid-cols-3 gap-2">
          {backgrounds.map((bg) => {
            const selected = selectedBg === bg.name;
            const limited = Boolean(bg.limited || isLimitedEditionBackground(bg.name));
            return (
              <button
                key={bg.name}
                type="button"
                onClick={() => onBg(bg.name)}
                className={`relative flex flex-col items-stretch gap-1.5 rounded-[10px] border-[2px] p-1.5 text-left transition-all ${
                  selected ? "border-[#A97659] shadow-md" : "border-transparent"
                }`}
              >
                <span
                  className="relative block aspect-square w-full overflow-hidden rounded-[8px]"
                  style={{
                    backgroundColor: bg.isImage ? undefined : bg.value,
                    backgroundImage: bg.isImage ? `url(${bg.value})` : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {bg.isImage ? (
                    <Image src={bg.value} alt="" fill sizes="120px" className="object-cover" />
                  ) : null}
                  {selected ? (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/10">
                      <Check
                        size={18}
                        className={bg.name === "Black" ? "text-white" : "text-[#292522]"}
                        strokeWidth={3}
                      />
                    </span>
                  ) : null}
                  {limited ? (
                    <span className="absolute left-1 top-1 rounded bg-[#A97659] px-1 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white">
                      Limited
                    </span>
                  ) : null}
                </span>
                <span className="px-0.5 text-[10px] font-semibold leading-tight text-[#292522] truncate">
                  {bg.label || bg.name}
                </span>
                {limited ? (
                  <span className="px-0.5 text-[10px] font-bold text-[#A97659]">
                    +{formatRupee(catalog.premiumBackground)}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3 rounded-[10px] border border-[#E3DDD7] bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#292522]">Pet name</p>
            <p className="text-[12px] text-[#77716C] leading-[17px]">Optional — shown on your portrait</p>
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
              onChange={(e) => onPetName(e.target.value)}
              placeholder="Enter your pet’s name"
              className={`w-full rounded-[8px] border-[1.5px] px-4 py-3 text-sm outline-none focus:border-[#A97659] ${
                fieldErrors.petName ? "border-red-400 bg-red-50/40" : "border-[#E3DDD7]"
              }`}
            />
            {fieldErrors.petName ? (
              <p className="mt-1.5 text-[11px] font-bold text-red-500">{fieldErrors.petName}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="space-y-3 rounded-[10px] border border-[#E3DDD7] bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#292522]">Subtitle</p>
            <p className="text-[12px] text-[#77716C] leading-[17px]">Optional nickname or short message</p>
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
              placeholder="Enter a nickname or short message"
              className={`w-full rounded-[8px] border-[1.5px] px-4 py-3 text-sm outline-none focus:border-[#A97659] ${
                fieldErrors.subtitle ? "border-red-400 bg-red-50/40" : "border-[#E3DDD7]"
              }`}
            />
            <div className="mt-1.5 flex items-center justify-between">
              {fieldErrors.subtitle ? (
                <p className="text-[11px] font-bold text-red-500">{fieldErrors.subtitle}</p>
              ) : (
                <p className="text-[12px] text-[#77716C]">e.g. Our Little Sunshine</p>
              )}
              <span className="text-[12px] text-[#77716C]">
                {subtitle.length}/{subtitleMax}
              </span>
            </div>
          </div>
        ) : null}
      </div>

      <div className="space-y-3 rounded-[10px] border border-[#E3DDD7] bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1 pr-2">
            <div className="flex items-center gap-1.5">
              <Zap size={16} className="text-[#A97659] shrink-0" />
              <p className="text-sm font-semibold text-[#292522]">Priority Preview</p>
            </div>
            <p className="mt-1 text-[12px] leading-[17px] text-[#77716C]">
              Get your first portrait preview within 6 working hours.
            </p>
            <p className="mt-1 text-[12px] font-bold text-[#A97659]">
              +{formatRupee(catalog.priorityPreview)}
            </p>
          </div>
          <Toggle
            on={priorityPreview}
            onToggle={() => onPriorityPreview(!priorityPreview)}
            label="Priority Preview"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="mt-2 flex h-[52px] w-full items-center justify-center gap-2 rounded-[9px] bg-[#A97659] text-sm font-bold uppercase tracking-widest text-white shadow-md transition-all hover:bg-[#966c55] active:scale-[0.98]"
      >
        CONTINUE <ArrowRight size={18} />
      </button>
    </div>
  );
}
