"use client";

import { Menu, ShoppingBag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <nav className="container mx-auto px-4 h-16 md:h-24 flex items-center justify-between font-playfair">
        <button className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors">
          <Menu size={24} className="text-secondary" />
        </button>

        <Link href="/" className="flex items-center">
          <div className="relative h-35 w-45 md:h-50 md:w-100 translate-y-2 md:translate-y-4">
            <Image
              src="/IMG_4060.PNG"
              alt="Peternity Logo"
              fill
              className="object-contain"
              priority
            />
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
