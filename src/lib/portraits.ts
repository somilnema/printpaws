import { isOptionSelectable, sizeOptionMeta, sizesForStyle, type PortraitStyle, type PriceCatalog } from "@/lib/pricing";
import { resolveMediaUrl } from "@/lib/site-media-catalog";
import {
  BUNDLE_TIERS,
  CONFIGURATOR_SLUGS,
  sizeHiddenForPets,
  visibleBundleTiers,
  type BundleTier,
  type EverydayContent,
} from "@/lib/everyday-content";

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
    // Its own configurator (Signature Gift Bundle); the order form preset only marks it sellable.
    pets: "one",
  },
  {
    slug: "mini-desk-portrait",
    name: "Mini Desk Portrait",
    description: "Your little companion, always by your side.",
    imageSlot: "landing-mini-desk",
    fallbackImage: "",
    // Its own configurator (Desk Portrait); the order form preset only marks it sellable.
    pets: "one",
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

/**
 * "From" price on a portrait card: the cheapest style and size on sale in Pricing, plus the card's pet option.
 * `hidden` drops sizes the product's own size rules keep off sale (Multi-Pet per pet count, You & Your Pet per
 * composition). With nothing on sale it falls back to the cheapest canvas, as before.
 */
export function startingPrice(catalog: PriceCatalog, pets: PetPreset, hidden?: (style: PortraitStyle, size: string) => boolean) {
  const cheapest = cheapestSizePrice(catalog, hidden);
  return (cheapest ?? Math.min(...Object.values(catalog.canvas))) + (catalog.pets[pets] ?? 0);
}

/** Cheapest style + size on sale in Pricing (minus `hidden`), or null when nothing is on sale. */
function cheapestSizePrice(catalog: PriceCatalog, hidden?: (style: PortraitStyle, size: string) => boolean): number | null {
  let cheapest: number | null = null;
  for (const style of ["framed", "canvas"] as const) {
    if (!isOptionSelectable(catalog.options.styles[style])) continue;
    const prices = style === "framed" ? catalog.framed : catalog.canvas;
    for (const size of sizesForStyle(style, catalog)) {
      if (!isOptionSelectable(sizeOptionMeta(catalog, style, size)) || hidden?.(style, size)) continue;
      if (cheapest === null || prices[size] < cheapest) cheapest = prices[size];
    }
  }
  return cheapest;
}

/** Desk Portrait / Gift Bundle prices in Pricing. Read defensively: older saved catalogs may not have them. */
type NewProductCatalog = PriceCatalog & {
  miniDesk?: { price?: number };
  giftBundle?: Partial<Record<BundleTier, number>>;
};

/**
 * "From" price of the Desk Portrait and Signature Gift Bundle cards (null for other slugs, and when the product
 * has nothing on sale). Desk: its one price. Bundle: the cheapest visible tier priced at least ₹1, plus the
 * cheapest size on sale that the tier doesn't hide.
 */
export function productStartingPrice(slug: string, catalog: PriceCatalog, content?: EverydayContent): number | null {
  const prices = catalog as NewProductCatalog;
  if (slug === CONFIGURATOR_SLUGS.mini_desk) {
    const price = prices.miniDesk?.price ?? 0;
    return Number.isFinite(price) && price >= 1 ? price : null;
  }
  if (slug !== CONFIGURATOR_SLUGS.gift_bundle) return null;
  const tiers = content ? visibleBundleTiers(content) : BUNDLE_TIERS;
  let best: number | null = null;
  for (const tier of tiers) {
    const tierPrice = prices.giftBundle?.[tier] ?? 0;
    if (!Number.isFinite(tierPrice) || tierPrice < 1) continue;
    const size = cheapestSizePrice(catalog, content ? (style, size) => sizeHiddenForPets(content, tier, style, size) : undefined);
    if (size === null) continue;
    if (best === null || tierPrice + size < best) best = tierPrice + size;
  }
  return best;
}

export type CardPhotoSource = "upload" | "media" | "shop" | "none";

/**
 * Landing card photo: the one uploaded in Admin → Landing & home → Products, else the card's Media → Landing page
 * photo, else a shop photo. "" shows a paw.
 */
export function cardPhoto(slug: string, uploaded: string, media: Record<string, string>): { url: string; source: CardPhotoSource } {
  const known = portraitBySlug(slug);
  if (uploaded) return { url: uploaded, source: "upload" };
  if (known && media[known.imageSlot]) return { url: media[known.imageSlot], source: "media" };
  if (known?.fallbackImage) return { url: resolveMediaUrl(known.fallbackImage, media), source: "shop" };
  return { url: "", source: "none" };
}
