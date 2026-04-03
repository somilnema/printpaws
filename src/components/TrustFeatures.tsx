"use client";

import { 
  Users, 
  ShieldCheck, 
  Infinity, 
  CheckCircle 
} from "lucide-react";

const FEATURES = [
  {
    icon: <Users size={36} className="text-[#1a1a1b]" strokeWidth={1.5} />,
    title: "Customer\nSatisfaction",
    description: "We're not happy until you are. Every order comes with our full support"
  },
  {
    icon: <ShieldCheck size={36} className="text-[#1a1a1b]" strokeWidth={1.5} />,
    title: "Secure Shopping",
    description: "Safe payments, protected data and peace of mind with every purchase"
  },
  {
    icon: <Infinity size={48} className="text-[#1a1a1b]" strokeWidth={1.5} />,
    title: "Unlimited\nRevisions",
    description: "We'll tweak it till it's perfect. No extra charges, no stress"
  },
  {
    icon: <CheckCircle size={36} className="text-[#1a1a1b]" strokeWidth={1.5} />,
    title: "Quality Assurance",
    description: "Crafted with care using premium materials. Made to last"
  }
];

export function TrustFeatures() {
  return (
    <section className="bg-[#A87B62] py-8 md:py-10">
      <div className="container mx-auto px-4 max-w-[1400px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((feature, i) => (
            <div 
              key={i} 
              className="bg-white p-5 rounded-xl flex flex-row items-center gap-5 shadow-lg transition-all hover:-translate-y-1 duration-300 min-h-[100px]"
            >
              <div className="flex-shrink-0 w-12 flex justify-center">
                {feature.icon}
              </div>
              <div className="flex flex-col space-y-1.5">
                <h3 className="text-sm font-black text-[#1a1a1b] leading-tight tracking-tight whitespace-pre-line">
                  {feature.title}
                </h3>
                <p className="text-[10px] text-gray-500 font-medium leading-relaxed max-w-[170px]">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center items-center gap-3 mt-8">
            <div className="w-1.5 h-1.5 rounded-full bg-white/40 border border-white/60" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/40 border border-white/60" />
            <div className="w-6 h-1.5 rounded-full bg-white" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/40 border border-white/60" />
        </div>
      </div>
    </section>
  );
}
