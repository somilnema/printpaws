import Link from "next/link";

export const DESKS = [
  { id: "admin", href: "/admin", label: "Admin", note: "Orders, prices, and coupons" },
  { id: "artist", href: "/artist", label: "Artist", note: "Assigned portraits" },
  { id: "shipment", href: "/shipment", label: "Shipment", note: "Tracking and delivery" },
] as const;

export type DeskId = (typeof DESKS)[number]["id"];

export function DeskSwitch({
  current,
  stacked = false,
  compact = false,
}: {
  current: DeskId;
  stacked?: boolean;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {DESKS.map((desk) => {
          const active = desk.id === current;
          return (
            <Link
              key={desk.id}
              href={desk.href}
              aria-current={active ? "page" : undefined}
              className={`rounded-xl px-2 py-2 text-center text-sm font-semibold ${
                active
                  ? "bg-primary text-white shadow-[0_8px_18px_rgba(28,36,52,0.18)]"
                  : "border border-[#e5e7eb] bg-white text-[#1a1a1b] hover:border-[#1a1a1b]"
              }`}
            >
              {desk.label}
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 gap-2 ${stacked ? "" : "md:grid-cols-3"}`}>
      {DESKS.map((desk) => {
        const active = desk.id === current;
        return (
          <Link
            key={desk.id}
            href={desk.href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left ${
              active
                ? "bg-primary text-white shadow-[0_10px_24px_rgba(28,36,52,0.18)]"
                : "border border-[#e5e7eb] bg-white text-[#1a1a1b] shadow-[0_6px_16px_rgba(15,23,42,0.04)] hover:border-[#1a1a1b]"
            }`}
          >
            <span className="min-w-0">
              <span className="block text-sm font-semibold">{desk.label}</span>
              <span className={`mt-0.5 block text-xs ${active ? "text-white/70" : "text-[#6b7280]"}`}>{desk.note}</span>
            </span>
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${
                active ? "bg-white text-[#1a1a1b]" : "bg-primary text-white"
              }`}
              aria-hidden
            >
              →
            </span>
          </Link>
        );
      })}
    </div>
  );
}

export function sectionTabClass(active: boolean) {
  return `shrink-0 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
    active ? "bg-primary text-white shadow-sm" : "bg-white text-[#4b5563] ring-1 ring-[#e5e7eb] hover:text-primary hover:ring-primary"
  }`;
}
