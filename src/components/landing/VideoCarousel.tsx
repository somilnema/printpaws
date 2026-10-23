"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { VIDEO_SECTION } from "@/lib/landing-content";
import { CAROUSEL_ROW, CarouselDots, useCarouselIndex } from "./Carousel";

export type VideoClip = { src: string; caption: string };

export function VideoCarousel({ clips }: { clips: VideoClip[] }) {
  const { ref, index, onScroll, goTo } = useCarouselIndex(clips.length);
  const [playing, setPlaying] = useState<number | null>(null);

  if (clips.length === 0) return null;

  return (
    <section className="pt-14 md:pt-20">
      <header className="mx-auto max-w-xl px-4 text-center">
        <h2 className="font-playfair text-[26px] font-semibold leading-tight text-cocoa md:text-4xl">{VIDEO_SECTION.title}</h2>
        <p className="mt-2 text-sm text-cocoa/75 md:text-base">{VIDEO_SECTION.text}</p>
      </header>

      <div ref={ref} onScroll={onScroll} className={`${CAROUSEL_ROW} mx-auto mt-6 max-w-6xl gap-2.5 md:gap-4`}>
        {clips.map((clip, i) => (
          <VideoCard
            key={clip.src}
            clip={clip}
            playing={playing === i}
            onPlay={() => setPlaying(i)}
            onPause={() => setPlaying((current) => (current === i ? null : current))}
          />
        ))}
      </div>
      <CarouselDots count={clips.length} index={index} label="Show video" onSelect={goTo} />
    </section>
  );
}

function VideoCard({
  clip,
  playing,
  onPlay,
  onPause,
}: {
  clip: VideoClip;
  playing: boolean;
  onPlay: () => void;
  onPause: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);

  // Nothing downloads until the card is close; then only the first frame, as a poster.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setNear(true);
        else if (!el.paused) el.pause();
      },
      { rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // One clip at a time.
  useEffect(() => {
    const el = videoRef.current;
    if (el && !playing && !el.paused) el.pause();
  }, [playing]);

  const toggle = () => {
    const el = videoRef.current;
    if (!el) return;
    if (!el.paused) {
      el.pause();
      return;
    }
    // Called straight from the tap so phones allow sound on clips that have it.
    el.play().catch(() => {});
  };

  return (
    <div className="relative aspect-[9/16] w-[38vw] max-w-[220px] shrink-0 snap-start overflow-hidden rounded-2xl bg-cocoa/10">
      <video
        ref={videoRef}
        src={near ? `${clip.src}#t=0.1` : undefined}
        preload="metadata"
        playsInline
        loop
        onPlay={onPlay}
        onPause={onPause}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/65 to-transparent" />
      <button
        type="button"
        onClick={toggle}
        aria-label={`${playing ? "Pause" : "Play"} video: ${clip.caption}`}
        className="absolute inset-0 flex items-center justify-center"
      >
        {playing ? (
          <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm">
            <Pause aria-hidden size={13} className="fill-white" />
          </span>
        ) : (
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-black/35 text-white backdrop-blur-sm">
            <Play aria-hidden size={18} className="ml-0.5 fill-white" />
          </span>
        )}
      </button>
      <p className="pointer-events-none absolute inset-x-3 bottom-3 text-[13px] font-semibold leading-tight text-white">{clip.caption}</p>
    </div>
  );
}
