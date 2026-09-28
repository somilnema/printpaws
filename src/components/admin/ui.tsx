import type { ReactNode } from "react";
import Image from "next/image";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-xs font-medium text-[#6b7280]">{label}</span>
      {children}
      {hint ? <span className="block text-[11px] text-[#9ca3af] leading-snug">{hint}</span> : null}
    </label>
  );
}

export function DeskLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`relative block h-[46px] w-[136px] shrink-0 overflow-hidden sm:h-[56px] sm:w-[164px] ${className}`}>
      <Image
        src="/IMG_4060.PNG"
        alt="Peternity"
        width={1024}
        height={683}
        priority
        className="absolute left-[-8px] top-[-21px] h-auto w-[148px] max-w-none sm:left-[-10px] sm:top-[-26px] sm:w-[180px]"
      />
    </span>
  );
}

export const inputClass =
  "w-full rounded-xl border border-[#e5e7eb] bg-white px-3.5 py-2.5 text-sm text-[#1a1a1b] outline-none transition-colors placeholder:text-[#9ca3af] focus:border-primary focus:ring-2 focus:ring-primary/15";

export const buttonClass =
  "rounded-xl bg-primary px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-sm transition-all hover:bg-primary-dark active:scale-[0.98] disabled:opacity-50";

export const ghostButtonClass =
  "rounded-xl border border-[#e5e7eb] bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-[#1a1a1b] transition-colors hover:border-primary hover:text-primary disabled:opacity-50";

export const warnClass = "rounded-xl bg-[#fff7e8] px-3.5 py-2.5 text-sm text-[#8a5a00]";
export const errorClass = "rounded-xl bg-[#fff1f1] px-3.5 py-2.5 text-sm text-[#b42318]";
export const okClass = "rounded-xl bg-[#eefbf3] px-3.5 py-2.5 text-sm text-[#067647]";

export function Panel({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-[#eeeeee] bg-white p-5 shadow-sm">
      <header className="mb-4">
        <h2 className="text-xl font-bold tracking-tight text-[#1a1a1b]">{title}</h2>
        {note ? <p className="mt-1 text-sm text-[#9ca3af] leading-relaxed">{note}</p> : null}
      </header>
      {children}
    </section>
  );
}
