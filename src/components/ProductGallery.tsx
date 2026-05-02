"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const GALLERY_IMAGES: Record<string, string[]> = {
  // Pets (Section 1)
  one: ["/Section 1/1.jpg", "/Section 1/2.jpg", "/Section 1/3.jpg", "/Section 1/4.jpg"],
  two: ["/Section 1/5.jpg", "/Section 1/6.jpg", "/Section 1/7.jpg", "/Section 1/8.jpg"],
  three: ["/Section 1/9.jpg", "/Section 1/10.jpg", "/Section 1/11.jpg", "/Section 1/12.jpg"],
  four: ["/Section 1/13.jpg", "/Section 1/14.jpg", "/Section 1/11.jpg", "/Section 1/8.jpg"],
  
  // Frames (Section 2)
  black: ["/Section 2/1.png", "/Section 2/2.png", "/Section 2/3.png", "/Section 2/4.png"],
  white: ["/Section 2/5.png", "/Section 2/6.png", "/Section 2/7.png", "/Section 2/8.png"],
  wood: ["/Section 2/9.png", "/Section 2/10.png", "/Section 2/11.png", "/Section 2/12.png"],
  canva: ["/Section 2/13.jpg", "/Section 2/14.jpg", "/Section 2/15.jpg", "/Section 2/16.jpg"],

  // Backgrounds (Section 3)
  different: ["/Section 3/1.jpg", "/Section 3/2.webp", "/Section 3/3.jpg", "/Section 3/4.jpg", "/Section 3/5.jpg", "/Section 3/6.jpg"],
  black_bg: ["/Section 3/7.png", "/Section 3/8.jpg", "/Section 3/9.jpg", "/Section 3/10.jpg", "/Section 3/11.jpg", "/Section 3/12.jpg"],
};

export function ProductGallery() {
  const [activeImage, setActiveImage] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("one");

  useEffect(() => {
    const handleCategoryChange = (e: any) => {
      setSelectedCategory(e.detail);
      setActiveImage(0); // Reset to first image when category changes
    };

    const handleBackgroundChange = (e: any) => {
      const colorMap: Record<string, { category: string, index: number }> = {
        "Pearl": { category: "different", index: 0 },
        "Almond": { category: "different", index: 1 },
        "Serenity": { category: "different", index: 2 },
        "Celadon": { category: "different", index: 3 },
        "Tea Rosé": { category: "different", index: 4 },
        "Black": { category: "black_bg", index: 0 },
      };

      const selection = colorMap[e.detail];
      if (selection) {
        setSelectedCategory(selection.category);
        setActiveImage(selection.index);
      }
    };

    window.addEventListener('petSelectionChanged', handleCategoryChange);
    window.addEventListener('frameSelectionChanged', handleCategoryChange);
    window.addEventListener('backgroundSelectionChanged', handleBackgroundChange);
    
    return () => {
      window.removeEventListener('petSelectionChanged', handleCategoryChange);
      window.removeEventListener('frameSelectionChanged', handleCategoryChange);
      window.removeEventListener('backgroundSelectionChanged', handleBackgroundChange);
    };
  }, []);

  const currentImages = GALLERY_IMAGES[selectedCategory] || GALLERY_IMAGES.one;

  const handleDragEnd = (_: any, info: any) => {
    const swipeThreshold = 50;
    if (info.offset.x > swipeThreshold && activeImage > 0) {
      setActiveImage(activeImage - 1);
    } else if (info.offset.x < -swipeThreshold && activeImage < currentImages.length - 1) {
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
              src={currentImages[activeImage]}
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
          {currentImages.map((_, idx) => (
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
        {currentImages.map((img, idx) => (
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
