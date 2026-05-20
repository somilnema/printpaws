"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const PORTRAITS = [
  { 
    name: "Cooper", 
    image: "/slideshowimage/Silde image -1.png", 
    bgColor: "#FDFBF7",
  },
  { 
    name: "Stella", 
    image: "/slideshowimage/Slide image -2.png", 
    bgColor: "#F3F6F4",
  },
  { 
    name: "Charlie", 
    image: "/slideshowimage/Slide image - 3.png", 
    bgColor: "#F5E6D3",
  },
  { 
    name: "Loki", 
    image: "/slideshowimage/Slide image - 4.png", 
    bgColor: "#EEF2F1",
  },
  { 
    name: "Daisy", 
    image: "/slideshowimage/Slide image - 5.png", 
    bgColor: "#F1E9FA",
  },
  { 
    name: "Coco", 
    image: "/slideshowimage/Slide image -6.png", 
    bgColor: "#FDF4F5",
  },
  { 
    name: "Rocky", 
    image: "/slideshowimage/Slide image - 7.png", 
    bgColor: "#F4F7FD",
  },
  { 
    name: "Bailey", 
    image: "/slideshowimage/Slide imahe - 8.png", 
    bgColor: "#FBF3EE",
  },
];

export function IllustratedCarousel() {
  return (
    <section className="py-8 md:py-16 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-3xl md:text-5xl font-black text-[#1a1a1b] italic uppercase tracking-tight">
            The Moments That Meant Everything, Made to Stay
          </h2>
          <p className="text-xs md:text-sm text-gray-400 font-medium max-w-2xl mx-auto uppercase tracking-widest">
            Real pets. Real memories. Thoughtfully crafted from your photos to feel exactly like them.
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
                  className="flex-shrink-0 w-[240px] md:w-[320px] aspect-[4/5] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden group/card transition-all duration-500 relative shadow-md hover:shadow-xl"
                  style={{ backgroundColor: pet.bgColor }}
                >
                  {/* Full-bleed Portrait Image */}
                  <div className="absolute inset-0 w-full h-full">
                    <Image
                      src={pet.image}
                      alt={pet.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover/card:scale-105"
                      sizes="(max-width: 768px) 240px, 320px"
                      priority={idx < 8}
                    />
                  </div>

                  {/* Gradient Overlay for Text Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />

                  {/* Sleek bottom overlay for Pet Name */}
                  <div className="absolute bottom-6 left-6 right-6 transform translate-y-2 opacity-0 group-hover/card:translate-y-0 group-hover/card:opacity-100 transition-all duration-300 flex items-center justify-between">
                    <span className="text-white text-lg font-bold tracking-wider uppercase font-playfair drop-shadow-md">
                      {pet.name}
                    </span>
                    <span className="text-white/80 text-[10px] uppercase tracking-widest font-medium border border-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                      Portrait
                    </span>
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
