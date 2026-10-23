import type { PriceCatalog } from "@/lib/pricing";

export type PetPreset = "one" | "two" | "human";

export type Portrait = {
  slug: string;
  name: string;
  description: string;
  /** Admin media slot for the landing card photo. */
  imageSlot: string;
  /** Shop photo shown until the admin uploads one. "" shows a plain tile. */
  fallbackImage: string;
  /** Pet choice the order form opens on. null: not sellable yet, the card says "Coming soon". */
  pets: PetPreset | null;
};

export const PORTRAITS: Portrait[] = [
  {
    slug: "everyday-pet-portrait",
    name: "Everyday Pet Portrait",
    description: "Turn your favourite pet photo into a beautiful portrait.",
    imageSlot: "landing-everyday",
    fallbackImage: "Main Image.png",
    pets: "one",
  },
  {
    slug: "multi-pet-portrait",
    name: "Multi-Pet Portrait",
    description: "All your pets together in one beautiful portrait.",
    imageSlot: "landing-multi-pet",
    fallbackImage: "/new-review/WhatsApp Image 2026-07-18 at 12.44.35 AM.jpeg",
    pets: "two",
  },
  {
    slug: "you-and-your-pet",
    name: "You & Your Pet",
    description: "A beautiful portrait of you and your furry best friend.",
    imageSlot: "landing-you-and-pet",
    fallbackImage: "",
    pets: "human",
  },
  {
    slug: "memorial-portrait",
    name: "Memorial Portrait",
    description: "Honour their memory with a portrait you'll cherish forever.",
    imageSlot: "landing-memorial",
    fallbackImage: "/bonus-image/halo-effect.png",
    pets: "one",
  },
  {
    slug: "signature-gift-bundle",
    name: "Signature Gift Bundle",
    description: "A special gift made for someone who loves their pet.",
    imageSlot: "landing-gift-bundle",
    fallbackImage: "",
    pets: null,
  },
  {
    slug: "mini-desk-portrait",
    name: "Mini Desk Portrait",
    description: "Your little companion, always by your side.",
    imageSlot: "landing-mini-desk",
    fallbackImage: "",
    pets: null,
  },
];

export const SELLABLE_PORTRAITS = PORTRAITS.filter((portrait) => portrait.pets);

export function portraitBySlug(slug: string) {
  return PORTRAITS.find((portrait) => portrait.slug === slug) || null;
}

/** The product page that matches the portrait already in the cart. */
export function portraitForPets(pets?: string) {
  const slug =
    pets === "human" ? "you-and-your-pet" : pets === "two" || pets === "three" || pets === "four" ? "multi-pet-portrait" : "everyday-pet-portrait";
  return portraitBySlug(slug)!;
}

/** Cheapest configuration a shopper can buy today. Framed is paused, so canvas sets the floor. */
export function startingPrice(catalog: PriceCatalog, pets: PetPreset) {
  return Math.min(...Object.values(catalog.canvas)) + (catalog.pets[pets] ?? 0);
}
