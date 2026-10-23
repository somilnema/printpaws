"use client";

import { useRef, useState } from "react";

export const CAROUSEL_ROW =
  "flex snap-x snap-mandatory scroll-px-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:scroll-px-6 md:px-6";

/** Which card a swipe row is on, measured over the whole scroll range so the last dot is reachable. */
export function useCarouselIndex(count: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const range = () => {
    const el = ref.current;
    return el ? el.scrollWidth - el.clientWidth : 0;
  };

  const onScroll = () => {
    const el = ref.current;
    const max = range();
    if (!el || count < 2 || max <= 0) return;
    setIndex(Math.round((el.scrollLeft / max) * (count - 1)));
  };

  const goTo = (target: number) => {
    if (count < 2) return;
    ref.current?.scrollTo({ left: (range() * target) / (count - 1), behavior: "smooth" });
  };

  return { ref, index, onScroll, goTo };
}

export function CarouselDots({
  count,
  index,
  label,
  onSelect,
}: {
  count: number;
  index: number;
  label: string;
  onSelect: (index: number) => void;
}) {
  if (count < 2) return null;
  return (
    <div className="mt-3 flex justify-center">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`${label} ${i + 1}`}
          aria-current={i === index}
          onClick={() => onSelect(i)}
          className="p-1.5"
        >
          <span
            className={`block h-1.5 rounded-full transition-all duration-300 ${i === index ? "w-5 bg-terracotta" : "w-1.5 bg-cocoa/20"}`}
          />
        </button>
      ))}
    </div>
  );
}
