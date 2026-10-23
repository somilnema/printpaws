"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { portraitForPets } from "@/lib/portraits";
import { scrollToPortraits } from "./ScrollToPortraits";

/**
 * The cart drawer lives inside the order form, which this page does not have.
 * A filled cart opens on its product page; an empty one scrolls to the portraits.
 */
export function CartBridge() {
  const router = useRouter();

  useEffect(() => {
    const openCart = () => {
      let saved: { hasCustomizedItem?: boolean; selectedPets?: string } | null = null;
      try {
        saved = JSON.parse(localStorage.getItem("peternity_cart") || "null");
      } catch {
        saved = null;
      }
      if (saved?.hasCustomizedItem) {
        router.push(`/portraits/${portraitForPets(saved.selectedPets).slug}?cart=open`);
        return;
      }
      scrollToPortraits();
    };
    window.addEventListener("toggleCart", openCart);
    return () => window.removeEventListener("toggleCart", openCart);
  }, [router]);

  return null;
}
