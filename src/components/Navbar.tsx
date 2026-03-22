"use client";

import { Menu, ShoppingBag } from "lucide-react";
import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between font-montserrat">
        <button className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors">
          <Menu size={24} className="text-secondary" />
        </button>

        <Link href="/" className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <span className="text-xl sm:text-2xl font-black tracking-tighter text-secondary uppercase italic">
              PrintsByPaws
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <button className="relative p-2 hover:bg-gray-50 rounded-full transition-colors">
            <ShoppingBag size={24} className="text-secondary" />
            <span className="absolute top-1 right-1 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              0
            </span>
          </button>
        </div>
      </nav>
    </header>
  );
}
