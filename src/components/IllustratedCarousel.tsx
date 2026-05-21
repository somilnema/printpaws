"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { getCloudinaryUrl } from "@/utils/cloudinary";

const PORTRAITS = [
  {
    name: "Levi",
    image: "/slideshowimage/Slide image -6.png",
    bgColor: "#FDF4F5",
  },
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
    <section className="pt-2 pb-8 md:py-16 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-3xl md:text-5xl font-black text-[#1a1a1b] uppercase tracking-tight">
            The Moments That Meant Everything, Made to Stay
          </h2>
          <p className="text-xs md:text-sm text-gray-400 font-medium max-w-2xl mx-auto uppercase tracking-widest">
            Real pets. Real memories. Thoughtfully crafted from your photos to feel exactly like them.
          </p>
        </div>

        {/* CSS Keyframes for Buttery-Smooth Native GPU Marquee and pause states */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes smoothScrollMarquee {
            0% {
              transform: translate3d(0, 0, 0);
            }
            100% {
              transform: translate3d(-50%, 0, 0);
            }
          }
          .smooth-marquee-flow {
            animation: smoothScrollMarquee 28s linear infinite;
            will-change: transform;
            backface-visibility: hidden;
          }
          .hover-pause-container:hover .smooth-marquee-flow {
            animation-play-state: paused !important;
          }
        `}} />

        {/* Carousel Container */}
        <div className="relative group">
          <div className="flex hover-pause-container overflow-hidden select-none w-full">
            <div
              className="flex gap-6 whitespace-nowrap smooth-marquee-flow"
              style={{ willChange: "transform" }}
            >
              {/* Double the cards for seamless, high-performance GPU scroll */}
              {[...PORTRAITS, ...PORTRAITS].map((pet, idx) => (
                <div
                  key={idx}
                  className="flex-shrink-0 w-[240px] md:w-[320px] aspect-[2/3] md:aspect-[4/5] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden group/card transition-all duration-500 relative shadow-md hover:shadow-xl"
                  style={{ backgroundColor: pet.bgColor }}
                >
                  {/* Full-bleed Portrait Image */}
                  <div className="absolute inset-0 w-full h-full">
                    <Image
                      src={getCloudinaryUrl(pet.image)}
                      alt={pet.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover/card:scale-105"
                      sizes="(max-width: 768px) 240px, 320px"
                      priority={idx < 8}
                    />
                  </div>

                  {/* Gradient Overlay for Text Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  {/* Sleek bottom overlay for Pet Name */}
                  <div className="absolute bottom-6 left-6 right-6 transform translate-y-2 opacity-0 group-hover/card:translate-y-0 group-hover/card:opacity-100 transition-all duration-300 flex items-center justify-between pointer-events-none">
                    <span className="text-white text-lg font-bold tracking-wider uppercase font-playfair drop-shadow-md">
                      {pet.name}
                    </span>
                    <span className="text-white/80 text-[10px] uppercase tracking-widest font-medium border border-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                      Portrait
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
