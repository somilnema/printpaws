"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const images = ["/main.png", "/thumb1.png", "/thumb2.png"];

export function ProductGallery() {
  const [activeImage, setActiveImage] = useState(0);

  const handleDragEnd = (_: any, info: any) => {
    const swipeThreshold = 50;
    if (info.offset.x > swipeThreshold && activeImage > 0) {
      setActiveImage(activeImage - 1);
    } else if (info.offset.x < -swipeThreshold && activeImage < images.length - 1) {
      setActiveImage(activeImage + 1);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image Container */}
      <div className="relative -mx-4 w-screen aspect-[3/4] md:mx-0 md:w-full md:aspect-square overflow-hidden bg-secondary/5 rounded-none md:rounded-3xl shadow-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeImage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative w-full h-full cursor-grab active:cursor-grabbing"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
          >
            <Image
              src={images[activeImage]}
              alt={`Pet Portrait ${activeImage + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover select-none"
              priority
            />
          </motion.div>
        </AnimatePresence>
        
        {/* Mobile Pagination Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 md:hidden z-20">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImage(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                activeImage === idx 
                  ? "bg-white scale-125 shadow-md w-6" 
                  : "bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Desktop Thumbnails (Hidden on Mobile) */}
      <div className="hidden md:flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setActiveImage(idx)}
            className={`relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border-[2.5px] transition-all duration-300 ${
              activeImage === idx 
                ? "border-primary shadow-lg scale-[1.02]" 
                : "border-transparent opacity-50 hover:opacity-100"
            }`}
          >
            <Image
              src={img}
              alt={`Thumbnail ${idx + 1}`}
              fill
              sizes="96px"
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
