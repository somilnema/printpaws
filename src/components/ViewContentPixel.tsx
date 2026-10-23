"use client";

import { useEffect } from "react";
import { trackPixel } from "@/lib/pixel";

/** ViewContent for a product page. The pixel script loads after the page, so wait for it briefly. */
export function ViewContentPixel({ id, name }: { id: string; name: string }) {
  useEffect(() => {
    let tries = 0;
    const timer = window.setInterval(() => {
      tries += 1;
      if (typeof (window as any).fbq !== "function" && tries < 20) return;
      window.clearInterval(timer);
      trackPixel("ViewContent", { content_ids: [id], content_name: name, content_type: "product" });
    }, 250);
    return () => window.clearInterval(timer);
  }, [id, name]);

  return null;
}
