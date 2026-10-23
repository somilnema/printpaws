"use client";

import Image from "next/image";
import { BadgeCheck, Star } from "lucide-react";
import { REVIEWS } from "@/components/Reviews";
import { useMedia } from "@/components/SiteMedia";
import { REVIEW_SECTION } from "@/lib/landing-content";
import { CAROUSEL_ROW, CarouselDots, useCarouselIndex } from "./Carousel";

const REVIEWS_WITH_PHOTOS = REVIEWS.filter((review) => review.image);

export function ReviewCarousel() {
  const media = useMedia();
  const { ref, index, onScroll, goTo } = useCarouselIndex(REVIEWS_WITH_PHOTOS.length);

  return (
    <section className="pt-14 md:pt-20">
      <header className="mx-auto max-w-xl px-4 text-center">
        <h2 className="font-playfair text-[26px] font-semibold leading-tight text-cocoa md:text-4xl">{REVIEW_SECTION.title}</h2>
        <p className="mt-2 text-sm text-cocoa/75 md:text-base">{REVIEW_SECTION.text}</p>
      </header>

      <div ref={ref} onScroll={onScroll} className={`${CAROUSEL_ROW} mx-auto mt-6 max-w-6xl gap-3 pb-2 md:gap-5`}>
        {REVIEWS_WITH_PHOTOS.map((review) => (
          <article
            key={review.name}
            className="flex w-[86vw] max-w-[440px] shrink-0 snap-center gap-3 rounded-2xl bg-white p-3.5 shadow-[0_8px_24px_-14px_rgba(59,37,25,0.45)] md:snap-start"
          >
            <div className="flex min-w-0 flex-1 flex-col">
              <div role="img" aria-label={`${review.rating} out of 5 stars`} className="flex gap-0.5">
                {Array.from({ length: review.rating }, (_, i) => (
                  <Star key={i} aria-hidden size={14} className="fill-[#D9922E] text-[#D9922E]" />
                ))}
              </div>
              <p className="mt-2 line-clamp-6 text-[13px] leading-snug text-cocoa/85">“{review.text}”</p>
              <div className="mt-auto flex items-center gap-2 pt-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream-deep font-playfair text-sm font-bold text-cocoa">
                  {review.name.charAt(0)}
                </span>
                <div className="min-w-0 leading-tight">
                  <p className="text-[13px] font-semibold text-cocoa">{review.name}</p>
                  {review.verified && (
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-cocoa/70">
                      <BadgeCheck aria-hidden size={12} className="text-terracotta" />
                      Verified Purchase
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="relative aspect-[3/4] w-[38%] shrink-0 self-start overflow-hidden rounded-xl bg-cream-deep">
              <Image
                src={media(review.image!)}
                alt={`${review.name}'s portrait`}
                fill
                sizes="(min-width: 768px) 170px, 33vw"
                className="object-cover"
              />
            </div>
          </article>
        ))}
      </div>
      <CarouselDots count={REVIEWS_WITH_PHOTOS.length} index={index} label="Show review" onSelect={goTo} />
    </section>
  );
}
