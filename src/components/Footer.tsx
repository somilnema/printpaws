"use client";

import { Instagram, Facebook, Twitter, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative mt-20">
      {/* Animated Wavy Edge */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] -translate-y-[99%] transform pointer-events-none">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block w-[200%] h-[40px] md:h-[100px] fill-primary opacity-30 animate-wave-slower"
        >
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113,2,1200,82.45V0Z"></path>
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="absolute top-0 left-0 block w-[200%] h-[40px] md:h-[100px] fill-primary opacity-50 animate-wave-slow"
        >
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113,2,1200,82.45V0Z"></path>
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="absolute top-0 left-0 block w-[200%] h-[40px] md:h-[100px] fill-primary animate-wave"
        >
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113,2,1200,82.45V0Z"></path>
        </svg>
      </div>

      <div className="bg-primary text-white pt-20 pb-10 px-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="space-y-6">
              <span className="text-2xl font-black italic uppercase italic tracking-tighter">PrintsByPaws</span>
              <p className="text-white/80 text-sm font-poppins leading-relaxed">
                We're on a mission to celebrate the bond between pets and their humans through high-quality, custom artwork.
              </p>
              <div className="flex gap-4">
                {[Instagram, Facebook, Twitter].map((Icon, i) => (
                  <button key={i} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                    <Icon size={20} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold uppercase mb-6 tracking-wide">Quick Links</h4>
              <ul className="space-y-4 text-sm font-poppins text-white/70">
                <li><Link href="/" className="hover:text-white transition-colors font-poppins">Shop All</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors font-poppins">Reviews</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors font-poppins">How it Works</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors font-poppins">FAQ</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors font-poppins">Contact Us</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold uppercase mb-6 tracking-wide">Policies</h4>
              <ul className="space-y-4 text-sm font-poppins text-white/70">
                <li><Link href="/refund-policy" className="hover:text-white transition-colors font-poppins">Refund Policy</Link></li>
                <li><Link href="/shipping-policy" className="hover:text-white transition-colors font-poppins">Shipping Policy</Link></li>
                <li><Link href="/privacy-policy" className="hover:text-white transition-colors font-poppins">Privacy Policy</Link></li>
                <li><Link href="/terms-of-service" className="hover:text-white transition-colors font-poppins">Terms of Service</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold uppercase mb-6 tracking-wide italic">Join the Pack</h4>
              <p className="text-sm font-poppins text-white/70 mb-6">
                Get exclusive offers, pup-dates, and more!
              </p>
              <div className="flex bg-white/10 rounded-xl overflow-hidden focus-within:ring-2 ring-white/20 transition-all">
                <input
                  type="email"
                  placeholder="Email address"
                  className="bg-transparent border-none px-4 py-3 flex-1 text-sm outline-none placeholder:text-white/40 font-poppins"
                />
                <button className="px-4 bg-white text-primary hover:bg-white/90 transition-colors">
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>

          <hr className="border-white/10 mb-8" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-xs font-poppins text-white/50">
              © 2026, Prints By Paws. All rights reserved.
            </p>
            <div className="flex gap-4 opacity-50 grayscale transition-all hover:grayscale-0 hover:opacity-100 cursor-pointer">
              {/* Payment Icon Placeholders */}
              <div className="w-10 h-6 bg-white/10 rounded-sm"></div>
              <div className="w-10 h-6 bg-white/10 rounded-sm"></div>
              <div className="w-10 h-6 bg-white/10 rounded-sm"></div>
              <div className="w-10 h-6 bg-white/10 rounded-sm"></div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
