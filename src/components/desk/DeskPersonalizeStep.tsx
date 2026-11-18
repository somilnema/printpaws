"use client";

import { CountedInput, ToggleSection } from "@/components/everyday/EverydayPersonalizeStep";
import { CornerMark, PrimaryButton, SectionHeading, StepIntro } from "@/components/everyday/ui";
import type { DeskColour, EverydayContent } from "@/lib/everyday-content";

/** Desk Portrait step 2: background colour, required pet name(s), optional subtitle. No portrait preview. */
export function DeskPersonalizeStep({
  content,
  colours,
  colour,
  onColour,
  names,
  onNames,
  namesError,
  includeSubtitle,
  onIncludeSubtitle,
  subtitle,
  onSubtitle,
  onContinue,
  continueDisabled,
}: {
  content: EverydayContent;
  colours: DeskColour[];
  colour: string;
  onColour: (id: string) => void;
  names: string;
  onNames: (v: string) => void;
  namesError?: string;
  includeSubtitle: boolean;
  onIncludeSubtitle: (on: boolean) => void;
  subtitle: string;
  onSubtitle: (v: string) => void;
  onContinue: () => void;
  continueDisabled: boolean;
}) {
  const copy = content.step2;
  const desk = content.desk;
  if (!desk) return null;
  const namesMax = Math.max(1, desk.namesMax);
  const subtitleMax = Math.max(1, desk.subtitleMax);
  const suggestions = desk.suggestions.filter((text) => text.trim());

  return (
    <div className="space-y-6">
      <StepIntro title={copy.title} description={copy.description} />

      {colours.length > 0 ? (
        <div className="space-y-3">
          <SectionHeading>{desk.colourHeading}</SectionHeading>
          <div className="grid grid-cols-3 gap-2.5 min-[375px]:gap-3" role="radiogroup" aria-label={desk.colourHeading || "Background colour"}>
            {colours.map((option) => {
              const selected = colour === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => onColour(option.id)}
                  className={`flex min-w-0 flex-col gap-2 rounded-[12px] bg-white p-1.5 text-left transition-all ${
                    selected ? "border border-[#A97659] shadow-[0_0_0_1px_#A97659]" : "border border-[#E8D6C8] hover:border-[#C9B9A8]"
                  }`}
                >
                  <span
                    aria-hidden
                    className="block aspect-[4/3] w-full rounded-[8px] border border-[#E8D6C8]"
                    style={{ backgroundColor: option.color }}
                  />
                  <span className="flex min-w-0 items-center gap-1.5 px-0.5 pb-0.5">
                    <CornerMark selected={selected} size={18} className="shrink-0" />
                    <span className="min-w-0 break-words text-[13px] font-medium leading-tight text-[#2D2D2D]">{option.label}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <SectionHeading>
          {desk.namesHeading} <span className="text-red-500">*</span>
        </SectionHeading>
        <div className="relative">
          <input
            id="desk-pet-names"
            type="text"
            value={names}
            maxLength={namesMax}
            required
            aria-label={desk.namesHeading || "Pet name(s)"}
            aria-invalid={namesError ? true : undefined}
            aria-describedby={namesError ? "desk-pet-names-error" : desk.namesHelp ? "desk-pet-names-help" : undefined}
            onChange={(e) => onNames(e.target.value.slice(0, namesMax))}
            placeholder={desk.namesPlaceholder}
            className={`h-[46px] w-full rounded-[10px] border bg-white pl-4 pr-16 text-[16px] text-[#2D2D2D] outline-none transition-colors placeholder:text-[#B0A29A] focus:border-[#A97659] ${
              namesError ? "border-red-400 bg-red-50/40" : "border-[#EBD6C8]"
            }`}
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[14px] text-[#8B8B7D]">
            {names.length}/{namesMax}
          </span>
        </div>
        {namesError ? (
          <p id="desk-pet-names-error" className="text-[12px] font-semibold text-red-500">
            {namesError}
          </p>
        ) : null}
        {desk.namesHelp ? (
          <p id="desk-pet-names-help" className="text-[13px] leading-snug text-[#6B5E53]">
            {desk.namesHelp}
          </p>
        ) : null}
      </div>

      <ToggleSection
        heading={desk.subtitleHeading}
        optionalLabel={copy.optionalLabel}
        description={copy.subtitleDescription}
        on={includeSubtitle}
        onToggle={() => onIncludeSubtitle(!includeSubtitle)}
        toggleLabel={desk.subtitleHeading || "Subtitle"}
      >
        <div className="space-y-3">
          <CountedInput
            id="desk-subtitle"
            value={subtitle}
            onValue={onSubtitle}
            placeholder={desk.subtitlePlaceholder}
            max={subtitleMax}
            label={desk.subtitleHeading}
          />
          {suggestions.length > 0 ? (
            <div className="space-y-2">
              {desk.suggestionsLabel ? (
                <p className="text-[13px] font-medium text-[#6B5E53]">{desk.suggestionsLabel}</p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                {suggestions.map((text) => {
                  const active = subtitle === text.slice(0, subtitleMax);
                  return (
                    <button
                      key={text}
                      type="button"
                      aria-pressed={active}
                      onClick={() => onSubtitle(text.slice(0, subtitleMax))}
                      className={`max-w-full rounded-full border px-3 py-1.5 text-left text-[13px] leading-tight transition-colors ${
                        active
                          ? "border-[#A97659] bg-[#F9EFE4] font-semibold text-[#A97659]"
                          : "border-[#E8D6C8] bg-white text-[#2D2D2D] hover:border-[#C9B9A8]"
                      }`}
                    >
                      {text}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </ToggleSection>

      <PrimaryButton label={copy.continueLabel} onClick={onContinue} disabled={continueDisabled} />
    </div>
  );
}
