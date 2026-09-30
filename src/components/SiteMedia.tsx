"use client";

import { createContext, useContext, type ReactNode } from "react";
import { resolveMediaUrl } from "@/lib/site-media-catalog";

const SiteMediaContext = createContext<Record<string, string>>({});

export function SiteMediaProvider({
  overrides,
  children,
}: {
  overrides: Record<string, string>;
  children: ReactNode;
}) {
  return <SiteMediaContext.Provider value={overrides}>{children}</SiteMediaContext.Provider>;
}

/** Resolve a gallery key to the admin replacement, or the original file. */
export function useMedia() {
  const overrides = useContext(SiteMediaContext);
  return (key: string) => resolveMediaUrl(key, overrides);
}
