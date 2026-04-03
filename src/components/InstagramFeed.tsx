"use client";

import Image from "next/image";

const INSTA_IMAGES = [
  { src: "/dog_portrait_closeup_1773940826280.png", name: "STAR" },
  { src: "/thumb1.png", name: "ELSA" },
  { src: "/thumb2.png", name: "BRUNO" },
  { src: "/main.png", name: "SAM" },
];

export function InstagramFeed() {
  return (
    <section className="py-0 bg-white border-t border-gray-100">
      <div className="flex flex-col lg:flex-row min-h-[400px]">
        {/* Left Content */}
        <div className="lg:w-[40%] flex flex-col items-center justify-center p-12 lg:p-20 space-y-8 bg-[#F9F9F9]">
          <h2 className="text-4xl md:text-4xl font-black text-[#1a1a1b] leading-tight tracking-tight text-center lg:text-left max-w-xs">
            Follow Us on Instagram
          </h2>
          <div className="w-full flex justify-center lg:justify-end pr-0 lg:pr-12 md:pl-20">
            <button className="bg-[#A87B62] hover:bg-[#8B624D] text-white px-8 py-3 rounded-xl font-black text-xs tracking-widest transition-all shadow-md hover:-translate-y-1">
              #PRINTSBTPAWS
            </button>
          </div>
        </div>

        {/* Right Content - Grid */}
        <div className="lg:w-[60%] flex">
          {INSTA_IMAGES.map((img, i) => (
            <div 
              key={i} 
              className="relative flex-1 min-h-[300px] lg:min-h-full group cursor-pointer border-l border-gray-100"
            >
              <Image 
                src={img.src} 
                alt={img.name} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="25vw"
                onError={(e: any) => { e.target.style.display = 'none'; }}
              />
              {/* Pet Name Label Overlay */}
              <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
                <span className="text-[10px] md:text-xs font-black tracking-[0.2em] text-[#1a1a1b] bg-white/90 backdrop-blur px-4 py-1.5 rounded-sm shadow-sm uppercase">
                  {img.name}
                </span>
              </div>
              {/* Subtle Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
