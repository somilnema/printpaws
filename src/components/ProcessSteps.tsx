"use client";

import { Camera, Palette, Box } from "lucide-react";

const STEPS = [
  {
    icon: <Camera size={32} className="text-white" />,
    title: "Upload a cute photo",
    desc: "Pick your favorite photo of your pet and upload it above.",
    bg: "bg-[#A87B62]",
  },
  {
    icon: <Palette size={32} className="text-white" />,
    title: "We design it",
    desc: "Our artists will hand-draw your pet with incredible detail.",
    bg: "bg-[#2F2F2F]",
  },
  {
    icon: <Box size={32} className="text-white" />,
    title: "You approve it",
    desc: "We send you a preview to approve before we print and ship.",
    bg: "bg-[#A87B62]",
  },
];

export function ProcessSteps() {
  return (
    <div className="py-12 bg-gray-50 rounded-3xl px-8 my-12">
      <h2 className="text-2xl font-black text-center uppercase italic mb-10 tracking-tight">How it works?</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {STEPS.map((step, i) => (
          <div key={i} className="flex flex-col items-center text-center group">
            <div className={`w-16 h-16 ${step.bg} rounded-3xl flex items-center justify-center mb-6 shadow-xl transition-transform group-hover:scale-110 group-hover:rotate-3`}>
              {step.icon}
            </div>
            <h3 className="text-lg font-bold uppercase mb-2">{step.title}</h3>
            <p className="text-sm text-gray-500 font-poppins px-4">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
