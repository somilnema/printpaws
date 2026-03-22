"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const FEATURES = [
  {
    title: "One of a kind gift",
    description: "It's personal, it's thoughtful, and it might just make them tear up a little",
    image: "/feature-gift.png",
    reverse: false,
  },
  {
    title: "Attention to every detail",
    description: "We treat every portrait like it's our own pet, because yours deserves nothing less",
    image: "/feature-detail.png",
    reverse: true,
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
                className="text-3xl md:text-4xl lg:text-5xl font-black text-[#1a1a1b] font-montserrat leading-tight"
              >
                {feature.title}
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-base md:text-lg text-gray-500 font-poppins leading-relaxed max-w-md"
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
