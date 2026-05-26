"use client";

import React from "react";
import { Star, ChevronDown, SlidersHorizontal, Check } from "lucide-react";
import Image from "next/image";
import { getCloudinaryUrl } from "@/utils/cloudinary";

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
    name: "Vaidehi",
    initial: "K",
    verified: true,
    date: "12/13/2024",
    rating: 5,
    text: "I didn’t expect to feel this much. It’s not just a portrait - it genuinely feels like him. I pause every time I walk past it.",
    image: "/review-image/review-1.jpeg",
    hasMultiplePhotos: true,
  },
  {
    name: "Ananya",
    initial: "A",
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
    name: "Ishaan",
    initial: "I",
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
    name: "Zoya",
    initial: "Z",
    verified: true,
    date: "9/24/2024",
    rating: 5,
    text: "I gifted this to my parents and they couldn’t stop looking at it. It’s one of those things that just hits you.",
    image: "/review-image/review-5.png",
  },
  {
    name: "Aarav",
    initial: "A",
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
    name: "Rhea",
    initial: "R",
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
    name: "Reyansh",
    initial: "R",
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
    name: "Kiara",
    initial: "K",
    verified: true,
    date: "11/20/2024",
    rating: 5,
    text: "It’s the kind of thing you don’t just hang on a wall - you feel something every time you look at it.",
  },
  {
    name: "Vihaan",
    initial: "V",
    verified: true,
    date: "11/15/2024",
    rating: 5,
    text: "My dog passed away last year… and this brought back a part of him I thought I’d lost. I can’t thank you enough.",
  }
];

export function Reviews() {
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
              4.5 / 145 Reviews
            </span>
          </div>
        </div>

        {/* Responsive Grid Layout - 2 Columns on Mobile, 3 Columns on Desktop */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {REVIEWS.map((review, i) => (
            <div
              key={i}
              className="bg-white rounded-[1rem] md:rounded-[1.5rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
            >
              {/* Review Image (If Available) */}
              {review.image && (
                <div className="relative w-full aspect-[3/4] overflow-hidden bg-gray-50 group">
                  <Image
                    src={review.image}
                    alt={`${review.name}'s custom pet portrait`}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {review.hasMultiplePhotos && (
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
                      +2
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
                        Verified
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
