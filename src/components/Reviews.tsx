"use client";

import React from "react";
import { Star, ChevronDown, SlidersHorizontal, Check } from "lucide-react";
import Image from "next/image";

interface ReviewItem {
  name: string;
  initial: string;
  verified: boolean;
  date: string;
  rating: number;
  text: string;
  image?: string;
  hasMultiplePhotos?: boolean;
  itemType?: string;
  productBox?: {
    image: string;
    text: string;
  };
}

const REVIEWS: ReviewItem[] = [
  {
    name: "Verified Customer",
    initial: "VC",
    verified: true,
    date: "12/13/2024",
    rating: 5,
    text: "I didn’t expect to feel this much. It’s not just a portrait - it genuinely feels like him. I pause every time I walk past it.",
    image: "/review-image/review-1.jpeg",
    hasMultiplePhotos: true,
  },
  {
    name: "Verified Customer",
    initial: "VC",
    verified: true,
    date: "10/19/2024",
    rating: 5,
    text: "The moment I saw it, I smiled… and then I teared up. You’ve captured something I can’t even explain.",
    image: "/review-image/review-2.jpeg",
    productBox: {
      image: "/review-image/review-box-icon.png",
      text: "One Pet Portrait - Black Frame"
    }
  },
  {
    name: "Verified Customer",
    initial: "VC",
    verified: true,
    date: "10/17/2024",
    rating: 5,
    text: "It’s crazy how accurate it is. Not just the face - the feeling. It’s like she’s still right here.",
    image: "/review-image/review-4.png",
    itemType: "Pearl / 50x70 cm / 20x28\"",
    productBox: {
      image: "/review-image/review-box-icon.png",
      text: "One Pet Portrait - Premium Wood"
    }
  },
  {
    name: "Verified Customer",
    initial: "VC",
    verified: true,
    date: "9/24/2024",
    rating: 5,
    text: "I gifted this to my parents and they couldn’t stop looking at it. It’s one of those things that just hits you.",
    image: "/review-image/review-5.png",
  },
  {
    name: "Verified Customer",
    initial: "VC",
    verified: true,
    date: "11/02/2024",
    rating: 5,
    text: "I’ve taken hundreds of photos of my dog, but this… this is the one that actually feels like him.",
    image: "/review-image/review-6.png",
    itemType: "Almond / 30x40 cm / 12x16\"",
    productBox: {
      image: "/review-image/review-box-icon.png",
      text: "Two Pet Portraits - Black Frame"
    }
  },
  {
    name: "Verified Customer",
    initial: "VC",
    verified: true,
    date: "10/29/2024",
    rating: 5,
    text: "The eyes, the expression, everything - it’s so real it almost feels alive. I wasn’t expecting that.",
    image: "/review-image/review-7.png",
    productBox: {
      image: "/review-image/review-box-icon.png",
      text: "One Pet Portrait - Premium Wood"
    }
  },
  {
    name: "Verified Customer",
    initial: "VC",
    verified: true,
    date: "10/05/2024",
    rating: 5,
    text: "I thought it would be nice. I didn’t think it would mean this much. It’s now my favorite thing in the house.",
    image: "/review-image/review-8.jpg",
    productBox: {
      image: "/review-image/review-box-icon.png",
      text: "One Pet Portrait - Pearl Frame"
    }
  },
  {
    name: "Verified Customer",
    initial: "VC",
    verified: true,
    date: "11/20/2024",
    rating: 5,
    text: "It’s the kind of thing you don’t just hang on a wall - you feel something every time you look at it.",
  },
  {
    name: "Verified Customer",
    initial: "VC",
    verified: true,
    date: "11/15/2024",
    rating: 5,
    text: "My dog passed away last year… and this brought back a part of him I thought I’d lost. I can’t thank you enough.",
  }
];

export function Reviews() {
  return (
    <section className="py-16 bg-white font-inter">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Rating Summary Bar */}
        <div className="flex justify-between items-center border-b border-gray-100 pb-6 mb-10">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} className="fill-[#d8b49e] text-[#d8b49e]" />
              ))}
            </div>
            <button className="flex items-center gap-1 text-sm font-bold text-[#1a1a1b] hover:opacity-80 transition-opacity">
              372 Reviews <ChevronDown size={16} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-5 py-2.5 border border-gray-300 rounded-lg text-xs md:text-sm font-bold text-[#1a1a1b] hover:bg-gray-50 transition-all uppercase tracking-wider">
              Write a review
            </button>
            <button className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all text-[#1a1a1b]">
              <SlidersHorizontal size={18} />
            </button>
          </div>
        </div>

        {/* Responsive Grid Layout - 3 Columns Side-by-Side on Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {REVIEWS.map((review, i) => (
            <div
              key={i}
              className="bg-white rounded-[1.5rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
            >
              {/* Review Image (If Available) */}
              {review.image && (
                <div className="relative w-full aspect-[3/4] overflow-hidden bg-gray-50 group">
                  <Image
                    src={review.image}
                    alt={`${review.name}'s custom pet portrait`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {review.hasMultiplePhotos && (
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-3.5 h-3.5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm3.25-1a.75.75 0 00-.75.75v9.5c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-9.5a.75.75 0 00-.75-.75H3.25zm5.28 2.97a.75.75 0 01.3-.03c.123.013.24.062.335.141l2.5 2a.75.75 0 01.12 1.08l-4 4.5a.75.75 0 01-1.1-.02l-2-2a.75.75 0 011.06-1.06l1.42 1.42 3.39-3.81-1.72-1.38a.75.75 0 01-.3-1.04v.002zm5.72 1.28a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      +2
                    </div>
                  )}
                </div>
              )}

              {/* Review Info */}
              <div className="p-5 flex flex-col flex-1">
                {/* Author Name and Verification Status */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-[#1a1a1b]">{review.name}</span>
                    {review.verified && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-500">
                        <span className="w-3.5 h-3.5 rounded-full bg-black text-white flex items-center justify-center scale-90">
                          <Check size={8} strokeWidth={4} />
                        </span>
                        Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Review Date */}
                <span className="text-[10px] text-gray-400 font-medium mb-2 block">{review.date}</span>

                {/* Stars Rating */}
                <div className="flex gap-0.5 mb-3">
                  {[...Array(review.rating)].map((_, j) => (
                    <Star key={j} size={13} className="fill-[#d8b49e] text-[#d8b49e]" />
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-xs text-gray-600 font-inter italic leading-relaxed mb-4 flex-1">
                  "{review.text}"
                </p>

                {/* Item Type (If Available) */}
                {review.itemType && (
                  <div className="mt-2 mb-3">
                    <span className="text-[10px] text-gray-400 block font-medium">Item type:</span>
                    <span className="text-xs font-semibold text-gray-700">{review.itemType}</span>
                  </div>
                )}


              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
