"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const PORTRAITS = [
  { 
    name: "COOPER", 
    image: "/dog_portrait_closeup_1773940826280.png", 
    bgColor: "#FDFBF7",
    font: "font-montserrat tracking-[0.2em] font-light text-gray-400"
  },
  { 
    name: "Stella", 
    image: "/thumb1.png", 
    bgColor: "#F3F6F4",
    font: "font-montserrat font-black text-gray-700"
  },
  { 
    name: "Logan", 
    image: "/thumb2.png", 
    bgColor: "#F5E6D3",
    font: "font-montserrat font-bold text-gray-600"
  },
  { 
    name: "LOKI", 
    image: "/thumb_pet_portrait_1_1773940327175.png", 
    bgColor: "#EEF2F1",
    font: "font-montserrat tracking-widest font-light text-gray-500"
  },
  { 
    name: "DAISY", 
    image: "/thumb_pet_portrait_2_1773940346421.png", 
    bgColor: "#F1E9FA",
    font: "font-montserrat tracking-[0.1em] font-medium text-gray-400"
  },
];

export function IllustratedCarousel() {
  return (
    <section className="py-8 md:py-12 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10 space-y-3">
          <h2 className="text-3xl md:text-5xl font-black text-[#1a1a1b] italic uppercase tracking-tight">
            Moments That Matter, Illustrated
          </h2>
          <p className="text-xs md:text-sm text-gray-400 font-medium max-w-2xl mx-auto uppercase tracking-widest">
            Real artists. Real pets. Hand-crafted portraits made from your photos.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative group">
          <div className="flex hover:pause-animation overflow-hidden select-none">
            <motion.div 
              className="flex gap-6 whitespace-nowrap"
              animate={{
                x: [0, "-100%"],
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 35,
                  ease: "linear",
                },
              }}
            >
              {/* Triple the cards for seamless loop */}
              {[...PORTRAITS, ...PORTRAITS, ...PORTRAITS].map((pet, idx) => (
                <div 
                  key={idx} 
                  className="flex-shrink-0 w-[240px] md:w-[320px] aspect-[4/5] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden group/card transition-all duration-500"
                  style={{ backgroundColor: pet.bgColor }}
                >
                  <div className="h-full flex flex-col pt-8 md:pt-12">
                    <span className={`text-center mb-2 md:mb-4 text-lg md:text-xl uppercase ${pet.font}`}>
                      {pet.name}
                    </span>
                    <div className="relative flex-1 w-full mt-auto">
                      <Image
                        src={pet.image}
                        alt={pet.name}
                        fill
                        className="object-contain object-bottom transition-transform duration-700 group-hover/card:scale-110"
                        sizes="(max-width: 768px) 240px, 320px"
                        onError={(e: any) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .hover\\:pause-animation:hover > div {
          animation-play-state: paused !important;
        }
      `}</style>
    </section>
  );
}
