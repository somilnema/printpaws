"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";

const CARDS = [
  {
    video: "/IMG_3777.MOV",
    text: "Unboxing & Final Reveal",
    subtext: "Pure Joy",
    hasPlay: true,
  },
  {
    video: "/IMG_3780.MOV",
    text: "Capturing Every",
    subtext: "Detail",
    hasPlay: true,
  },
  {
    video: "/IMG_3784.MOV",
    text: "A Gift That",
    subtext: "Lasts Forever",
    hasPlay: true,
  },
  {
    video: "/IMG_3791.MOV",
    text: "The Perfect",
    subtext: "Memory",
    hasPlay: true,
  },
  {
    video: "/IMG_3825.MOV",
    text: "Watch them",
    subtext: "React",
    hasPlay: true,
  },
];

export function UnboxingCarousel() {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % CARDS.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + CARDS.length) % CARDS.length);
  };

  return (
    <section className="pt-0 md:pt-24 pb-8 md:pb-10 overflow-hidden bg-white">
      <div className="container mx-auto px-6 mb-6 md:mb-12 text-center space-y-4">
        <h2 className="text-3xl md:text-5xl font-black text-[#1a1a1b] font-playfair tracking-tight text-center uppercase">
          Pet Portraits <span className="text-primary italic px-2">&gt;</span> Forgettable Gifts
        </h2>
        <p className="text-gray-500 font-inter text-sm md:text-lg max-w-2xl mx-auto leading-relaxed">
          Because the ones who mean the most deserve something that actually feels like them - not something they’ll forget.
        </p>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 group">
        {/* Carousel Container */}
        <div className="overflow-hidden rounded-[2.5rem]">
          <motion.div 
            className="flex gap-4 md:gap-6"
            animate={{
              x: `-${currentIndex * (100 / 1.5)}%`,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
            style={{ width: `${(CARDS.length * 100) / 1.5}%` }}
          >
            {CARDS.map((card, idx) => (
              <div 
                key={idx} 
                className="relative flex-shrink-0 w-[240px] md:w-[320px] aspect-[9/16] rounded-[2rem] overflow-hidden border-4 border-white shadow-xl bg-gray-100"
              >
                {card.video ? (
                  <video
                    src={card.video}
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
              </div>
            ))}
          </motion.div>
        </div>

        {/* Navigation Arrows */}
        <button 
          onClick={prev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-12 h-12 flex items-center justify-center bg-white text-black rounded-full shadow-2xl z-20 border border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={next}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-12 h-12 flex items-center justify-center bg-white text-black rounded-full shadow-2xl z-20 border border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Pagination dots */}
      <div className="flex justify-center gap-2 mt-10">
        {CARDS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              currentIndex === idx ? "w-8 bg-primary" : "w-2 bg-gray-200"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
