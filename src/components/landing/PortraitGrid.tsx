"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, PawPrint } from "lucide-react";
import { PORTRAIT_SECTION } from "@/lib/landing-content";
import { trackCustomPixel } from "@/lib/pixel";
import { PORTRAITS_ANCHOR } from "./ScrollToPortraits";

export type PortraitCard = {
  slug: string;
  name: string;
  description: string;
  image: string;
  /** Live starting price, or null while the product is not on sale. */
  price: string | null;
};

export function PortraitGrid({ cards }: { cards: PortraitCard[] }) {
  return (
    <section id={PORTRAITS_ANCHOR} className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 pt-12 md:px-6 md:pt-20">
      <header className="text-center">
        <h2 className="font-playfair text-[26px] font-semibold leading-tight text-cocoa md:text-4xl">{PORTRAIT_SECTION.title}</h2>
        <p className="mt-2 text-sm text-cocoa/75 md:text-base">{PORTRAIT_SECTION.text}</p>
      </header>

      <ul className="mt-6 grid grid-cols-2 gap-3 md:mt-10 md:grid-cols-3 md:gap-6">
        {cards.map((card) => (
          <li key={card.slug}>
            {card.price ? (
              <Link
                href={`/portraits/${card.slug}`}
                onClick={() => trackCustomPixel("SelectPortrait", { content_ids: [card.slug], content_name: card.name })}
                className="group block h-full rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
              >
                <CardBody card={card} />
              </Link>
            ) : (
              <CardBody card={card} />
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function CardBody({ card }: { card: PortraitCard }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_8px_24px_-14px_rgba(59,37,25,0.45)]">
      <div className="relative aspect-[3/4] bg-cream-deep">
        {card.image ? (
          <Image
            src={card.image}
            alt=""
            fill
            sizes="(min-width: 1152px) 360px, (min-width: 768px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <PawPrint aria-hidden size={40} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-terracotta/30" />
        )}
      </div>
      <div className="flex flex-1 flex-col p-3 md:p-5">
        <h3 className="font-playfair text-[15px] font-bold leading-tight text-cocoa md:text-xl">{card.name}</h3>
        <p className="mt-1 text-[12px] leading-snug text-cocoa/75 md:text-sm">{card.description}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          {card.price ? (
            <>
              <span className="text-[13px] font-bold text-terracotta md:text-base">From {card.price}</span>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-terracotta text-white transition-transform group-hover:translate-x-0.5">
                <ArrowRight aria-hidden size={16} />
              </span>
            </>
          ) : (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-cocoa/70">Coming soon</span>
          )}
        </div>
      </div>
    </article>
  );
}
