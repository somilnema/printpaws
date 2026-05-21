"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { getCloudinaryUrl } from "@/utils/cloudinary";

const GALLERY_IMAGES: Record<string, string[]> = {
  // Pets (Section 1)
  one: ["/Section 1/1.jpg", "/Section 1/2.jpg", "/Section 1/3.jpg", "/Section 1/4.jpg", "/Section 1/5.jpg"],
  two: ["/Section 1/6.jpg", "/Section 1/7.jpg", "/Section 1/8.jpg", "/Section 1/9.jpg"],
  three: ["/Section 1/10.jpg", "/Section 1/11.jpg", "/Section 1/12.jpg"],
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
  const [selectedFrame, setSelectedFrame] = useState("black");
  const [selectedBgImage, setSelectedBgImage] = useState("/bg7.png");

  useEffect(() => {
    const handleCategoryChange = (e: any) => {
      setSelectedCategory(e.detail);
      setActiveImage(0); // Reset to first image when category changes
    };

    const handleBackgroundChange = (e: any) => {
      if (e.detail === "bg7" || e.detail === "bg8" || e.detail === "bg9") {
        setSelectedCategory("custom_bg");
        setSelectedBgImage(`/${e.detail}.png`);
      } else {
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
      }
    };

    const handleFrameChange = (e: any) => {
      const frameList = ["black", "white", "wood", "canva"];
      if (frameList.includes(e.detail)) {
        setSelectedFrame(e.detail);
      }
    };

    window.addEventListener('petSelectionChanged', handleCategoryChange);
    window.addEventListener('frameSelectionChanged', handleCategoryChange);
    window.addEventListener('frameSelectionChanged', handleFrameChange);
    window.addEventListener('backgroundSelectionChanged', handleBackgroundChange);
    
    return () => {
      window.removeEventListener('petSelectionChanged', handleCategoryChange);
      window.removeEventListener('frameSelectionChanged', handleCategoryChange);
      window.removeEventListener('frameSelectionChanged', handleFrameChange);
      window.removeEventListener('backgroundSelectionChanged', handleBackgroundChange);
    };
  }, []);

  const currentImages = GALLERY_IMAGES[selectedCategory] || GALLERY_IMAGES.one;
  const isMultiPet = selectedCategory === "two" || selectedCategory === "three" || selectedCategory === "four";

  const handleDragEnd = (_: any, info: any) => {
    if (selectedCategory === "custom_bg") return;
    const swipeThreshold = 50;
    if (info.offset.x > swipeThreshold && activeImage > 0) {
      setActiveImage(activeImage - 1);
    } else if (info.offset.x < -swipeThreshold && activeImage < currentImages.length - 1) {
      setActiveImage(activeImage + 1);
    }
  };

  // Dynamic realistic frame styles matching premium mockups
  const getFrameStyles = () => {
    switch (selectedFrame) {
      case "white":
        return {
          border: "16px solid #ffffff",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.2), inset 0 2px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.05)",
          borderRadius: "4px",
        };
      case "wood":
        return {
          border: "16px solid #966A50",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.08)",
          borderRadius: "4px",
        };
      case "canva":
        return {
          border: "2px solid #e5e7eb",
          boxShadow: "0 30px 60px -15px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255,255,255,0.4)",
          borderRadius: "2px",
        };
      case "black":
      default:
        return {
          border: "16px solid #1a1a1b",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(255,255,255,0.05), 0 0 0 1px rgba(0,0,0,0.15)",
          borderRadius: "4px",
        };
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image Container */}
      <div className="relative -mx-4 w-screen aspect-[3/4] md:mx-0 md:w-full md:aspect-square overflow-hidden bg-white rounded-none md:rounded-3xl shadow-sm">
        <AnimatePresence mode="wait">
          {selectedCategory === "custom_bg" ? (
            <motion.div
              key={selectedBgImage}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="relative w-full h-full flex items-center justify-center p-6 md:p-12 bg-gray-50/50"
            >
              {/* Realistic Shadowed Premium Frame */}
              <div 
                className="relative w-full h-full max-w-[85%] max-h-[85%] aspect-[3/4] overflow-hidden flex items-center justify-center transition-all duration-500"
                style={getFrameStyles()}
              >
                {/* Print Content Area with Passepartout (Mat Board) effect */}
                <div 
                  className="w-full h-full p-4 md:p-8 flex items-center justify-center shadow-inner relative"
                  style={{
                    backgroundImage: `url(${getCloudinaryUrl(selectedBgImage)})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {/* Subtle lighting overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/5 via-transparent to-white/10 pointer-events-none" />

                  {/* Pet Portrait overlay */}
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Image
                      src={getCloudinaryUrl("/dog_portrait_closeup_1773940826280.png")}
                      alt="Pet Portrait Overlay"
                      width={320}
                      height={400}
                      className="object-contain max-h-[92%] drop-shadow-[0_20px_25px_rgba(0,0,0,0.3)] select-none transition-transform duration-500 hover:scale-[1.03]"
                      priority
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
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
                src={getCloudinaryUrl(currentImages[activeImage])}
                alt={`Pet Portrait ${activeImage + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className={`select-none ${isMultiPet ? "object-contain" : "object-cover"}`}
                priority
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Mobile Pagination Dots */}
        {selectedCategory !== "custom_bg" && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2.5 md:hidden z-20">
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
        )}
      </div>

      {/* Desktop Thumbnails (Hidden on Mobile) */}
      <div className="hidden md:flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {selectedCategory === "custom_bg" ? (
          [
            { id: "bg7", path: "/bg7.png" },
            { id: "bg8", path: "/bg8.png" },
            { id: "bg9", path: "/bg9.png" },
          ].map((bgItem) => (
            <button
              key={bgItem.id}
              onClick={() => {
                setSelectedBgImage(bgItem.path);
                window.dispatchEvent(new CustomEvent('backgroundSelectionChanged', { detail: bgItem.id }));
              }}
              className={`relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border-[2.5px] transition-all duration-300 ${
                selectedBgImage === bgItem.path 
                  ? "border-primary shadow-lg scale-[1.02]" 
                  : "border-transparent opacity-50 hover:opacity-100"
              }`}
            >
              <Image
                src={getCloudinaryUrl(bgItem.path)}
                alt={bgItem.id}
                fill
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))
        ) : (
          currentImages.map((img, idx) => (
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
                src={getCloudinaryUrl(img)}
                alt={`Thumbnail ${idx + 1}`}
                fill
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))
        )}
      </div>
    </div>
  );
}
