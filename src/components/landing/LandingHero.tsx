import Image from "next/image";
import { ArrowDown, Heart, ImageIcon, RefreshCw, Truck } from "lucide-react";
import { HERO } from "@/lib/landing-content";
import { ScrollToPortraits } from "./ScrollToPortraits";

const BENEFIT_ICONS = { preview: ImageIcon, revisions: RefreshCw, shipping: Truck };

type LandingHeroProps = {
  /** Admin 16:9 hero photo, or "". */
  photo: string;
  /** Admin hero video, or "". Plays muted, with the photo as its poster. */
  video: string;
  /** Portrait shown on the right until a hero photo is uploaded. */
  fallbackPhoto: string;
};

export function LandingHero({ photo, video, fallbackPhoto }: LandingHeroProps) {
  return (
    <section className="mx-auto w-full max-w-6xl md:px-6 md:pt-6">
      <div className="relative aspect-video overflow-hidden bg-cream-deep md:rounded-3xl">
        {video ? (
          <video
            src={video}
            poster={photo || undefined}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : photo ? (
          <Image
            src={photo}
            alt="A pet beside its personalized portrait"
            fill
            priority
            sizes="(min-width: 1152px) 1104px, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-y-0 right-0 w-[52%]">
            <Image
              src={fallbackPhoto}
              alt="A pet beside its personalized portrait"
              fill
              priority
              sizes="(min-width: 1152px) 574px, 52vw"
              className="object-cover"
            />
          </div>
        )}

        {/* Keeps the headline readable whatever sits behind it. */}
        <div className="absolute inset-y-0 left-0 w-[66%] bg-gradient-to-r from-cream via-cream/85 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-center pl-4 pr-[40%] sm:pl-8 md:pl-14">
          <h1 className="font-playfair text-[clamp(1.4rem,6.2vw,3.75rem)] font-semibold leading-[1.08] text-cocoa">
            {HERO.headline}
            <br />
            {HERO.headlineAccent}
            <Heart
              aria-hidden
              strokeWidth={2.25}
              className="ml-1.5 inline-block h-[0.7em] w-[0.7em] -rotate-12 align-baseline text-terracotta"
            />
          </h1>
          <p className="mt-2 max-w-md text-[clamp(0.72rem,3vw,1.15rem)] leading-snug text-cocoa/75 md:mt-4">{HERO.text}</p>
        </div>
      </div>

      <ul className="grid grid-cols-3 gap-2 px-4 py-4 md:mx-auto md:max-w-3xl md:py-6">
        {HERO.benefits.map(({ icon, label }) => {
          const Icon = BENEFIT_ICONS[icon];
          return (
            <li key={icon} className="flex items-center gap-2 text-[11px] leading-tight text-cocoa md:justify-center md:text-sm">
              <Icon aria-hidden size={20} strokeWidth={1.75} className="shrink-0 text-terracotta" />
              <span>{label}</span>
            </li>
          );
        })}
      </ul>

      <div className="px-4 md:mx-auto md:max-w-md">
        <ScrollToPortraits className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-terracotta text-[15px] font-semibold text-white shadow-[0_10px_24px_-12px_rgba(180,71,42,0.8)] transition-colors hover:bg-terracotta-dark">
          {HERO.cta}
          <ArrowDown aria-hidden size={18} />
        </ScrollToPortraits>
      </div>
    </section>
  );
}
