"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { Crown, Info, Zap } from "lucide-react";
import type { PriceCatalog, PortraitStyle } from "@/lib/pricing";
import { formatRupee } from "@/lib/pricing";
import { fill, numberedHeading, type EverydayContent } from "@/lib/everyday-content";
import { backgroundTileSlot } from "@/lib/backgrounds";
import { useUploadedMedia } from "@/components/SiteMedia";
import { CornerMark, PrimaryButton, SectionHeading, StepIntro, Toggle } from "@/components/everyday/ui";

export type EverydayBg = {
  id: string;
  label: string;
  value: string;
  isImage?: boolean;
  limited?: boolean;
};

export type EverydayFrameOption = { id: string; label: string; color: string };

type Props = {
  content: EverydayContent;
  catalog: PriceCatalog;
  portraitStyle: PortraitStyle;
  frames: EverydayFrameOption[];
  selectedFrame: string;
  onFrame: (frame: string) => void;
  backgrounds: EverydayBg[];
  selectedBg: string;
  onBg: (id: string) => void;
  includePetName: boolean;
  onIncludePetName: (v: boolean) => void;
  petName: string;
  onPetName: (v: string) => void;
  includeSubtitle: boolean;
  onIncludeSubtitle: (v: boolean) => void;
  subtitle: string;
  onSubtitle: (v: string) => void;
  priorityPreview: boolean;
  onPriorityPreview: (v: boolean) => void;
  onContinue: () => void;
  /** Media slot prefix for the background tiles ("multi-pet", "you-pet"). Everyday when omitted. */
  mediaPrefix?: string;
  /** Number the visible sections 1, 2, 3… (Canvas hides frame colour, so Background becomes 1). */
  renumber?: boolean;
  /** Replaces the single pet-name field (per-pet names, or names for the chosen composition). */
  renderNames?: (heading: string) => ReactNode;
  /** Extra section after the subtitle, e.g. Multi-Pet's Special Tribute. */
  extraSection?: { heading: string; render: (heading: string) => ReactNode };
};

function BackgroundTile({
  bg,
  selected,
  onSelect,
  prefix,
}: {
  bg: EverydayBg;
  selected: boolean;
  onSelect: () => void;
  prefix: string;
}) {
  const tile = useUploadedMedia(backgroundTileSlot(bg.id, prefix));
  const src = tile || (bg.isImage ? bg.value : "");
  return (
    <button type="button" onClick={onSelect} aria-pressed={selected} className="flex flex-col items-stretch gap-2 text-center">
      <span
        className={`relative block aspect-square w-full overflow-hidden rounded-[12px] border-2 transition-colors ${
          selected ? "border-[#A97659]" : "border-[#E8D6C8] hover:border-[#D9C3B2]"
        }`}
        style={src ? undefined : { backgroundColor: bg.value }}
      >
        {src ? <Image src={src} alt="" fill sizes="108px" className="object-cover" /> : null}
        {selected ? <CornerMark selected size={22} className="absolute right-1.5 top-1.5" /> : null}
      </span>
      <span className="truncate px-0.5 text-[14px] font-medium leading-tight text-[#2D2D2D]">{bg.label}</span>
    </button>
  );
}

/** Heading + optional tag + description with a switch; the body shows only while it is on. */
export function ToggleSection({
  heading,
  optionalLabel,
  description,
  on,
  onToggle,
  toggleLabel,
  aside,
  children,
}: {
  heading: string;
  optionalLabel: string;
  description: string;
  on: boolean;
  onToggle: () => void;
  toggleLabel: string;
  aside?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-inter! text-[16px] font-semibold! leading-tight text-[#2D2D2D]">
            {heading}
            {optionalLabel ? <span className="font-normal text-[#6B5E53]"> {optionalLabel}</span> : null}
            {aside ? <span className="ml-1.5 font-bold text-[#A97659]">{aside}</span> : null}
          </h3>
          {description ? <p className="mt-1 text-[14px] leading-snug text-[#6B5E53]">{description}</p> : null}
        </div>
        <Toggle on={on} onToggle={onToggle} label={toggleLabel} />
      </div>
      {on ? children : null}
    </div>
  );
}

/** Text box with the live "4/30" counter used by every configurator text field. */
export function CountedInput({
  value,
  onValue,
  placeholder,
  max,
  label,
  id,
}: {
  value: string;
  onValue: (v: string) => void;
  placeholder: string;
  max: number;
  label?: string;
  id?: string;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        value={value}
        maxLength={max}
        aria-label={label}
        onChange={(e) => onValue(e.target.value.slice(0, max))}
        placeholder={placeholder}
        className="h-[46px] w-full rounded-[10px] border border-[#EBD6C8] bg-white pl-4 pr-16 text-[16px] text-[#2D2D2D] outline-none transition-colors placeholder:text-[#B0A29A] focus:border-[#A97659]"
      />
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[14px] text-[#8B8B7D]">
        {value.length}/{max}
      </span>
    </div>
  );
}

function TextOption({
  heading,
  optionalLabel,
  description,
  on,
  onToggle,
  toggleLabel,
  value,
  onValue,
  placeholder,
  max,
}: {
  heading: string;
  optionalLabel: string;
  description: string;
  on: boolean;
  onToggle: () => void;
  toggleLabel: string;
  value: string;
  onValue: (v: string) => void;
  placeholder: string;
  max: number;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-inter! text-[16px] font-semibold! leading-tight text-[#2D2D2D]">
            {heading}
            {optionalLabel ? <span className="font-normal text-[#6B5E53]"> {optionalLabel}</span> : null}
          </h3>
          {description ? <p className="mt-1 text-[14px] leading-snug text-[#6B5E53]">{description}</p> : null}
        </div>
        <Toggle on={on} onToggle={onToggle} label={toggleLabel} />
      </div>
      {on ? (
        <div>
          <div className="relative">
            <input
              type="text"
              value={value}
              maxLength={max}
              onChange={(e) => onValue(e.target.value.slice(0, max))}
              placeholder={placeholder}
              className="h-[46px] w-full rounded-[10px] border border-[#EBD6C8] bg-white pl-4 pr-16 text-[16px] text-[#2D2D2D] outline-none transition-colors placeholder:text-[#B0A29A] focus:border-[#A97659]"
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[14px] text-[#8B8B7D]">
              {value.length}/{max}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function EverydayPersonalizeStep({
  content,
  catalog,
  portraitStyle,
  frames,
  selectedFrame,
  onFrame,
  backgrounds,
  selectedBg,
  onBg,
  includePetName,
  onIncludePetName,
  petName,
  onPetName,
  includeSubtitle,
  onIncludeSubtitle,
  subtitle,
  onSubtitle,
  priorityPreview,
  onPriorityPreview,
  onContinue,
  mediaPrefix = "everyday",
  renumber = false,
  renderNames,
  extraSection,
}: Props) {
  const copy = content.step2;
  // Visible sections numbered in order when asked; otherwise the admin's headings are shown as typed.
  let sectionNumber = 0;
  const heading = (text: string) => {
    sectionNumber += 1;
    return renumber ? numberedHeading(text, sectionNumber) : text;
  };
  const [showInfo, setShowInfo] = useState(false);
  const standard = backgrounds.filter((bg) => !bg.limited);
  const limited = backgrounds.filter((bg) => bg.limited);
  const premium = formatRupee(catalog.premiumBackground);

  return (
    <div className="space-y-6">
      <StepIntro title={copy.title} description={copy.description} />

      {portraitStyle === "framed" && copy.showFrameColor && frames.length > 0 ? (
        <div className="space-y-3">
          <SectionHeading>{heading(copy.frameHeading)}</SectionHeading>
          <div className="grid grid-cols-2 gap-3">
            {frames.map((frame) => {
              const selected = selectedFrame === frame.id;
              return (
                <button
                  key={frame.id}
                  type="button"
                  onClick={() => onFrame(frame.id)}
                  aria-pressed={selected}
                  className={`relative flex h-12 items-center gap-2 rounded-[10px] bg-white pl-2.5 pr-8 text-left transition-all min-[375px]:gap-2.5 min-[375px]:pl-3 min-[375px]:pr-9 ${
                    selected
                      ? "border border-[#A97659] shadow-[0_0_0_1px_#A97659]"
                      : "border border-[#E8D6C8] hover:border-[#C9B9A8]"
                  }`}
                >
                  <span
                    aria-hidden
                    className="h-5 w-5 shrink-0 rounded-[4px] border-[3px] border-[#D9CDB8]"
                    style={{ borderColor: frame.color === "#FFFFFF" ? "#E3D9CF" : frame.color }}
                  />
                  <span className="truncate text-[13px] font-medium text-[#2D2D2D] min-[375px]:text-[14px]">{frame.label}</span>
                  <CornerMark selected={selected} size={20} className="absolute right-2.5 top-1/2 -translate-y-1/2" />
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {standard.length > 0 ? (
        <div className="space-y-3">
          <SectionHeading
            aside={
              limited.length > 0 && copy.premiumHint ? (
                <span className="flex shrink-0 items-center gap-1.5 text-[14px] font-medium text-[#A97659]">
                  <Crown size={16} className="fill-[#C9962B] text-[#C9962B]" />
                  {fill(copy.premiumHint, { price: premium })}
                </span>
              ) : null
            }
          >
            {heading(copy.backgroundHeading)}
          </SectionHeading>
          <div className="grid grid-cols-3 gap-3">
            {standard.map((bg) => (
              <BackgroundTile
                key={bg.id}
                bg={bg}
                prefix={mediaPrefix}
                selected={selectedBg === bg.id}
                onSelect={() => onBg(bg.id)}
              />
            ))}
          </div>
        </div>
      ) : null}

      {limited.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-[10px] bg-[#FAF4EC] px-3 py-2.5">
            <Crown size={18} className="shrink-0 fill-[#C9962B] text-[#C9962B]" />
            <h3 className="min-w-0 font-inter! text-[16px] font-semibold! leading-tight text-[#2D2D2D]">
              {copy.limitedHeading}
            </h3>
            <span className="ml-1 shrink-0 text-[16px] font-bold text-[#A97659]">{fill(copy.limitedPrice, { price: premium })}</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {limited.map((bg) => (
              <BackgroundTile
                key={bg.id}
                bg={bg}
                prefix={mediaPrefix}
                selected={selectedBg === bg.id}
                onSelect={() => onBg(bg.id)}
              />
            ))}
          </div>
        </div>
      ) : null}

      {renderNames ? (
        renderNames(heading(copy.petNameHeading))
      ) : (
        <TextOption
          heading={heading(copy.petNameHeading)}
          optionalLabel={copy.optionalLabel}
          description={copy.petNameDescription}
          on={includePetName}
          onToggle={() => onIncludePetName(!includePetName)}
          toggleLabel={copy.petNameHeading}
          value={petName}
          onValue={onPetName}
          placeholder={copy.petNamePlaceholder}
          max={copy.petNameMax}
        />
      )}

      <TextOption
        heading={heading(copy.subtitleHeading)}
        optionalLabel={copy.optionalLabel}
        description={copy.subtitleDescription}
        on={includeSubtitle}
        onToggle={() => onIncludeSubtitle(!includeSubtitle)}
        toggleLabel={copy.subtitleHeading}
        value={subtitle}
        onValue={onSubtitle}
        placeholder={copy.subtitlePlaceholder}
        max={copy.subtitleMax}
      />

      {extraSection ? extraSection.render(heading(extraSection.heading)) : null}

      {copy.showPriority ? (
        <div className="rounded-[12px] bg-[#FAF4EC] px-4 py-3">
          <div className="flex min-h-[48px] items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#A97659] text-white">
              <Zap size={18} className="fill-white" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-x-1.5 text-[16px] leading-tight">
                <span className="font-semibold text-[#2D2D2D]">{copy.priorityTitle}</span>
                <span className="font-bold text-[#A97659]">
                  {fill(copy.priorityPrice, { price: formatRupee(catalog.priorityPreview) })}
                </span>
                {copy.priorityInfo ? (
                  <button
                    type="button"
                    onClick={() => setShowInfo((v) => !v)}
                    aria-expanded={showInfo}
                    aria-label={`About ${copy.priorityTitle}`}
                    className="inline-flex h-6 w-6 items-center justify-center text-[#6B5E53]"
                  >
                    <Info size={16} />
                  </button>
                ) : null}
              </p>
              {copy.priorityDescription ? (
                <p className="mt-0.5 text-[13px] leading-snug text-[#6B5E53]">{copy.priorityDescription}</p>
              ) : null}
            </div>
            <Toggle on={priorityPreview} onToggle={() => onPriorityPreview(!priorityPreview)} label={copy.priorityTitle} />
          </div>
          {showInfo && copy.priorityInfo ? (
            <p className="mt-2 rounded-[8px] bg-white px-3 py-2 text-[13px] leading-snug text-[#6B5E53]">
              {copy.priorityInfo}
            </p>
          ) : null}
        </div>
      ) : null}

      <PrimaryButton label={copy.continueLabel} onClick={onContinue} />
    </div>
  );
}
