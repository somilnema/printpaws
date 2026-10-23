"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type AnnouncementBarProps = {
  /** Fixed messages, already checked by the server. Leave out for the shop's default rotation. */
  messages?: string[];
  colorClass?: string;
};

export function AnnouncementBar({ messages, colorClass = "bg-[#ff5959]" }: AnnouncementBarProps = {}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const [prepaidPercent, setPrepaidPercent] = useState<number | null>(null);

  useEffect(() => {
    if (messages) return;
    let cancelled = false;
    fetch("/api/pricing", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        const value = Number(data?.catalog?.prepaidPercent);
        if (!cancelled && Number.isFinite(value)) setPrepaidPercent(value);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [messages]);

  const announcements = messages ?? [
    "Forever Starts Here",
    "Refined Until Perfect",
    prepaidPercent && prepaidPercent > 0 ? `${prepaidPercent}% Off (Prepaid Orders)` : "",
  ].filter(Boolean);
  const rotates = announcements.length > 1;

  useEffect(() => {
    if (currentIndex >= announcements.length) setCurrentIndex(0);
  }, [announcements.length, currentIndex]);

  useEffect(() => {
    if (!rotates) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [announcements.length, rotates]);

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
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

  if (announcements.length === 0) return null;

  return (
    <div className={`${colorClass} text-white py-2 px-4 flex items-center justify-between text-[11px] sm:text-xs font-semibold tracking-wider uppercase select-none overflow-hidden relative`}>
      {rotates && (
        <button
          onClick={handlePrev}
          className="p-1 hover:opacity-80 transition-opacity z-10 cursor-pointer"
          aria-label="Previous announcement"
        >
          <ChevronLeft size={14} />
        </button>
      )}
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
            {announcements[currentIndex]}
          </motion.div>
        </AnimatePresence>
      </div>
      {rotates && (
        <button
          onClick={handleNext}
          className="p-1 hover:opacity-80 transition-opacity z-10 cursor-pointer"
          aria-label="Next announcement"
        >
          <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}
