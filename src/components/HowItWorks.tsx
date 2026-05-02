"use client";

import Image from "next/image";
import { Check } from "lucide-react";

const STEPS = [
  {
    title: "Upload your pet’s photo",
    description: "Choose your size, frame, and share the photo you love the most. We’ll take it from there.",
  },
  {
    title: "See them come to life",
    description: "Within 48 hours, you’ll receive your portrait preview. We refine every detail with you - until it truly feels like them.",
  },
  {
    title: "Keep them close, forever",
    description: "Once approved, we print and deliver your portrait to your doorstep - ready to become a part of your everyday life.",
  },
];

export function HowItWorks() {
  return (
    <section className="pt-6 pb-12 md:pt-8 md:pb-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="bg-white lg:bg-[#f8f9fa] rounded-[2rem] lg:rounded-[3rem] overflow-hidden flex flex-col lg:flex-row shadow-sm border border-gray-100 lg:border-none">
          {/* Left: Image Section */}
          <div className="w-full lg:w-1/2 relative h-[350px] md:h-[450px] lg:h-[600px]">
            <Image
              src="/how-it-works.png"
              alt="Custom pet portrait process"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>

          {/* Right: Steps Section */}
          <div className="w-full lg:w-1/2 px-6 py-12 md:p-12 lg:p-20 bg-white">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-10 text-[#1a1a1b] font-playfair">
              How it works?
            </h2>

            <div className="space-y-10">
              {STEPS.map((step, index) => (
                <div key={index} className="flex gap-5 md:gap-6 items-start">
                  <div className="flex-shrink-0 w-10 h-10 md:w-11 md:h-11 rounded-full border-2 border-gray-800 flex items-center justify-center mt-1">
                    <Check className="w-5 h-5 md:w-6 md:h-6 text-gray-800 stroke-[3]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1 lg:mb-2 font-playfair uppercase tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed font-inter">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
