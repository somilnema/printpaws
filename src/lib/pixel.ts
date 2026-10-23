export function trackPixel(event: string, payload?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const fbq = (window as any).fbq;
  if (typeof fbq !== "function") return;
  if (payload) fbq("track", event, payload);
  else fbq("track", event);
}

/** Our own events (not one of Meta's standard ones), e.g. a landing card tap. */
export function trackCustomPixel(event: string, payload?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const fbq = (window as any).fbq;
  if (typeof fbq !== "function") return;
  if (payload) fbq("trackCustom", event, payload);
  else fbq("trackCustom", event);
}
