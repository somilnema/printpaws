"use client";

import type { ReactNode } from "react";

export const PORTRAITS_ANCHOR = "portraits";

export function scrollToPortraits() {
  const target = document.getElementById(PORTRAITS_ANCHOR);
  if (!target) return false;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  return true;
}

/** A plain #portraits link that glides instead of jumping. */
export function ScrollToPortraits({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <a
      href={`#${PORTRAITS_ANCHOR}`}
      className={className}
      onClick={(event) => {
        if (scrollToPortraits()) event.preventDefault();
      }}
    >
      {children}
    </a>
  );
}
