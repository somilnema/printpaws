"use client";

import { forwardRef, useEffect, useRef } from "react";

type ViewportVideoProps = React.VideoHTMLAttributes<HTMLVideoElement> & {
  src: string;
};

/**
 * Same autoplay / loop / mute behavior as a normal video, but the file
 * is fetched only once the clip is near the screen.
 */
export const ViewportVideo = forwardRef<HTMLVideoElement, ViewportVideoProps>(
  function ViewportVideo({ src, className, autoPlay = true, ...props }, forwardedRef) {
    const innerRef = useRef<HTMLVideoElement>(null);

    const setRefs = (node: HTMLVideoElement | null) => {
      innerRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    };

    useEffect(() => {
      const el = innerRef.current;
      if (!el || !src) return;

      let loaded = false;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry) return;
          if (entry.isIntersecting) {
            if (!loaded) {
              el.src = src;
              loaded = true;
            }
            if (autoPlay) el.play().catch(() => {});
          } else if (loaded) {
            el.pause();
          }
        },
        { rootMargin: "500px 0px", threshold: 0.01 }
      );

      observer.observe(el);
      return () => observer.disconnect();
    }, [src, autoPlay]);

    return (
      <video
        ref={setRefs}
        className={className}
        muted
        loop
        playsInline
        preload="none"
        {...props}
      />
    );
  }
);
