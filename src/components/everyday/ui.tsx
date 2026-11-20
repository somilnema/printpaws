"use client";

import type { ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Brush,
  Check,
  Clock,
  Eye,
  Gift,
  Heart,
  PawPrint,
  RefreshCw,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";
import { fill, type EverydayContent, type TrustIcon, type TrustItem } from "@/lib/everyday-content";

// Everyday Pet Portrait design tokens (mobile spec, 390px reference).
export const C = {
  brown: "#A97659",
  brownHover: "#966C55",
  beige: "#F1E7DC",
  cream: "#FAF7F2",
  tint: "#FAF4EC",
  tintWarm: "#F9EFE4",
  text: "#2D2D2D",
  muted: "#6B5E53",
  border: "#E8D6C8",
  placeholder: "#B0A29A",
  toggleOff: "#D9CDB8",
} as const;

export function Toggle({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
      className="relative inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center"
    >
      <span
        className={`relative block h-6 w-11 rounded-full transition-colors duration-200 ${
          on ? "bg-[#A97659]" : "bg-[#D9CDB8]"
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.18)] transition-transform duration-200 ease-out ${
            on ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}

/** Top-right corner indicator: filled brown check when selected, empty ring when not. */
export function CornerMark({ selected, size = 24, className = "" }: { selected: boolean; size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size }}
      className={`flex items-center justify-center rounded-full transition-colors ${
        selected ? "bg-[#A97659] shadow-sm" : "border-[1.5px] border-[#D9CDB8] bg-white/95"
      } ${className}`}
    >
      {selected ? <Check size={Math.round(size * 0.55)} strokeWidth={3} className="text-white" /> : null}
    </span>
  );
}

export function StepIntro({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-1.5 sm:space-y-2">
      <h2 className="font-inter! text-[20px] font-bold! leading-[1.2] text-[#2D2D2D] sm:text-[24px]">{title}</h2>
      {description ? <p className="text-[13px] leading-[1.5] text-[#6B5E53] sm:text-[14px] sm:leading-[1.55]">{description}</p> : null}
    </div>
  );
}

export function SectionHeading({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h3 className="font-inter! text-[16px] font-semibold! leading-tight text-[#2D2D2D] sm:text-[18px]">{children}</h3>
      {aside}
    </div>
  );
}

/** Shared mobile-first classes for the tall framed/canvas style cards. */
export const styleGridClass = "grid grid-cols-2 gap-2 sm:gap-3";
export const styleCardShellClass =
  "relative flex min-w-0 flex-col overflow-hidden rounded-[12px] bg-[#FEFAF6] transition-all sm:rounded-[14px]";
export const styleCardImageClass =
  "relative block aspect-[3/4] w-full overflow-hidden rounded-[8px] bg-[#F1E7DC] sm:aspect-[2/3] sm:rounded-[10px]";
export const styleCardTitleClass = "text-[13px] font-semibold leading-tight text-[#2D2D2D] sm:text-[16px]";
export const styleCardBodyClass = "text-[11px] leading-[1.35] text-[#6B5E53] line-clamp-2 sm:text-[13px] sm:leading-[1.4] sm:line-clamp-none";
export const stylePreviewClass =
  "flex h-9 w-full items-center justify-center gap-1.5 rounded-[8px] border bg-white text-[12px] font-medium text-[#2D2D2D] transition-colors hover:bg-[#FAF7F2] sm:h-10 sm:gap-2 sm:rounded-[10px] sm:text-[14px]";

/** Compact option tiles (size / pets / counts). */
export const optionGridGapClass = "gap-2 sm:gap-3";
export const optionTileClass =
  "relative flex min-h-[96px] min-w-0 flex-col items-center justify-center rounded-[10px] bg-white px-1.5 pb-2.5 pt-3 text-center transition-all disabled:cursor-not-allowed sm:min-h-[120px] sm:px-2 sm:pb-3 sm:pt-4";
export const optionLabelClass = "text-[12px] font-semibold leading-tight text-[#2D2D2D] sm:text-[15px]";
export const optionPriceClass = "mt-0.5 text-[13px] font-bold leading-tight text-gray-500 sm:mt-1 sm:text-[16px]";

export function PrimaryButton({ label, onClick, disabled = false }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-[#A97659] text-[15px] font-semibold uppercase tracking-[0.04em] text-white transition-all hover:bg-[#966C55] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#A97659] disabled:active:scale-100 sm:h-[52px] sm:text-[16px]"
    >
      {label} <ArrowRight size={18} strokeWidth={2.25} />
    </button>
  );
}

const TRUST_ICON: Record<TrustIcon, typeof Heart> = {
  shield: ShieldCheck,
  truck: Truck,
  heart: Heart,
  eye: Eye,
  brush: Brush,
  star: Star,
  refresh: RefreshCw,
  gift: Gift,
  clock: Clock,
  paw: PawPrint,
};

export function TrustGlyph({ icon, size = 18 }: { icon: TrustIcon; size?: number }) {
  const Icon = TRUST_ICON[icon] || Heart;
  return <Icon size={size} />;
}

function inlineText(text: string): ReactNode[] {
  return text.split(/(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, index) => {
    if (/^\*\*\*.+\*\*\*$/.test(part)) {
      return (
        <strong key={index} className="font-bold italic">
          {part.slice(3, -3)}
        </strong>
      );
    }
    if (/^\*\*.+\*\*$/.test(part)) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (/^\*.+\*$/.test(part)) return <em key={index}>{part.slice(1, -1)}</em>;
    return part;
  });
}

/** Admin text: blank line = new paragraph, "- " lines = bullets, **bold**, *italic*. */
export function RichText({ text }: { text: string }) {
  const blocks = text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);
  return (
    <div className="space-y-4 font-inter text-sm leading-relaxed text-gray-600">
      {blocks.map((block, index) => {
        const lines = block.split("\n").map((line) => line.trim());
        if (lines.every((line) => line.startsWith("- "))) {
          return (
            <ul key={index} className="mt-2 list-disc space-y-1 pl-5">
              {lines.map((line, lineIndex) => (
                <li key={lineIndex}>{inlineText(line.slice(2))}</li>
              ))}
            </ul>
          );
        }
        return <p key={index}>{inlineText(block)}</p>;
      })}
    </div>
  );
}

export function TrustStrip({ items }: { items: TrustItem[] }) {
  const shown = items.filter((item) => item.label.trim());
  if (!shown.length) return null;
  return (
    <div
      className="grid divide-x divide-[#E8D6C8] rounded-[12px] bg-[#F5EEE6] py-4"
      style={{ gridTemplateColumns: `repeat(${shown.length}, minmax(0, 1fr))` }}
    >
      {shown.map((item, index) => {
        const Icon = TRUST_ICON[item.icon] || Heart;
        return (
          <div key={`${item.icon}-${index}`} className="flex flex-col items-center gap-1.5 px-1.5 text-center sm:gap-2 sm:px-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F1E2D3] text-[#A97659] sm:h-10 sm:w-10">
              <Icon size={20} strokeWidth={1.75} className="sm:h-[22px] sm:w-[22px]" />
            </span>
            <span className="text-[11px] font-medium leading-[1.3] text-[#6B5E53] sm:text-[13px]">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/** "Step 2 of 3 - Personalize Your Portrait · 66% Complete" with the thin bar, then the Back row. */
export function EverydayProgress({
  content,
  step,
  onBack,
}: {
  content: EverydayContent;
  step: number;
  onBack: () => void;
}) {
  const total = 3;
  const names = [content.step1.progressName, content.step2.progressName, content.step3.progressName];
  // Floor, as in the design: 33% → 66% → 100%.
  const percent = Math.floor((step / total) * 100);
  const stepText = fill(content.header.stepLabel, { step, total, name: names[step - 1] || "" });
  const completeText = fill(content.header.completeLabel, { percent });

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 flex items-start justify-between gap-2">
          <span className="min-w-0 text-[11px] font-medium uppercase leading-[1.35] tracking-[0.02em] text-[#8B7B6B]">
            {stepText}
          </span>
          <span className="shrink-0 text-[11px] font-semibold uppercase leading-[1.35] tracking-[0.02em] text-[#A97659]">
            {completeText}
          </span>
        </div>
        <div
          className="h-1.5 w-full overflow-hidden rounded-[3px] bg-[#EFE5DA]"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-label={stepText}
        >
          <div
            className="h-full rounded-[3px] bg-[#A97659] transition-[width] duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="-ml-1 flex min-h-[44px] items-center gap-1.5 px-1 text-[14px] text-[#8B7B6B] transition-colors hover:text-[#2D2D2D]"
        >
          <ArrowLeft size={16} /> {content.header.backLabel}
        </button>
        <span className="truncate text-[14px] font-semibold text-[#2D2D2D]">{content.header.productName}</span>
      </div>
    </div>
  );
}
