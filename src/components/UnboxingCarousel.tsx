"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { getCloudinaryUrl } from "@/utils/cloudinary";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CARDS = [
  {
    video: "IMG_3784 (1).MOV",
    text: "Real",
    subtext: "Reaction",
    hasPlay: true,
  },
  {
    video: "IMG_6005.MOV",
    text: "Unboxing & Final Reveal",
    subtext: "Pure Joy",
    hasPlay: true,
  },
  {
    video: "IMG_6007.MOV",
    text: "Capturing Every",
    subtext: "Detail",
    hasPlay: true,
  },
  {
    video: "IMG_6165.MOV",
    text: "A Gift That",
    subtext: "Lasts Forever",
    hasPlay: true,
  },
  {
    video: "IMG_6181.MOV",
    text: "The Perfect",
    subtext: "Memory",
    hasPlay: true,
  },
  {
    video: "IMG_6239.MOV",
    text: "Watch them",
    subtext: "React",
    hasPlay: true,
  },
  {
    video: "IMG_4486.MOV",
    text: "Pure",
    subtext: "Joy",
    hasPlay: true,
  },
  {
    video: "IMG_5576.MOV",
    text: "Hand-Painted",
    subtext: "Details",
    hasPlay: true,
  },
];

export function UnboxingCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft } = scrollRef.current;
      const cardWidth = scrollRef.current.scrollWidth / CARDS.length;
      const index = Math.round(scrollLeft / cardWidth);
      setActiveIndex(Math.min(Math.max(index, 0), CARDS.length - 1));
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft } = scrollRef.current;
      const cardWidth = scrollRef.current.scrollWidth / CARDS.length;
      scrollRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - cardWidth : scrollLeft + cardWidth,
        behavior: "smooth"
      });
    }
  };

  return (
    <section className="pt-0 md:pt-24 pb-8 md:pb-10 overflow-hidden bg-white">
      <div className="container mx-auto px-6 mb-6 md:mb-12 text-center space-y-4">
        <h2 className="text-3xl md:text-5xl font-black text-[#1a1a1b] font-playfair tracking-tight text-center uppercase flex items-center justify-center flex-wrap gap-x-2">
          <span>Pet Portraits</span> 
          <span className="text-primary italic">&gt;</span> 
          <span>Ordinary Gifts</span>
          <motion.span
            className="inline-block origin-center text-3xl md:text-5xl select-none ml-1"
            animate={{ 
              scale: [1, 1.2, 1, 1.2, 1],
              rotate: [0, -6, 6, -6, 0]
            }}
            transition={{ 
              duration: 1.2,
              repeat: Infinity,
              repeatDelay: 1.8,
              ease: "easeInOut"
            }}
          >
            😍
          </motion.span>
        </h2>
        <p className="text-gray-500 font-inter text-sm md:text-lg max-w-2xl mx-auto leading-relaxed">
          Because the pets we love deserve more than something temporary.
        </p>
      </div>

      <div className="relative max-w-7xl mx-auto group">
        {/* Left Arrow Button */}
        <button
          onClick={() => scroll("left")}
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/95 hover:bg-white text-gray-800 shadow-xl border border-gray-100 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 md:flex hidden opacity-0 group-hover:opacity-100 cursor-pointer"
          aria-label="Scroll Left"
        >
          <ChevronLeft size={24} className="stroke-[2.5]" />
        </button>

        {/* Right Arrow Button */}
        <button
          onClick={() => scroll("right")}
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/95 hover:bg-white text-gray-800 shadow-xl border border-gray-100 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 md:flex hidden opacity-0 group-hover:opacity-100 cursor-pointer"
          aria-label="Scroll Right"
        >
          <ChevronRight size={24} className="stroke-[2.5]" />
        </button>

        {/* Horizontal Scroll Container */}
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto gap-4 md:gap-6 px-6 md:px-12 pb-8 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {CARDS.map((card, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="relative flex-shrink-0 w-[85vw] md:w-[320px] aspect-[9/16] rounded-[2rem] overflow-hidden border-4 border-white shadow-xl bg-gray-100 snap-center first:ml-0"
            >
              {card.video ? (
                <video
                  src={getCloudinaryUrl(card.video)}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <Image 
                  src={(card as any).image || ""} 
                  alt="Unboxing preview" 
                  fill 
                  className="object-cover"
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2.5 mt-2">
          {CARDS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (scrollRef.current) {
                  const cardWidth = scrollRef.current.scrollWidth / CARDS.length;
                  scrollRef.current.scrollTo({
                    left: idx * cardWidth,
                    behavior: "smooth"
                  });
                }
              }}
              className="relative w-2.5 h-2.5 focus:outline-none cursor-pointer"
              aria-label={`Go to slide ${idx + 1}`}
            >
              {/* Static background dot */}
              <span className="block w-2.5 h-2.5 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-300" />
              {/* Animated active overlay dot */}
              {activeIndex === idx && (
                <motion.span
                  layoutId="activeReelDot"
                  className="absolute inset-0 bg-[#A87B62] rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
