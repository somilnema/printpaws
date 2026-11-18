import type { BundleTier, EverydayContent, NewProduct } from "@/lib/everyday-content";
import { saveOfferRule } from "@/lib/save-offer";

export type ProductType =
  | "portrait"
  | "custom_payment"
  | "fresh_payment"
  | "digital_download"
  | "landing_offer";

export type PaymentMethod = "prepaid" | "cod";

export type PortraitStyle = "framed" | "canvas";

export type CouponScope = "all" | "portrait" | "mug" | "magnet" | "digital";

export const COUPON_SCOPES: CouponScope[] = ["all", "portrait", "mug", "magnet", "digital"];

/** Rules the server has already accepted. Checkout never trusts this from the browser. */
export type CouponRule = {
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  appliesTo: CouponScope[];
  minOrderAmount: number | null;
};

/** Shop display for a customizer choice. Admin can change this without a deploy. */
export type OptionStatus = "available" | "hidden" | "out_of_stock";

export type OptionMeta = {
  status: OptionStatus;
  /** Marketing chip next to the label, e.g. "Value for Money". Empty = none. */
  badge: string;
};

export type OptionConfig = {
  styles: Record<PortraitStyle, OptionMeta>;
  framedSizes: Record<string, OptionMeta>;
  canvasSizes: Record<string, OptionMeta>;
  pets: Record<string, OptionMeta>;
};

export type PriceCatalog = {
  framed: Record<string, number>;
  canvas: Record<string, number>;
  pets: Record<string, number>;
  halo: number;
  giftWrap: number;
  premiumBackground: number;
  /** Priority Preview add-on (Everyday configurator). Suggested ₹199 pending approval. */
  priorityPreview: number;
  /** You & Your Pet: flat "My Family & Our Pet" upgrade, part of the main product price (handoff: +₹500). */
  familyUpgrade: number;
  /** Multi-Pet "A Special Tribute" halo. ₹0 until Peternity approves a surcharge. */
  multiPetHalo: number;
  mug: { price: number; compareAt: number };
  magnet: { price: number; compareAt: number };
  digital: { price: number; compareAt: number };
  desk: { price: number; compareAt: number };
  /** Desk Portrait (its own product; NOT the Everyday "desk" add-on above). twoPets / threePets are extras over 1 pet. */
  miniDesk: { price: number; twoPets: number; threePets: number };
  /** Signature Gift Bundle: tier price (added to the style/size price) and the optional greeting card. 0 = not on sale. */
  giftBundle: { essential: number; signature: number; greetingCard: number };
  prepaidPercent: number;
  codAdvancePercent: number;
  customPayments: number[];
  freshPayment: number;
  digitalDownloads: number[];
  options: OptionConfig;
  /** Background ids that charge premiumBackground. Filled from the configurator on the server. */
  limitedBackgrounds: string[];
};

/** Built-in Limited Edition backgrounds, used until the configurator list has loaded. */
export const LIMITED_EDITION_BACKGROUNDS = ["bg7", "bg8", "bg9"] as const;

export function isLimitedEditionBackground(name: string | null | undefined, catalog: Pick<PriceCatalog, "limitedBackgrounds">) {
  return catalog.limitedBackgrounds.includes(name || "");
}

export const OPTION_STATUSES: OptionStatus[] = ["available", "hidden", "out_of_stock"];

export const OPTION_STATUS_LABELS: Record<OptionStatus, string> = {
  available: "Available",
  hidden: "Hidden",
  out_of_stock: "Out of stock",
};

function meta(status: OptionStatus = "available", badge = ""): OptionMeta {
  return { status, badge };
}

/** Shop defaults: both styles and all framed sizes on sale; canvas 20×30 keeps the value badge. */
export const DEFAULT_OPTION_CONFIG: OptionConfig = {
  styles: {
    canvas: meta("available"),
    framed: meta("available"),
  },
  framedSizes: {
    '8"x10"': meta("available"),
    '12"x16"': meta("available", "⭐ Most Popular"),
    '18"x24"': meta("available"),
  },
  canvasSizes: {
    '8"x12"': meta("available"),
    '16"x20"': meta("available"),
    '20"x30"': meta("available", "💰 Value for Money"),
  },
  pets: {
    one: meta("available"),
    two: meta("available"),
    three: meta("available"),
    four: meta("available"),
    human: meta("available"),
  },
};

export function cloneOptionMeta(value: OptionMeta = meta()): OptionMeta {
  return { status: value.status, badge: value.badge || "" };
}

export function cloneOptionConfig(config: OptionConfig = DEFAULT_OPTION_CONFIG): OptionConfig {
  return {
    styles: {
      canvas: cloneOptionMeta(config.styles.canvas),
      framed: cloneOptionMeta(config.styles.framed),
    },
    framedSizes: Object.fromEntries(
      Object.entries(config.framedSizes).map(([key, value]) => [key, cloneOptionMeta(value)])
    ),
    canvasSizes: Object.fromEntries(
      Object.entries(config.canvasSizes).map(([key, value]) => [key, cloneOptionMeta(value)])
    ),
    pets: Object.fromEntries(Object.entries(config.pets).map(([key, value]) => [key, cloneOptionMeta(value)])),
  };
}

export function isOptionVisible(value?: OptionMeta | null) {
  return (value?.status || "available") !== "hidden";
}

export function isOptionSelectable(value?: OptionMeta | null) {
  return (value?.status || "available") === "available";
}

export function displaySizeLabel(size: string) {
  return size.replace(/"/g, "").replace("x", "×");
}

export type PricingInput = {
  productType: ProductType;
  portraitStyle?: PortraitStyle;
  size?: string;
  numPets?: string;
  background?: string;
  addon?: string;
  giftWrap?: boolean;
  priorityPreview?: boolean;
  cartQty?: number;
  addDigitalDownload?: boolean;
  addMagnet?: boolean;
  addMug?: boolean;
  addDesk?: boolean;
  customPaymentAmount?: number;
  digitalDownloadAmount?: number;
  /** Which three-step configurator built this portrait. Multi-Pet and You & Your Pet add their own rules. */
  configurator?: "everyday" | "multi_pet" | "you_and_your_pet" | "mini_desk" | "gift_bundle";
  /** Signature Gift Bundle tier (gift_bundle only). */
  bundleTier?: BundleTier;
  /** Signature Gift Bundle: the optional paid greeting card (gift_bundle only). */
  greetingCard?: boolean;
  /** You & Your Pet composition. "family" adds the flat family upgrade. */
  composition?: "solo" | "family";
  /** Multi-Pet halo (A Special Tribute). */
  tribute?: boolean;
  /** Set on the server from the landing product. The browser amount is ignored. */
  offerId?: string;
  offerAmount?: number;
  productLabel?: string;
  couponCode?: string | null;
  couponRule?: CouponRule | null;
  paymentMethod?: PaymentMethod;
};

export type Quote = {
  productType: ProductType;
  productLabel: string;
  originalAmount: number;
  couponCode: string | null;
  couponType: "percent" | "fixed" | null;
  couponValue: number;
  couponPercent: number;
  couponDiscount: number;
  couponRule: CouponRule | null;
  afterCouponAmount: number;
  prepaidDiscount: number;
  prepaidPercent: number;
  advancePercent: number;
  remainingPercent: number;
  advanceAmount: number;
  remainingAmount: number;
  payableNow: number;
  paymentMethod: PaymentMethod;
  allowsCod: boolean;
};

/** Built-in sizes. Admin can hide these; sizes added in Pricing come from the catalog. */
export const FRAMED_SIZES = ['8"x10"', '12"x16"', '18"x24"'] as const;
export const CANVAS_SIZES = ['8"x12"', '16"x20"', '20"x30"'] as const;

export const MAX_SIZE_INCHES = 120;

/** '12"x16"' → { w: 12, h: 16 }. Null when it isn't a size. */
export function parseSize(size: string) {
  const match = /^(\d{1,3})"x(\d{1,3})"$/.exec(size);
  return match ? { w: Number(match[1]), h: Number(match[2]) } : null;
}

export function makeSize(width: number, height: number) {
  return `${width}"x${height}"`;
}

export function isBuiltInSize(style: PortraitStyle, size: string) {
  return ((style === "framed" ? FRAMED_SIZES : CANVAS_SIZES) as readonly string[]).includes(size);
}

/** Every size for a style, smallest first, including ones added in Pricing. */
export function sizesForStyle(style: PortraitStyle, catalog: Pick<PriceCatalog, "framed" | "canvas"> = DEFAULT_CATALOG) {
  const area = (size: string) => {
    const parsed = parseSize(size);
    return parsed ? parsed.w * parsed.h : 0;
  };
  return Object.keys(style === "framed" ? catalog.framed : catalog.canvas).sort(
    (a, b) => area(a) - area(b) || a.localeCompare(b)
  );
}

export const DEFAULT_CATALOG: PriceCatalog = {
  framed: {
    '8"x10"': 1499,
    '12"x16"': 1999,
    '18"x24"': 2499,
  },
  canvas: {
    '8"x12"': 1699,
    '16"x20"': 2499,
    '20"x30"': 3499,
  },
  pets: {
    one: 0,
    two: 300,
    three: 600,
    four: 1500,
    human: 500,
  },
  halo: 200,
  giftWrap: 199,
  premiumBackground: 199,
  priorityPreview: 199,
  familyUpgrade: 500,
  multiPetHalo: 0,
  mug: { price: 600, compareAt: 799 },
  magnet: { price: 200, compareAt: 299 },
  digital: { price: 300, compareAt: 399 },
  desk: { price: 999, compareAt: 1299 },
  miniDesk: { price: 999, twoPets: 149, threePets: 249 },
  giftBundle: { essential: 999, signature: 1499, greetingCard: 199 },
  prepaidPercent: 4,
  codAdvancePercent: 40,
  customPayments: [500, 600],
  freshPayment: 200,
  digitalDownloads: [300, 500],
  options: cloneOptionConfig(DEFAULT_OPTION_CONFIG),
  limitedBackgrounds: [...LIMITED_EDITION_BACKGROUNDS],
};

/** @deprecated Prefer catalog.options.styles.framed — kept for older imports. */
export const FRAMED_FOR_SALE = isOptionSelectable(DEFAULT_OPTION_CONFIG.styles.framed);
export const FRAMED_UNAVAILABLE = "Framed portraits are temporarily unavailable.";

/** Blocks checkout when style / size / pets is hidden or out of stock in the live catalog. */
export function portraitOptionProblem(
  input: Pick<PricingInput, "productType" | "portraitStyle" | "size" | "numPets">,
  catalog: PriceCatalog = DEFAULT_CATALOG
) {
  const type = input.productType || "portrait";
  if (type !== "portrait") return null;

  const style: PortraitStyle = input.portraitStyle === "canvas" ? "canvas" : "framed";
  const styleMeta = catalog.options.styles[style];
  if (!isOptionVisible(styleMeta)) {
    return `${PORTRAIT_STYLE_LABELS[style]} is not available.`;
  }
  if (!isOptionSelectable(styleMeta)) {
    return style === "framed" ? FRAMED_UNAVAILABLE : `${PORTRAIT_STYLE_LABELS[style]} is temporarily unavailable.`;
  }

  const size = input.size || firstAvailableSize(style, catalog) || (style === "canvas" ? '8"x12"' : '8"x10"');
  const sizeMeta = sizeOptionMeta(catalog, style, size);
  if (!sizeMeta || !isOptionVisible(sizeMeta)) {
    return `Size ${displaySizeLabel(size)} is not available.`;
  }
  if (!isOptionSelectable(sizeMeta)) {
    return `Size ${displaySizeLabel(size)} is out of stock.`;
  }

  const pets = input.numPets || "one";
  const petMeta = catalog.options.pets[pets];
  if (petMeta && !isOptionVisible(petMeta)) {
    return "That pet option is not available.";
  }
  if (petMeta && !isOptionSelectable(petMeta)) {
    return "That pet option is temporarily unavailable.";
  }

  return null;
}

export function framedSaleProblem(
  input: Pick<PricingInput, "productType" | "portraitStyle" | "size" | "numPets">,
  catalog: PriceCatalog = DEFAULT_CATALOG
) {
  return portraitOptionProblem(input, catalog);
}

/** Shop status of a size. Undefined when the size has no price, so it can't be bought. */
export function sizeOptionMeta(catalog: PriceCatalog, style: PortraitStyle, size: string): OptionMeta | undefined {
  const prices = style === "framed" ? catalog.framed : catalog.canvas;
  if (prices[size] == null) return undefined;
  return (style === "framed" ? catalog.options.framedSizes[size] : catalog.options.canvasSizes[size]) || meta();
}

export function firstAvailableSize(style: PortraitStyle, catalog: PriceCatalog = DEFAULT_CATALOG) {
  for (const size of sizesForStyle(style, catalog)) {
    if (isOptionSelectable(sizeOptionMeta(catalog, style, size))) return size;
  }
  return null;
}

export function firstAvailableStyle(catalog: PriceCatalog = DEFAULT_CATALOG): PortraitStyle | null {
  if (isOptionSelectable(catalog.options.styles.framed) && firstAvailableSize("framed", catalog)) return "framed";
  if (isOptionSelectable(catalog.options.styles.canvas) && firstAvailableSize("canvas", catalog)) return "canvas";
  return null;
}

export function firstAvailablePets(catalog: PriceCatalog = DEFAULT_CATALOG) {
  for (const id of ["one", "two", "three", "four", "human"] as const) {
    if (isOptionSelectable(catalog.options.pets[id])) return id;
  }
  return null;
}

export const PREPAID_DISCOUNT_PERCENT = DEFAULT_CATALOG.prepaidPercent;
export const COD_ADVANCE_PERCENT = DEFAULT_CATALOG.codAdvancePercent;
export const COD_REMAINING_PERCENT = 100 - DEFAULT_CATALOG.codAdvancePercent;

export const FRAMED_SIZE_PRICES = DEFAULT_CATALOG.framed;
export const CANVAS_SIZE_PRICES = DEFAULT_CATALOG.canvas;
export const PET_UPGRADES = DEFAULT_CATALOG.pets;
export const ADDON_PRICES: Record<string, number> = {
  halo_effect: DEFAULT_CATALOG.halo,
  none: 0,
};
export const GIFT_WRAP_PRICE = DEFAULT_CATALOG.giftWrap;
export const PREMIUM_BACKGROUND_PRICE = DEFAULT_CATALOG.premiumBackground;
export const PRIORITY_PREVIEW_PRICE = DEFAULT_CATALOG.priorityPreview;

export const EXTRA_PRODUCTS = {
  mug: {
    id: "mug" as const,
    label: "Custom Pet Mug",
    description: "Create a custom mug using your pet's image.",
    price: DEFAULT_CATALOG.mug.price,
    compareAt: DEFAULT_CATALOG.mug.compareAt,
    image: "/extras/mug.jpg",
  },
  magnet: {
    id: "magnet" as const,
    label: "Custom Pet Fridge Magnet",
    description: "A custom fridge magnet of your pet.",
    price: DEFAULT_CATALOG.magnet.price,
    compareAt: DEFAULT_CATALOG.magnet.compareAt,
    image: "/extras/magnet.jpg",
  },
  digital: {
    id: "digital" as const,
    label: "Digital Download",
    description: "Digital files suitable for wallpapers and other digital uses.",
    price: DEFAULT_CATALOG.digital.price,
    compareAt: DEFAULT_CATALOG.digital.compareAt,
    image: "/extras/digital-download.jpg",
  },
  desk: {
    id: "desk" as const,
    label: "Desk Portrait",
    description: "A compact portrait with a stand, perfect for your desk.",
    price: DEFAULT_CATALOG.desk.price,
    compareAt: DEFAULT_CATALOG.desk.compareAt,
    image: "/feature-detail.png",
  },
} as const;

export const MUG_PRICE = EXTRA_PRODUCTS.mug.price;
export const MAGNET_PRICE = EXTRA_PRODUCTS.magnet.price;
export const DIGITAL_DOWNLOAD_ADDON_PRICE = EXTRA_PRODUCTS.digital.price;
export const GIFT_OPTION_PRICE = DIGITAL_DOWNLOAD_ADDON_PRICE;

export const CUSTOM_PAYMENT_AMOUNTS = DEFAULT_CATALOG.customPayments;
export const FRESH_PAYMENT_AMOUNT = DEFAULT_CATALOG.freshPayment;
export const DIGITAL_DOWNLOAD_AMOUNTS = DEFAULT_CATALOG.digitalDownloads;

export const COUPONS: Record<string, { percent: number; active: boolean; label: string }> = {
  WELCOME10: { percent: 10, active: true, label: "10% off" },
};

export const PRODUCT_LABELS: Record<ProductType, string> = {
  portrait: "Custom Pet Portrait",
  custom_payment: "Custom Payment",
  fresh_payment: "Fresh Payment",
  digital_download: "Digital Download",
  landing_offer: "Peternity",
};

export const PORTRAIT_STYLE_LABELS: Record<PortraitStyle, string> = {
  framed: "Framed Portrait",
  canvas: "Canvas Portrait",
};

export const PET_COUNT_LABELS: Record<string, string> = {
  one: "1 Pet",
  two: "2 Pets",
  three: "3 Pets",
  four: "4 Pets",
  human: "Human + Pet",
};

export type PriceLine = { id: string; label: string; price: number };

function rupees(value: number) {
  return Math.round(value);
}

export function cloneCatalog(catalog: PriceCatalog = DEFAULT_CATALOG): PriceCatalog {
  return {
    framed: { ...catalog.framed },
    canvas: { ...catalog.canvas },
    pets: { ...catalog.pets },
    halo: catalog.halo,
    giftWrap: catalog.giftWrap,
    premiumBackground: catalog.premiumBackground,
    priorityPreview: catalog.priorityPreview ?? DEFAULT_CATALOG.priorityPreview,
    familyUpgrade: catalog.familyUpgrade ?? DEFAULT_CATALOG.familyUpgrade,
    multiPetHalo: catalog.multiPetHalo ?? DEFAULT_CATALOG.multiPetHalo,
    mug: { ...catalog.mug },
    magnet: { ...catalog.magnet },
    digital: { ...catalog.digital },
    desk: { ...(catalog.desk || DEFAULT_CATALOG.desk) },
    miniDesk: { ...DEFAULT_CATALOG.miniDesk, ...(catalog.miniDesk || {}) },
    giftBundle: { ...DEFAULT_CATALOG.giftBundle, ...(catalog.giftBundle || {}) },
    prepaidPercent: catalog.prepaidPercent,
    codAdvancePercent: catalog.codAdvancePercent,
    customPayments: [...catalog.customPayments],
    freshPayment: catalog.freshPayment,
    digitalDownloads: [...catalog.digitalDownloads],
    options: cloneOptionConfig(catalog.options || DEFAULT_OPTION_CONFIG),
    limitedBackgrounds: [...(catalog.limitedBackgrounds || LIMITED_EDITION_BACKGROUNDS)],
  };
}

export function extraCatalog(catalog: PriceCatalog, id: "mug" | "magnet" | "digital" | "desk") {
  const meta = EXTRA_PRODUCTS[id];
  const money = catalog[id] || DEFAULT_CATALOG[id];
  return {
    ...meta,
    price: money.price,
    compareAt: money.compareAt,
  };
}

export function extraProductLines(
  input: Pick<PricingInput, "addMug" | "addMagnet" | "addDigitalDownload" | "addDesk">,
  catalog: PriceCatalog = DEFAULT_CATALOG
) {
  const lines: { id: string; label: string; price: number }[] = [];
  if (input.addMug) lines.push({ id: "mug", label: EXTRA_PRODUCTS.mug.label, price: catalog.mug.price });
  if (input.addMagnet) lines.push({ id: "magnet", label: EXTRA_PRODUCTS.magnet.label, price: catalog.magnet.price });
  if (input.addDigitalDownload) {
    lines.push({ id: "digital", label: EXTRA_PRODUCTS.digital.label, price: catalog.digital.price });
  }
  if (input.addDesk) {
    lines.push({ id: "desk", label: EXTRA_PRODUCTS.desk.label, price: (catalog.desk || DEFAULT_CATALOG.desk).price });
  }
  return lines;
}

export function extrasTotal(
  input: Pick<PricingInput, "addMug" | "addMagnet" | "addDigitalDownload" | "addDesk">,
  catalog: PriceCatalog = DEFAULT_CATALOG
) {
  return extraProductLines(input, catalog).reduce((sum, line) => sum + line.price, 0);
}

export function frameColorLabel(frame: string, style: PortraitStyle) {
  if (style === "canvas") return "Canvas wrap";
  if (frame === "white") return "White Frame";
  return "Black Frame";
}

/** You & Your Pet family upgrade for this order (0 for every other product). */
export function familyUpgradeAmount(input: Pick<PricingInput, "configurator" | "composition">, catalog: PriceCatalog = DEFAULT_CATALOG) {
  return input.configurator === "you_and_your_pet" && input.composition === "family"
    ? Math.max(0, catalog.familyUpgrade ?? DEFAULT_CATALOG.familyUpgrade)
    : 0;
}

/** Multi-Pet halo price for this order (0 unless a halo was chosen and Pricing sets a price). */
export function tributeAmount(input: Pick<PricingInput, "configurator" | "tribute">, catalog: PriceCatalog = DEFAULT_CATALOG) {
  return input.configurator === "multi_pet" && input.tribute ? Math.max(0, catalog.multiPetHalo ?? 0) : 0;
}

/** Desk Portrait: the extra for 2 or 3 pets (over the 1-pet base). 0 for one pet or anything else. */
export function deskExtraPetAmount(catalog: PriceCatalog, numPets: string | undefined): number {
  const desk = catalog.miniDesk || DEFAULT_CATALOG.miniDesk;
  if (numPets === "two") return Math.max(0, Math.round(Number(desk.twoPets) || 0));
  if (numPets === "three") return Math.max(0, Math.round(Number(desk.threePets) || 0));
  return 0;
}

/** Desk Portrait price for one copy: base price plus the extra-pet charge. */
export function deskUnitPrice(catalog: PriceCatalog, numPets: string | undefined): number {
  const desk = catalog.miniDesk || DEFAULT_CATALOG.miniDesk;
  return Math.max(0, Math.round(Number(desk.price) || 0)) + deskExtraPetAmount(catalog, numPets);
}

/** Signature Gift Bundle tier price (added to the portrait style/size price). 0 when no tier. */
export function bundleTierAmount(catalog: PriceCatalog, tier: BundleTier | undefined): number {
  const bundle = catalog.giftBundle || DEFAULT_CATALOG.giftBundle;
  if (tier === "essential") return Math.max(0, Math.round(Number(bundle.essential) || 0));
  if (tier === "signature") return Math.max(0, Math.round(Number(bundle.signature) || 0));
  return 0;
}

/** Greeting card price for this order (0 unless it is a gift bundle with the card chosen). */
export function greetingCardAmount(catalog: PriceCatalog, input: Pick<PricingInput, "configurator" | "greetingCard">): number {
  if (input.configurator !== "gift_bundle" || !input.greetingCard) return 0;
  const bundle = catalog.giftBundle || DEFAULT_CATALOG.giftBundle;
  return Math.max(0, Math.round(Number(bundle.greetingCard) || 0));
}

function tierVisible(content: EverydayContent | undefined, tier: BundleTier) {
  const bundle = content?.bundle;
  if (!bundle) return true;
  return tier === "essential" ? bundle.essentialVisible !== false : bundle.signatureVisible !== false;
}

/**
 * Landing "From ₹" for the new products. Null when nothing is on sale (a product price below ₹1 means "not on sale").
 * Desk: the 1-pet price. Bundle: the cheapest visible tier priced ≥ ₹1 plus the cheapest selectable size it allows.
 */
export function newProductStartingPrice(product: NewProduct, catalog: PriceCatalog, content?: EverydayContent): number | null {
  if (product === "mini_desk") {
    const base = Math.round(Number((catalog.miniDesk || DEFAULT_CATALOG.miniDesk).price) || 0);
    return base >= 1 ? deskUnitPrice(catalog, "one") : null;
  }
  let best: number | null = null;
  for (const tier of ["essential", "signature"] as const) {
    const tierPrice = bundleTierAmount(catalog, tier);
    if (tierPrice < 1 || !tierVisible(content, tier)) continue;
    for (const style of ["framed", "canvas"] as const) {
      if (!isOptionSelectable(catalog.options.styles[style])) continue;
      for (const size of sizesForStyle(style, catalog)) {
        if (!isOptionSelectable(sizeOptionMeta(catalog, style, size))) continue;
        // Same rule as sizeHiddenForPets(content, tier, style, size) (kept inline: no runtime import cycle).
        if (content?.hiddenSizes?.[tier]?.includes(`${style}:${size}`)) continue;
        const sizePrice = catalog[style][size];
        if (!Number.isFinite(sizePrice)) continue;
        const total = tierPrice + sizePrice;
        if (best == null || total < best) best = total;
      }
    }
  }
  return best;
}

/**
 * The checkout payload's `addon` is also the order's add-on list ("priority_preview, custom_mug").
 * Only the legacy single add-ons are priced from it; everything listed below has its own field.
 */
const LISTED_ADDONS = new Set([
  "none",
  "halo_effect",
  "priority_preview",
  "custom_mug",
  "fridge_magnet",
  "digital_download",
  "desk_portrait",
  "halo_tribute",
  // Desk Portrait / Signature Gift Bundle: server-derived tokens, priced by their own fields (never the legacy ₹100).
  "wooden_stand",
  "bundle_essential",
  "bundle_signature",
  "bundle_mug",
  "bundle_digital",
  "bundle_magnet",
  "packaging_standard",
  "packaging_premium",
  "greeting_card",
]);

function addonTokens(addon?: string) {
  return (addon || "none")
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean);
}

/** Add-ons priced from the `addon` text itself: Halo Effect and the legacy ₹100 illustrations. */
export function pricedAddonTokens(addon?: string) {
  return addonTokens(addon).filter((token) => token === "halo_effect" || !LISTED_ADDONS.has(token));
}

/** Desk Portrait / Signature Gift Bundle quote. Shared by getPortraitBreakdown and calculatePortraitBasePrice. */
function newProductBreakdown(input: PricingInput, catalog: PriceCatalog) {
  const qty = Math.max(1, input.cartQty || 1);
  const extras = extraProductLines(input, catalog);
  const extrasAmount = extras.reduce((sum, line) => sum + line.price, 0);
  const portraitLines: PriceLine[] = [];

  if (input.configurator === "mini_desk") {
    // One fixed size: never the framed/canvas size price, pets upgrade, halo, family, tribute or premium background.
    const base = deskUnitPrice(catalog, "one");
    const extraPets = deskExtraPetAmount(catalog, input.numPets);
    const priority = input.priorityPreview ? (catalog.priorityPreview ?? DEFAULT_CATALOG.priorityPreview) : 0;
    const wrap = input.giftWrap ? catalog.giftWrap : 0;
    portraitLines.push({ id: "desk_base", label: "Desk Portrait", price: base * qty });
    if (extraPets > 0) {
      portraitLines.push({ id: "desk_pets", label: `${PET_COUNT_LABELS[input.numPets || "one"] || "Pets"} extra`, price: extraPets * qty });
    }
    if (priority > 0) portraitLines.push({ id: "priority", label: "Priority Preview", price: priority * qty });
    if (wrap > 0) portraitLines.push({ id: "wrap", label: "Gift Wrap", price: wrap * qty });
    return {
      style: "framed" as PortraitStyle,
      size: input.size || "",
      sizePrice: 0,
      family: 0,
      petUpgrade: 0,
      halo: 0,
      tribute: 0,
      priority: priority * qty,
      wrap: wrap * qty,
      premiumBg: 0,
      deskBase: base * qty,
      deskExtraPets: extraPets * qty,
      bundleTier: 0,
      greeting: 0,
      extras,
      extrasAmount,
      portraitLines,
      portraitSubtotal: (base + extraPets + priority + wrap) * qty,
    };
  }

  // Gift bundle: tier + the live style/size price + the optional greeting card. No pets upgrade, premium bg, priority,
  // halo or gift wrap (packaging is included); the server refuses those for bundles.
  const style: PortraitStyle = input.portraitStyle === "canvas" ? "canvas" : "framed";
  const size = input.size || (style === "canvas" ? '8"x12"' : '8"x10"');
  const sizePrice =
    style === "framed"
      ? (catalog.framed[size] ?? catalog.framed['8"x10"'] ?? 0)
      : (catalog.canvas[size] ?? catalog.canvas['8"x12"'] ?? 0);
  const tierPrice = bundleTierAmount(catalog, input.bundleTier);
  const greeting = greetingCardAmount(catalog, input);
  const tierLabel = input.bundleTier === "signature" ? "Signature Gift Bundle" : "Essential Gift Bundle";
  portraitLines.push({
    id: "bundle",
    label: `${tierLabel} · ${PORTRAIT_STYLE_LABELS[style]} · ${size}`,
    price: (tierPrice + sizePrice) * qty,
  });
  if (greeting > 0) portraitLines.push({ id: "greeting", label: "Personalised Greeting Card", price: greeting * qty });
  return {
    style,
    size,
    sizePrice: sizePrice * qty,
    family: 0,
    petUpgrade: 0,
    halo: 0,
    tribute: 0,
    priority: 0,
    wrap: 0,
    premiumBg: 0,
    deskBase: 0,
    deskExtraPets: 0,
    bundleTier: tierPrice * qty,
    greeting: greeting * qty,
    extras,
    extrasAmount,
    portraitLines,
    portraitSubtotal: (tierPrice + sizePrice + greeting) * qty,
  };
}

function isNewProductInput(input: PricingInput) {
  return input.configurator === "mini_desk" || input.configurator === "gift_bundle";
}

export function getPortraitBreakdown(input: PricingInput, catalog: PriceCatalog = DEFAULT_CATALOG) {
  if (isNewProductInput(input)) return newProductBreakdown(input, catalog);
  const style: PortraitStyle = input.portraitStyle === "canvas" ? "canvas" : "framed";
  const size = input.size || (style === "canvas" ? '8"x12"' : '8"x10"');
  const sizePrice =
    style === "framed"
      ? (catalog.framed[size] ?? catalog.framed['8"x10"'] ?? 0)
      : (catalog.canvas[size] ?? catalog.canvas['8"x12"'] ?? 0);
  const petUpgrade = catalog.pets[input.numPets || "one"] ?? 0;
  const halo = addonTokens(input.addon).includes("halo_effect") ? catalog.halo : 0;
  const family = familyUpgradeAmount(input, catalog);
  const tribute = tributeAmount(input, catalog);
  const priority = input.priorityPreview ? (catalog.priorityPreview ?? DEFAULT_CATALOG.priorityPreview) : 0;
  const wrap = input.giftWrap ? catalog.giftWrap : 0;
  const premiumBg = isLimitedEditionBackground(input.background, catalog) ? catalog.premiumBackground : 0;
  const qty = Math.max(1, input.cartQty || 1);
  const extras = extraProductLines(input, catalog);

  // The family upgrade is part of the main product line, never a separate add-on (You & Your Pet handoff).
  const portraitLines: PriceLine[] = [
    { id: "size", label: `${PORTRAIT_STYLE_LABELS[style]} · ${size}`, price: (sizePrice + family) * qty },
  ];
  if (petUpgrade > 0) {
    portraitLines.push({
      id: "pets",
      label: `${PET_COUNT_LABELS[input.numPets || "one"] || "Pets"} upgrade`,
      price: petUpgrade * qty,
    });
  }
  if (halo > 0) portraitLines.push({ id: "halo", label: "Halo Effect", price: halo * qty });
  if (tribute > 0) portraitLines.push({ id: "tribute", label: "A Special Tribute (halo)", price: tribute * qty });
  if (priority > 0) portraitLines.push({ id: "priority", label: "Priority Preview", price: priority * qty });
  if (wrap > 0) portraitLines.push({ id: "wrap", label: "Gift Wrap", price: wrap * qty });
  if (premiumBg > 0) portraitLines.push({ id: "bg", label: "Limited Edition background", price: premiumBg * qty });

  const portraitSubtotal = (sizePrice + family + petUpgrade + halo + tribute + priority + wrap + premiumBg) * qty;
  return {
    style,
    size,
    sizePrice: sizePrice * qty,
    family: family * qty,
    petUpgrade: petUpgrade * qty,
    halo: halo * qty,
    tribute: tribute * qty,
    priority: priority * qty,
    wrap: wrap * qty,
    premiumBg: premiumBg * qty,
    deskBase: 0,
    deskExtraPets: 0,
    bundleTier: 0,
    greeting: 0,
    extras,
    extrasAmount: extras.reduce((sum, line) => sum + line.price, 0),
    portraitLines,
    portraitSubtotal,
  };
}

export function normalizeCouponCode(code?: string | null) {
  return (code || "").trim().toUpperCase();
}

export function getCoupon(code?: string | null) {
  const normalized = normalizeCouponCode(code);
  if (!normalized) return { ok: true as const, coupon: null, code: null };
  const coupon = COUPONS[normalized];
  if (!coupon) return { ok: false as const, error: "This coupon code is invalid." };
  if (!coupon.active) return { ok: false as const, error: "This coupon has expired or is no longer active." };
  return { ok: true as const, coupon, code: normalized };
}

export function calculatePortraitBasePrice(input: PricingInput, catalog: PriceCatalog = DEFAULT_CATALOG) {
  // New products: exactly the breakdown (portrait part × qty, extras once), so the charge and coupon base agree.
  // Their `addon` text is never priced (the server derives those tokens).
  if (isNewProductInput(input)) {
    const breakdown = newProductBreakdown(input, catalog);
    return breakdown.portraitSubtotal + breakdown.extrasAmount;
  }
  const style: PortraitStyle = input.portraitStyle === "canvas" ? "canvas" : "framed";
  const size = input.size || (style === "canvas" ? '8"x12"' : '8"x10"');
  let price =
    style === "framed"
      ? (catalog.framed[size] ?? catalog.framed['8"x10"'] ?? 0)
      : (catalog.canvas[size] ?? catalog.canvas['8"x12"'] ?? 0);

  price += catalog.pets[input.numPets || "one"] ?? 0;
  price += familyUpgradeAmount(input, catalog);
  price += tributeAmount(input, catalog);

  if (isLimitedEditionBackground(input.background, catalog)) {
    price += catalog.premiumBackground;
  }

  const addons = addonTokens(input.addon);
  if (addons.includes("halo_effect")) price += catalog.halo;
  // Legacy illustration add-ons (bow tie, heart) cost ₹100 each; listed add-ons are priced by their own fields.
  price += addons.filter((addon) => !LISTED_ADDONS.has(addon)).length * 100;

  if (input.priorityPreview) price += catalog.priorityPreview ?? DEFAULT_CATALOG.priorityPreview;
  if (input.giftWrap) price += catalog.giftWrap;

  const qty = Math.max(1, input.cartQty || 1);
  price *= qty;

  if (input.addMagnet) price += catalog.magnet.price;
  if (input.addMug) price += catalog.mug.price;
  if (input.addDigitalDownload) price += catalog.digital.price;
  if (input.addDesk) price += (catalog.desk || DEFAULT_CATALOG.desk).price;

  return price;
}

export function calculateOriginalAmount(input: PricingInput, catalog: PriceCatalog = DEFAULT_CATALOG) {
  switch (input.productType) {
    case "custom_payment": {
      const amount = Number(input.customPaymentAmount);
      if (catalog.customPayments.includes(amount)) return amount;
      throw new Error("Select a valid Custom Payment amount.");
    }
    case "fresh_payment":
      return catalog.freshPayment;
    case "digital_download": {
      const amount = Number(input.digitalDownloadAmount);
      if (catalog.digitalDownloads.includes(amount)) return amount;
      throw new Error("Select a valid Digital Download amount.");
    }
    case "landing_offer": {
      const amount = Math.round(Number(input.offerAmount));
      if (!Number.isInteger(amount) || amount < 1) throw new Error("This product is not available.");
      return amount;
    }
    default:
      return calculatePortraitBasePrice(input, catalog);
  }
}

function couponEligibleAmount(input: PricingInput, catalog: PriceCatalog, appliesTo: CouponScope[]) {
  const scopes = appliesTo.includes("all") ? (["all"] as CouponScope[]) : appliesTo;
  if (scopes.includes("all")) return calculateOriginalAmount(input, catalog);

  if (input.productType === "digital_download") {
    return scopes.includes("digital") ? calculateOriginalAmount(input, catalog) : 0;
  }
  if (input.productType !== "portrait") return 0;

  const breakdown = getPortraitBreakdown(input, catalog);
  let sum = 0;
  if (scopes.includes("portrait")) sum += breakdown.portraitSubtotal;
  for (const line of breakdown.extras) {
    if (line.id === "mug" && scopes.includes("mug")) sum += line.price;
    if (line.id === "magnet" && scopes.includes("magnet")) sum += line.price;
    if (line.id === "digital" && scopes.includes("digital")) sum += line.price;
  }
  return sum;
}

function ruleFromLegacy(code: string): CouponRule | null {
  const legacy = getCoupon(code);
  if (!legacy.ok) throw new Error(legacy.error);
  if (!legacy.coupon || !legacy.code) return null;
  return {
    code: legacy.code,
    discountType: "percent",
    discountValue: legacy.coupon.percent,
    appliesTo: ["all"],
    minOrderAmount: null,
  };
}

function ruleFromCode(code: string): CouponRule | null {
  const offer = saveOfferRule(code);
  if (offer) return offer;
  return ruleFromLegacy(code);
}

export function productAllowsCod(productType: ProductType) {
  return productType === "portrait" || productType === "landing_offer";
}

/**
 * Coupon applies first, only to the products it is allowed to cover.
 * Prepaid percent then applies to the full amount after that coupon.
 * Cash on delivery does not get the prepaid discount. Pay-now is the advance percent of the amount after coupon.
 */
export function calculateQuote(input: PricingInput, catalog: PriceCatalog = DEFAULT_CATALOG): Quote {
  const productType = input.productType || "portrait";
  const paymentMethod: PaymentMethod =
    input.paymentMethod === "cod" && productAllowsCod(productType) ? "cod" : "prepaid";

  const originalAmount = calculateOriginalAmount(input, catalog);
  const rule = input.couponRule ? input.couponRule : input.couponCode ? ruleFromCode(input.couponCode) : null;

  let couponDiscount = 0;
  if (rule) {
    if (rule.minOrderAmount != null && originalAmount < rule.minOrderAmount) {
      throw new Error(`This coupon needs an order of at least ${formatRupee(rule.minOrderAmount)}.`);
    }
    const eligible = couponEligibleAmount(input, catalog, rule.appliesTo);
    if (eligible <= 0) {
      throw new Error("This coupon does not apply to the products in this order.");
    }
    couponDiscount =
      rule.discountType === "fixed"
        ? Math.min(rule.discountValue, eligible)
        : rupees(eligible * (rule.discountValue / 100));
  }

  const afterCouponAmount = originalAmount - couponDiscount;
  const allowsCod = productAllowsCod(productType);
  const prepaidPercent = paymentMethod === "prepaid" ? catalog.prepaidPercent : 0;
  const prepaidDiscount = rupees(afterCouponAmount * (prepaidPercent / 100));
  const advancePercent = catalog.codAdvancePercent;
  const remainingPercent = 100 - advancePercent;

  const shared = {
    productType,
    productLabel: input.productLabel || PRODUCT_LABELS[productType],
    originalAmount,
    couponCode: rule?.code ?? null,
    couponType: rule?.discountType ?? null,
    couponValue: rule?.discountValue ?? 0,
    couponPercent: rule?.discountType === "percent" ? rule.discountValue : 0,
    couponDiscount,
    couponRule: rule,
    afterCouponAmount,
    allowsCod,
  };

  if (paymentMethod === "cod") {
    const advanceAmount = rupees(afterCouponAmount * (advancePercent / 100));
    const remainingAmount = afterCouponAmount - advanceAmount;
    return {
      ...shared,
      prepaidDiscount: 0,
      prepaidPercent: 0,
      advancePercent,
      remainingPercent,
      advanceAmount,
      remainingAmount,
      payableNow: advanceAmount,
      paymentMethod,
    };
  }

  const payableNow = afterCouponAmount - prepaidDiscount;
  return {
    ...shared,
    prepaidDiscount,
    prepaidPercent,
    advancePercent: 100,
    remainingPercent: 0,
    advanceAmount: payableNow,
    remainingAmount: 0,
    payableNow,
    paymentMethod,
  };
}

export function formatRupee(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

export function formatRs(value: number) {
  return `Rs. ${Math.round(value).toLocaleString("en-IN")}`;
}

export function couponOffLabel(quote: Pick<Quote, "couponType" | "couponValue" | "couponPercent">) {
  if (quote.couponType === "fixed") return formatRupee(quote.couponValue);
  return `${quote.couponPercent}%`;
}
