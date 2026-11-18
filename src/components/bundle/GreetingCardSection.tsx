"use client";

import { Mail } from "lucide-react";
import { Toggle } from "@/components/everyday/ui";
import { fill, type EverydayContent } from "@/lib/everyday-content";
import { formatRupee } from "@/lib/pricing";

/** Gift Bundle step 2: one optional paid greeting card; the message is asked for only while it is on. */
export function GreetingCardSection({
  content,
  heading,
  price,
  on,
  onToggle,
  message,
  onMessage,
  error,
}: {
  content: EverydayContent;
  heading: string;
  price: number;
  on: boolean;
  onToggle: () => void;
  message: string;
  onMessage: (v: string) => void;
  error?: string;
}) {
  const bundle = content.bundle;
  if (!bundle) return null;
  const max = Math.max(1, bundle.greetingMax);
  const priceLabel = price > 0 && bundle.greetingPriceLabel ? fill(bundle.greetingPriceLabel, { price: formatRupee(price) }) : "";
  const title = bundle.greetingTitle || heading;

  return (
    <div className="space-y-3">
      {heading ? (
        <h3 className="font-inter! text-[16px] font-semibold! leading-tight text-[#2D2D2D]">
          {heading}
          {content.step2.optionalLabel ? (
            <span className="font-normal text-[#6B5E53]"> {content.step2.optionalLabel}</span>
          ) : null}
        </h3>
      ) : null}
      <div
        className={`rounded-[12px] border bg-white p-3.5 transition-all ${
          on ? "border-[#A97659] shadow-[0_0_0_1px_#A97659]" : "border-[#E8D6C8]"
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F9EFE4] text-[#A97659]" aria-hidden>
            <Mail size={22} strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="break-words text-[15px] font-semibold leading-tight text-[#2D2D2D]">{title}</p>
            {bundle.greetingDescription ? (
              <p className="mt-0.5 break-words text-[13px] leading-snug text-[#6B5E53]">{bundle.greetingDescription}</p>
            ) : null}
            {priceLabel ? (
              <span className="mt-1.5 inline-flex min-h-[22px] items-center rounded-full bg-[#F9EFE4] px-2.5 text-[12px] font-semibold leading-tight text-[#A97659]">
                {priceLabel}
              </span>
            ) : null}
          </div>
          <Toggle on={on} onToggle={onToggle} label={title || "Greeting card"} />
        </div>

        {on ? (
          <div className="mt-3 space-y-1.5 border-t border-[#F1E7DC] pt-3">
            {bundle.greetingMessageLabel ? (
              <label htmlFor="bundle-greeting-message" className="block text-[13px] font-medium text-[#6B5E53]">
                {bundle.greetingMessageLabel}
              </label>
            ) : null}
            <div className="relative">
              <textarea
                id="bundle-greeting-message"
                rows={4}
                value={message}
                maxLength={max}
                aria-label={bundle.greetingMessageLabel || title || "Card message"}
                aria-invalid={error ? true : undefined}
                onChange={(e) => onMessage(e.target.value.slice(0, max))}
                placeholder={bundle.greetingPlaceholder}
                className={`block w-full resize-none rounded-[10px] border bg-white px-4 pb-7 pt-3 text-[16px] leading-6 text-[#2D2D2D] outline-none transition-colors placeholder:text-[#B0A29A] focus:border-[#A97659] ${
                  error ? "border-red-400 bg-red-50/40" : "border-[#EBD6C8]"
                }`}
              />
              <span className="pointer-events-none absolute bottom-2 right-3 text-[12px] text-[#8B8B7D]">
                {message.length} / {max}
              </span>
            </div>
            {error ? <p className="text-[12px] font-semibold text-red-500">{error}</p> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
