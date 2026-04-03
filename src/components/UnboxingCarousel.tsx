"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";

const CARDS = [
  {
    image: "/thumb1.png",
    text: "Unboxing & Final Reveal",
    subtext: "Parcel",
    hasPlay: true,
  },
  {
    image: "/thumb2.png",
    text: "And every",
    subtext: "PET MOM Must have!",
    hasPlay: true,
  },
  {
    image: "/dog_portrait_closeup_1773940826280.png",
    text: "Simple, beautiful",
    subtext: "Personal gifts",
    hasPlay: false,
  },
  {
    image: "/main.png",
    text: "Duggu",
    subtext: "Final Portrait",
    hasPlay: true,
  },
  {
    image: "/feature-gift.png",
    text: "Unboxing joy",
    subtext: "Every detail matters",
    hasPlay: true,
  },
];

export function UnboxingCarousel() {
  return (
    <section className="py-16 md:py-24 overflow-hidden bg-white">
      <div className="container mx-auto px-6 mb-12 text-center space-y-4">
        <h2 className="text-3xl md:text-5xl font-black text-[#1a1a1b] font-montserrat tracking-tight text-center uppercase">
          Pet Portraits <span className="text-primary italic px-2">&gt;</span> Regular Gifts <span className="inline-block animate-bounce">😎</span>
        </h2>
        <p className="text-gray-500 font-poppins text-sm md:text-lg max-w-2xl mx-auto leading-relaxed">
          See why pet parents are obsessed. These unboxings might just be cuter than your dog's Zoomies
        </p>
      </div>

      <div className="relative group">
        {/* Carousel Container */}
        <div className="flex gap-4 md:gap-8 hover:pause-animation overflow-hidden select-none">
          <motion.div 
            className="flex gap-4 md:gap-8 whitespace-nowrap"
            animate={{
              x: [0, "-100%"],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 40,
                ease: "linear",
              },
            }}
          >
            {/* Double the cards for seamless loop */}
            {[...CARDS, ...CARDS, ...CARDS].map((card, idx) => (
              <div 
                key={idx} 
                className="relative group/card flex-shrink-0 w-[240px] md:w-[320px] aspect-[9/16] rounded-[2rem] overflow-hidden border-4 border-white shadow-xl bg-gray-100"
              >
                <Image 
                  src={card.image} 
                  alt="Unboxing preview" 
                  fill 
                  sizes="(max-width: 768px) 240px, 320px"
                  className="object-cover transition-transform duration-700 group-hover/card:scale-110"
                />
                
                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                
                {/* Specific Text Overlays (Matching Screenshots) */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 whitespace-normal">
                  <p className="text-white font-black text-lg md:text-xl drop-shadow-lg leading-tight uppercase italic mb-1 font-montserrat">
                    {card.text}
                  </p>
                  <p className="text-[#FFD700] font-black text-2xl md:text-3xl drop-shadow-xl uppercase tracking-tighter font-montserrat">
                    {card.subtext}
                  </p>
                  
                  {card.hasPlay && (
                    <div className="mt-8 relative">
                      <div className="absolute inset-0 bg-white/20 blur-xl rounded-full animate-pulse" />
                      <div className="relative w-12 h-12 md:w-16 md:h-16 flex items-center justify-center bg-white/30 backdrop-blur-md rounded-full border-2 border-white/50 group-hover/card:bg-white/50 transition-all duration-300">
                        <Play className="text-white fill-white ml-2" size={24} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Brand Logo Overlay (matching screenshot 2nd card) */}
                {idx % 5 === 1 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white">
                    <div className="flex flex-col items-center gap-2">
                       <span className="text-2xl font-black text-[#1a1a1b] flex items-center gap-2">
                         <span className="text-primary tracking-tighter">🐾</span> Printsbypaws
                       </span>
                       <div className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-full">
                         <Play className="text-gray-400 fill-gray-400 ml-1" size={20} />
                       </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Navigation Arrows (Visual only in this scroll mode) */}
        <button className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg">
          <ChevronLeft size={24} />
        </button>
        <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg">
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Pagination dots (Visual only) */}
      <div className="flex justify-center gap-2 mt-12">
        <div className="w-3 h-3 rounded-full bg-primary" />
        <div className="w-3 h-3 rounded-full bg-gray-200" />
      </div>
    </section>
  );
}
