export function trackPixel(event: string, payload?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const fbq = (window as any).fbq;
  if (typeof fbq !== "function") return;
  if (payload) fbq("track", event, payload);
  else fbq("track", event);
}
