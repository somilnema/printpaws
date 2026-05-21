"use client";

import { useState, useEffect } from "react";
import { Menu, ShoppingBag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function Navbar() {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // 1. Initial count check from persisted localStorage cache
    try {
      const saved = localStorage.getItem('peternity_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.hasCustomizedItem) {
          const count = 1 + (parsed.addMagnet ? 1 : 0) + (parsed.addMug ? 1 : 0);
          setCartCount(count);
        }
      }
    } catch (e) {
      console.warn("Error reading initial cart cache in Navbar:", e);
    }

    // 2. Listen to real-time custom cart update events
    const handleBadgeUpdate = (e: any) => {
      setCartCount(e.detail || 0);
    };
    window.addEventListener('cartBadgeUpdated', handleBadgeUpdate);
    return () => window.removeEventListener('cartBadgeUpdated', handleBadgeUpdate);
  }, []);

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
          <button 
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('toggleCart'))}
            className="relative p-2 hover:bg-gray-50 rounded-full transition-colors group"
          >
            <ShoppingBag size={24} className="text-secondary group-hover:scale-105 transition-transform" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-bounce shadow-sm">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </nav>
    </header>
  );
}
