import Image from "next/image";
import { ArrowRight, Heart } from "lucide-react";
import type { LandingContent } from "@/lib/landing-content";
import { ScrollToPortraits } from "./ScrollToPortraits";

type FinalCopy = Pick<LandingContent["finalCta"], "headline" | "text" | "cta">;

export function FinalCta({ image, copy }: { image: string; copy: FinalCopy }) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pt-14 md:px-6 md:pt-20">
      <div className="overflow-hidden rounded-3xl bg-cream-deep md:grid md:grid-cols-2 md:items-stretch">
        <div className="px-5 pb-6 pt-7 md:self-center md:p-12">
          <h2 className="font-playfair text-[26px] font-semibold leading-[1.15] text-cocoa md:text-4xl">
            {copy.headline}
            <Heart
              aria-hidden
              strokeWidth={2.25}
              className="ml-1.5 inline-block h-[0.7em] w-[0.7em] -rotate-12 align-baseline text-terracotta"
            />
          </h2>
          {copy.text ? <p className="mt-3 text-sm text-cocoa/75 md:text-base">{copy.text}</p> : null}
          <ScrollToPortraits className="mt-5 inline-flex h-12 items-center gap-2 rounded-full bg-terracotta px-6 text-[15px] font-semibold text-white shadow-[0_10px_24px_-12px_rgba(180,71,42,0.8)] transition-colors hover:bg-terracotta-dark">
            {copy.cta}
            <ArrowRight aria-hidden size={18} />
          </ScrollToPortraits>
        </div>
        <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[380px]">
          {image ? <Image src={image} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" /> : null}
        </div>
      </div>
    </section>
  );
}
