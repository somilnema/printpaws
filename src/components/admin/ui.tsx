import type { ReactNode } from "react";

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
      <span className="block text-xs font-medium text-[#667085]">{label}</span>
      {children}
      {hint ? <span className="block text-[11px] text-[#98a2b3] leading-snug">{hint}</span> : null}
    </label>
  );
}

export const inputClass =
  "w-full rounded-sm border border-[#e4e7ec] bg-white px-3 py-2 text-sm text-[#1c2434] outline-none focus:border-[#2F6BFF]";

export const buttonClass =
  "rounded-sm bg-[#2F6BFF] px-3.5 py-2 text-sm font-semibold text-white disabled:opacity-50";

export const ghostButtonClass =
  "rounded-sm border border-[#e4e7ec] bg-white px-3 py-2 text-sm font-medium text-[#1c2434] disabled:opacity-50";

export const warnClass = "rounded-sm bg-[#fff7e8] px-3 py-2 text-sm text-[#8a5a00]";
export const errorClass = "rounded-sm bg-[#fff1f1] px-3 py-2 text-sm text-[#b42318]";
export const okClass = "rounded-sm bg-[#eefbf3] px-3 py-2 text-sm text-[#067647]";

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
    <section className="rounded-sm border border-[#e6e8ee] bg-white p-4">
      <header className="mb-4">
        <h2 className="text-lg font-semibold tracking-tight text-[#1c2434]">{title}</h2>
        {note ? <p className="mt-1 text-sm text-[#98a2b3] leading-relaxed">{note}</p> : null}
      </header>
      {children}
    </section>
  );
}
