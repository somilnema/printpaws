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
    <div className="space-y-2">
      <h2 className="font-inter! text-[24px] font-bold! leading-[1.2] text-[#2D2D2D]">{title}</h2>
      {description ? <p className="text-[14px] leading-[1.55] text-[#6B5E53]">{description}</p> : null}
    </div>
  );
}

export function SectionHeading({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h3 className="font-inter! text-[18px] font-semibold! leading-tight text-[#2D2D2D]">{children}</h3>
      {aside}
    </div>
  );
}

export function PrimaryButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[10px] bg-[#A97659] text-[16px] font-semibold uppercase tracking-[0.04em] text-white transition-all hover:bg-[#966C55] active:scale-[0.98]"
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
          <div key={`${item.icon}-${index}`} className="flex flex-col items-center gap-2 px-2 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F1E2D3] text-[#A97659]">
              <Icon size={22} strokeWidth={1.75} />
            </span>
            <span className="text-[13px] font-medium leading-[1.3] text-[#6B5E53]">{item.label}</span>
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
