"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Play, Volume2, VolumeX } from "lucide-react";
import { useMedia, useUploadedMedia } from "@/components/SiteMedia";

type Slide = { kind: "image" | "video"; src: string };

const GALLERY_IMAGES: Record<string, string[]> = {
  // Pets (Section 1)
  one: ["Main Image.png","2nd Image.png","3rd Image.png","4th Image (2).png","5th Image.png","6th Image.png","7th Image.png","8th Image.png","9th Image.png","10th Image.png"],
  two: ["Main Image.png","2nd Image.png","3rd Image.png"],
  three: ["Main Image.png","2nd Image.png","3rd Image.png"],
  four: ["Main Image.png","2nd Image.png","3rd Image.png"],
  
  // Frames (Section 2)
  black: ["Main Image.png","2nd Image.png"],
  white: ["Main Image.png","2nd Image.png"],
  wood: ["Main Image.png","2nd Image.png"],
  canva: ["6th Image.png", "3rd Image.png"],

  // Sizes
  framed_size: ["4th Image (2).png"],
  canvas_size: ["5th Image.png", "3rd Image.png"],

  // Backgrounds (Section 3)
  different: ["Main Image.png","2nd Image.png","3rd Image.png"],
  black_bg: ["Main Image.png","2nd Image.png","3rd Image.png"],
};

export function ProductGallery() {
  const media = useMedia();
  const processVideo = useUploadedMedia("gallery-video");
  const [activeImage, setActiveImage] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("one");
  const [selectedFrame, setSelectedFrame] = useState("black");
  const [selectedBgImage, setSelectedBgImage] = useState("/bg7.png");
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    // Selections refer to photo positions; the process video sits after photo 1.
    const showPhoto = (index: number) => setActiveImage(processVideo && index >= 1 ? index + 1 : index);

    const handleCategoryChange = (e: any) => {
      setSelectedCategory("one");
      setActiveImage(0);
    };

    const handleBackgroundChange = (e: any) => {
      if (e.detail === "bg7" || e.detail === "bg8" || e.detail === "bg9") {
        setSelectedCategory("custom_bg");
        setSelectedBgImage(`/${e.detail}.png`);
      } else {
        setSelectedCategory("one");
        const colorMap: Record<string, number> = {
          "Pearl": 0,
          "Almond": 1,
          "Serenity": 2,
          "Celadon": 3, // 4th Image
          "Tea Rosé": 4, // 5th Image
          "Black": 0,
        };
        showPhoto(colorMap[e.detail] !== undefined ? colorMap[e.detail] : 0);
      }
    };

    const handleFrameChange = (e: any) => {
      setSelectedFrame(e.detail);
      if (e.detail === "canva") {
        setSelectedCategory("one");
        showPhoto(5); // 6th Image
      } else {
        setSelectedCategory("one");
        setActiveImage(0); // Main Image
      }
    };

    const handleSizeChange = (e: any) => {
      if (e.detail === "framed_size") {
        setSelectedCategory("one");
        showPhoto(3); // 4th Image
      } else if (e.detail === "canvas_size") {
        setSelectedCategory("one");
        showPhoto(4); // 5th Image
      }
    };

    window.addEventListener('petSelectionChanged', handleCategoryChange);
    window.addEventListener('frameSelectionChanged', handleFrameChange);
    window.addEventListener('backgroundSelectionChanged', handleBackgroundChange);
    window.addEventListener('sizeSelectionChanged', handleSizeChange);
    
    return () => {
      window.removeEventListener('petSelectionChanged', handleCategoryChange);
      window.removeEventListener('frameSelectionChanged', handleFrameChange);
      window.removeEventListener('backgroundSelectionChanged', handleBackgroundChange);
      window.removeEventListener('sizeSelectionChanged', handleSizeChange);
    };
  }, [processVideo]);

  const currentImages = GALLERY_IMAGES[selectedCategory] || GALLERY_IMAGES.one;
  const slides: Slide[] = currentImages.map((img) => ({ kind: "image", src: media(img) }));
  if (processVideo) slides.splice(1, 0, { kind: "video", src: processVideo });
  const activeSlide = slides[activeImage] || slides[0];
  const isMultiPet = selectedCategory === "two" || selectedCategory === "three" || selectedCategory === "four";

  const handleDragEnd = (_: any, info: any) => {
    if (selectedCategory === "custom_bg") return;
    const swipeThreshold = 50;
    if (info.offset.x > swipeThreshold && activeImage > 0) {
      setActiveImage(activeImage - 1);
    } else if (info.offset.x < -swipeThreshold && activeImage < slides.length - 1) {
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
    <div className="flex flex-col gap-4 items-center">
      {/* Main Image Container */}
      <div className="relative -mx-4 w-screen aspect-[3/4] md:mx-auto md:w-full md:max-w-[640px] md:aspect-square overflow-hidden bg-white rounded-none md:rounded-3xl shadow-sm">
        <AnimatePresence>
          {selectedCategory === "custom_bg" ? (
            <motion.div
              key={selectedBgImage}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute inset-0 w-full h-full flex items-center justify-center p-6 md:p-12 bg-gray-50/50"
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
                    backgroundImage: `url(${media(selectedBgImage)})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {/* Subtle lighting overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/5 via-transparent to-white/10 pointer-events-none" />

                  {/* Pet Portrait overlay */}
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Image
                      src={media("/dog_portrait_closeup_1773940826280.png")}
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
              className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
            >
              {activeSlide.kind === "video" ? (
                <>
                  <video
                    src={activeSlide.src}
                    autoPlay
                    loop
                    muted={muted}
                    playsInline
                    preload="metadata"
                    className="pointer-events-none h-full w-full select-none object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setMuted((value) => !value)}
                    onPointerDownCapture={(e) => e.stopPropagation()}
                    className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm"
                    aria-label={muted ? "Unmute video" : "Mute video"}
                  >
                    {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                </>
              ) : (
                <Image
                  src={activeSlide.src}
                  alt={`Pet Portrait ${activeImage + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 640px, 640px"
                  className="select-none transition-transform duration-300 object-cover"
                  priority
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Mobile Pagination Dots */}
        {selectedCategory !== "custom_bg" && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2.5 md:hidden z-20">
            {slides.map((_, idx) => (
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

      {/* Thumbnails */}
      <div className="flex gap-3 overflow-x-auto w-full md:max-w-[640px] px-4 md:px-0 py-2 hide-scrollbar scroll-smooth snap-x">
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
                src={media(bgItem.path)}
                alt={bgItem.id}
                fill
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))
        ) : (
          slides.map((slide, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImage(idx)}
              className={`relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border-[2.5px] transition-all duration-300 ${
                activeImage === idx 
                  ? "border-primary shadow-lg scale-[1.02]" 
                  : "border-transparent opacity-50 hover:opacity-100"
              }`}
              aria-label={slide.kind === "video" ? "Play how the art is made" : undefined}
            >
              {slide.kind === "video" ? (
                <>
                  <video
                    src={`${slide.src}#t=0.1`}
                    muted
                    playsInline
                    preload="metadata"
                    className="pointer-events-none h-full w-full object-cover"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow">
                      <Play size={14} className="ml-0.5 fill-[#1a1a1b] text-[#1a1a1b]" />
                    </span>
                  </span>
                </>
              ) : (
                <Image
                  src={slide.src}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
