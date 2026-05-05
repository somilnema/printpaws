"use client";

import React from 'react';
import { Star } from 'lucide-react';

export function ScrollingTicker() {
  const items = [
    "Extra 10% Off On All Prepaid Orders",
    "Free Shipping All Over India",
    "Extra 10% Off On All Prepaid Orders",
    "Free Shipping All Over India",
    "Extra 10% Off On All Prepaid Orders",
    "Free Shipping All Over India",
  ];

  return (
    <div className="w-full bg-[#ff5959] overflow-hidden py-2 my-0">
      <div className="flex animate-marquee whitespace-nowrap w-max">
        {/* Doubling items for seamless looping */}
        {[...items, ...items].map((item, index) => (
          <div key={index} className="flex items-center px-6 md:px-10">
            <span className="text-white font-black uppercase tracking-[0.15em] text-[13px] md:text-[15px] italic">
              {item}
            </span>
            <div className="ml-12 md:ml-20">
               <Star className="fill-white text-white opacity-40 shrink-0" size={14} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
