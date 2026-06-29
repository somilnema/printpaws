"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const HEADLINES = [
  "Turn Your Favorite Pet Photo Into  Beautiful Hand-Painted Portrait",
   "They're More Than Pets. They're Family..."

];

export function RotatingHeadline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentText, setCurrentText] = useState(HEADLINES[0]);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const ctx = gsap.context(() => {
      const runCycle = (index: number) => {
        setCurrentText(HEADLINES[index]);
        
        // Wait briefly for React DOM update before grabbing characters
        setTimeout(() => {
          const chars = containerRef.current?.querySelectorAll(".rotate-char");
          if (!chars || chars.length === 0) return;
          
          const tl = gsap.timeline({
            onComplete: () => {
              // Infinite loop chain: start next headline cycle once this one is fully animated out
              runCycle((index + 1) % HEADLINES.length);
            }
          });
          
          // 1. Initial State (shifted down slightly for a sleek rise)
          gsap.set(chars, { opacity: 0, y: 12 });
          
          // 2. Animate letters IN (Sleek, snappy stagger)
          tl.to(chars, {
            opacity: 1,
            y: 0,
            duration: 0.25,
            ease: "power2.out",
            stagger: 0.025 // 25ms per character
          })
          // 3. Hold headline for readable duration
          .to({}, { duration: 2.0 })
          // 4. Animate letters OUT (Beautiful letter-by-letter wipe from the end!)
          .to(chars, {
            opacity: 0,
            y: -12,
            duration: 0.2,
            ease: "power2.in",
            stagger: {
              each: 0.015, // Snappy fade-out stagger
              from: "end"  // Wipe from right-to-left for a gorgeous natural flow
            }
          });
        }, 50);
      };
      
      runCycle(0);
    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <h1
      ref={containerRef}
      className="text-3xl md:text-4xl font-normal text-[#1a1a1b] leading-tight font-playfair tracking-tight text-center min-h-[96px] flex items-start justify-center pt-1 px-4 translate-y-[-25px]"
    >
      <span className="inline-block">
        {currentText.split(" ").map((word, wIdx) => (
          <span key={wIdx} className="inline-block whitespace-nowrap mr-2">
            {word.split("").map((char, cIdx) => (
              <span key={cIdx} className="rotate-char inline-block opacity-0">
                {char}
              </span>
            ))}
          </span>
        ))}
      </span>
    </h1>
  );
}
