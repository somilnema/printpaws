"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ANNOUNCEMENTS = [
  "Forever Starts Here",
  "Refined Until Perfect",
  "10% Off (Prepaid Orders)",
];

export function AnnouncementBar() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 4000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + ANNOUNCEMENTS.length) % ANNOUNCEMENTS.length);
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
  };

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -100 : 100,
      opacity: 0,
    }),
  };

  return (
    <div className="bg-[#ff5959] text-white py-2 px-4 flex items-center justify-between text-[11px] sm:text-xs font-semibold tracking-wider uppercase select-none overflow-hidden relative">
      <button 
        onClick={handlePrev} 
        className="p-1 hover:opacity-80 transition-opacity z-10 cursor-pointer"
        aria-label="Previous announcement"
      >
        <ChevronLeft size={14} />
      </button>
      <div className="flex-1 text-center relative h-5 flex items-center justify-center overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full text-center"
          >
            {ANNOUNCEMENTS[currentIndex]}
          </motion.div>
        </AnimatePresence>
      </div>
      <button 
        onClick={handleNext} 
        className="p-1 hover:opacity-80 transition-opacity z-10 cursor-pointer"
        aria-label="Next announcement"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
