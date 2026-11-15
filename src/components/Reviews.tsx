"use client";

import { Star, Check } from "lucide-react";
import Image from "next/image";
import { useMedia } from "@/components/SiteMedia";
import { REVIEWS, REVIEWS_SUMMARY, type ReviewItem } from "@/lib/reviews";
import { uploadedKey } from "@/lib/site-media-catalog";
import type { EverydayContent } from "@/lib/everyday-content";

// The list lives in lib/reviews (plain data the server can read); kept exported here for existing imports.
export { REVIEWS };
export type { ReviewItem };

type Card = { review: ReviewItem; position: number; photosBadge: string };

/**
 * Reviews grid. Configurator product pages pass their admin copy (cards keep their place) and media prefix,
 * so each card can show that product's own photo; without them it shows the shared list as before.
 */
export function Reviews({ copy, mediaPrefix }: { copy?: EverydayContent["reviews"]; mediaPrefix?: string } = {}) {
  const media = useMedia();
  const cards: Card[] = copy
    ? copy.items.flatMap((item, index) => {
        const base = REVIEWS[index];
        if (!item.visible || !base) return [];
        const review: ReviewItem = { ...base, name: item.name, date: item.date, rating: item.rating, verified: item.verified, text: item.text };
        return [{ review, position: index + 1, photosBadge: item.photosBadge }];
      })
    : REVIEWS.map((review, index) => ({ review, position: index + 1, photosBadge: review.hasMultiplePhotos ? "+2" : "" }));
  const photo = (card: Card) =>
    (mediaPrefix && media(uploadedKey(`${mediaPrefix}-review-${card.position}`))) || (card.review.image ? media(card.review.image) : "");
  return (
    <section id="reviews" className="py-16 bg-white font-inter">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Rating Summary Bar */}
        <div className="flex justify-between items-center border-b border-gray-100 pb-6 mb-10">
          <div className="flex items-center gap-3">
            <div className="flex gap-1 items-center">
              {[...Array(4)].map((_, i) => (
                <Star key={i} size={20} className="fill-[#d8b49e] text-[#d8b49e]" />
              ))}
              <div className="relative w-5 h-5 flex-shrink-0">
                <Star size={20} className="text-[#d8b49e] opacity-35" />
                <div className="absolute top-0 left-0 w-1/2 h-full overflow-hidden">
                  <Star size={20} className="fill-[#d8b49e] text-[#d8b49e]" />
                </div>
              </div>
            </div>
            <span className="text-sm font-medium text-gray-500 font-inter ml-1">
              {copy ? copy.summary : REVIEWS_SUMMARY}
            </span>
          </div>
        </div>

        {/* Responsive Grid Layout - 2 Columns on Mobile, 3 Columns on Desktop */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {cards.map(({ review, position, photosBadge }, i) => (
            <div
              key={position}
              className="bg-white rounded-[1rem] md:rounded-[1.5rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
            >
              {/* Review Image (If Available) */}
              {photo(cards[i]) && (
                <div className="relative w-full aspect-[3/4] overflow-hidden bg-gray-50 group">
                  <Image
                    src={photo(cards[i])}
                    alt={`${review.name}'s custom pet portrait`}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {photosBadge && (
                    <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-sm text-white px-1.5 py-0.5 rounded text-[8px] md:text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-2.5 h-2.5 md:w-3.5 md:h-3.5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm3.25-1a.75.75 0 00-.75.75v9.5c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-9.5a.75.75 0 00-.75-.75H3.25zm5.28 2.97a.75.75 0 01.3-.03c.123.013.24.062.335.141l2.5 2a.75.75 0 01.12 1.08l-4 4.5a.75.75 0 01-1.1-.02l-2-2a.75.75 0 011.06-1.06l1.42 1.42 3.39-3.81-1.72-1.38a.75.75 0 01-.3-1.04v.002zm5.72 1.28a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
                        />
                      </svg>
                      {photosBadge}
                    </div>
                  )}
                </div>
              )}

              {/* Review Info */}
              <div className="p-3 md:p-5 flex flex-col flex-1">
                {/* Author Name and Verification Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <div className="flex items-center flex-wrap gap-1 md:gap-1.5">
                    <span className="font-bold text-xs md:text-sm text-[#1a1a1b] leading-tight">{review.name}</span>
                    {review.verified && (
                      <span className="inline-flex items-center gap-0.5 md:gap-1 text-[8px] md:text-[10px] font-bold text-gray-500">
                        <span className="w-3 h-3 md:w-3.5 md:h-3.5 rounded-full bg-black text-white flex items-center justify-center scale-75 origin-left">
                          <Check size={8} strokeWidth={4} />
                        </span>
                        {copy ? copy.verifiedLabel : "Verified"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Review Date */}
                <span className="text-[8px] md:text-[10px] text-gray-400 font-medium mb-1.5 md:mb-2 block">{review.date}</span>

                {/* Stars Rating */}
                <div className="flex gap-0.5 mb-2 md:mb-3">
                  {[...Array(review.rating)].map((_, j) => (
                    <Star key={j} size={10} className="fill-[#d8b49e] text-[#d8b49e] md:scale-125 origin-left" />
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-[10px] md:text-xs text-gray-600 font-inter italic leading-relaxed mb-3 md:mb-4 flex-1">
                  "{review.text}"
                </p>


              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
