"use client";

import { Check } from "lucide-react";

const STEPS = [
  { id: 1, label: "Portrait" },
  { id: 2, label: "Customize" },
  { id: 3, label: "Upload" },
] as const;

type ConfiguratorProgressProps = {
  currentStep: number;
};

/** Three-circle tracker: Portrait → Customize → Upload (Everyday Pet Portrait). */
export function ConfiguratorProgress({ currentStep }: ConfiguratorProgressProps) {
  const step = Math.min(Math.max(currentStep, 1), 3);

  return (
    <nav aria-label="Configurator progress" className="w-full">
      <ol className="flex items-start justify-between gap-1">
        {STEPS.map((item, index) => {
          const complete = step > item.id;
          const current = step === item.id;
          const upcoming = step < item.id;
          return (
            <li key={item.id} className="flex flex-1 items-start min-w-0">
              <div className="flex w-full flex-col items-center gap-1.5">
                <div className="flex w-full items-center">
                  {index > 0 ? (
                    <span
                      aria-hidden
                      className={`h-0.5 flex-1 ${complete || current ? "bg-[#A97659]" : "bg-[#E3DDD7]"}`}
                    />
                  ) : (
                    <span className="flex-1" />
                  )}
                  <span
                    className={`relative z-[1] flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                      complete || current
                        ? "bg-[#A97659] text-white"
                        : "bg-[#E3DDD7] text-[#77716C]"
                    }`}
                    aria-current={current ? "step" : undefined}
                  >
                    {complete ? <Check size={14} strokeWidth={3} /> : item.id}
                  </span>
                  {index < STEPS.length - 1 ? (
                    <span
                      aria-hidden
                      className={`h-0.5 flex-1 ${complete ? "bg-[#A97659]" : "bg-[#E3DDD7]"}`}
                    />
                  ) : (
                    <span className="flex-1" />
                  )}
                </div>
                <span
                  className={`text-[11px] font-semibold leading-tight text-center ${
                    upcoming ? "text-[#77716C]" : "text-[#292522]"
                  }`}
                >
                  {item.label}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
