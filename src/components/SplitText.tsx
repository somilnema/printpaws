"use client";

import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  splitType?: 'chars' | 'words' | 'lines';
  from?: any;
  to?: any;
  threshold?: number;
  rootMargin?: string;
  textAlign?: 'left' | 'center' | 'right';
  tag?: string;
  onLetterAnimationComplete?: () => void;
}

const SplitText = ({
  text,
  className = '',
  delay = 80,
  duration = 2.0,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 20 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-50px',
  textAlign = 'center',
  tag = 'p',
  onLetterAnimationComplete
}: SplitTextProps) => {
  const ref = useRef<any>(null);
  const onCompleteRef = useRef(onLetterAnimationComplete);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Keep callback ref updated
  useEffect(() => {
    onCompleteRef.current = onLetterAnimationComplete;
  }, [onLetterAnimationComplete]);

  useEffect(() => {
    const handleFonts = () => setFontsLoaded(true);
    if (typeof document !== 'undefined') {
      if (document.fonts.status === 'loaded') {
        handleFonts();
      } else {
        document.fonts.ready.then(handleFonts);
      }
    }
  }, []);

  useGSAP(
    () => {
      if (!ref.current || !text || !fontsLoaded) return;
      
      const el = ref.current;
      const targets = el.querySelectorAll('.split-char');
      if (targets.length === 0) return;

      const startPct = (1 - threshold) * 100;
      const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin);
      const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0;
      const marginUnit = marginMatch ? marginMatch[2] || 'px' : 'px';
      const sign =
        marginValue === 0
          ? ''
          : marginValue < 0
            ? `-=${Math.abs(marginValue)}${marginUnit}`
            : `+=${marginValue}${marginUnit}`;
      const start = `top ${startPct}%${sign}`;

      gsap.set(targets, { opacity: 0 });

      const tl = gsap.timeline({
        repeat: -1,
        repeatDelay: 1,
        scrollTrigger: {
          trigger: el,
          start,
          toggleActions: "play pause resume reset",
        },
      });

      tl.to(targets, {
        opacity: 1,
        duration: 0.1,
        ease: "none",
        stagger: 0.1,
      })
      .to({}, { duration: 3 }) // Pause at full text
      .to(targets, {
        opacity: 0,
        duration: 0.1,
        ease: "none",
        stagger: {
          each: 0.05,
          from: "end" // Erase from the end for natural feel
        }
      });
    },
    {
      dependencies: [
        text,
        delay,
        duration,
        ease,
        splitType,
        JSON.stringify(from),
        JSON.stringify(to),
        threshold,
        rootMargin,
        fontsLoaded
      ],
      scope: ref
    }
  );

  const Tag = tag as any;

  return (
    <Tag 
      ref={ref} 
      style={{ 
        textAlign, 
        overflow: 'hidden', 
        display: 'inline-block',
        whiteSpace: 'normal',
        wordWrap: 'break-word',
        opacity: fontsLoaded ? 1 : 0
      }} 
      className={`split-parent ${className}`}
    >
      {text.split(' ').map((word, i) => (
        <span key={i} className="split-word" style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
          {word.split('').map((char, j) => (
            <span key={j} className="split-char" style={{ display: 'inline-block', opacity: 0 }}>
              {char}
            </span>
          ))}
          <span className="split-space">&nbsp;</span>
        </span>
      ))}
    </Tag>
  );
};

export default SplitText;
