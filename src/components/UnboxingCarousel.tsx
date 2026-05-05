"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

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

      <div className="relative max-w-7xl mx-auto">
        {/* Horizontal Scroll Container */}
        <div 
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
