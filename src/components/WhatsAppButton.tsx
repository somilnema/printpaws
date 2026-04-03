"use client";

import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  return (
    <a 
      href="https://wa.me/yournumber" // Replace with actual number
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 p-4 bg-[#25D366] text-white rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 group"
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle size={32} className="fill-white" />
      <span className="absolute right-full mr-4 bg-white text-[#1a1a1b] px-4 py-2 rounded-xl text-sm font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Chat with us!
      </span>
    </a>
  );
}
