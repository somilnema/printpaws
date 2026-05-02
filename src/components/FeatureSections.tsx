"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const FEATURES = [
  {
    title: "Not Just a Gift. It’s Them.",
    description: "It’s personal. It’s emotional. And the moment they see it - they don’t just smile - they feel it",
    image: "/feature-gift.png",
    reverse: false,
  },
  {
    title: "We Don’t Just Draw Them. We Get Them Right.",
    description: "Every expression, every little detail - crafted until it doesn’t just look like your pet - it feels like them.",
    image: "/feature-detail.png",
    reverse: true,
  },
  {
    title: "Made to Stay With You",
    description: "Crafted with premium materials so your pet’s portrait doesn’t just look beautiful today - it stays with you for years to come.",
    image: "/feature-premium.png",
    reverse: false,
  },
];

export function FeatureSections() {
  return (
    <div className="py-20 md:py-32 space-y-24 md:space-y-40">
      {FEATURES.map((feature, i) => (
        <section key={i} className="container mx-auto px-6">
          <div className={`flex flex-col ${feature.reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-24`}>
            {/* Text Content */}
            <div className={`w-full lg:w-1/2 space-y-5 md:space-y-6 ${feature.reverse ? 'lg:pl-12' : 'lg:pr-12'}`}>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl lg:text-5xl font-black text-[#1a1a1b] font-playfair leading-tight"
              >
                {feature.title}
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-base md:text-lg text-gray-500 font-inter leading-relaxed max-w-md"
              >
                {feature.description}
              </motion.p>
            </div>

            {/* Image Content */}
            <motion.div 
              initial={{ opacity: 0, x: feature.reverse ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-full lg:w-1/2"
            >
              <div className="relative aspect-[16/11] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </motion.div>
          </div>
        </section>
      ))}
    </div>
  );
}
