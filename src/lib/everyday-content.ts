// Everyday Pet Portrait configurator copy, switches and background list.
// Defaults live here; Admin → Configurator saves overrides that are merged on top.
// Prices never live here: they come from Admin → Pricing.

import { ALL_BACKGROUNDS, BACKGROUNDS, LIMITED_BACKGROUNDS } from "@/lib/backgrounds";

export const TRUST_ICONS = ["shield", "truck", "heart", "eye", "brush", "star", "refresh", "gift", "clock", "paw"] as const;
export type TrustIcon = (typeof TRUST_ICONS)[number];

export type TrustItem = { icon: TrustIcon; label: string };

export type EverydayBackground = { id: string; label: string; visible: boolean };

export type ExtraCopy = { label: string; description: string; visible: boolean };

export type ExtraId = "mug" | "magnet" | "digital" | "desk";

export const EXTRA_IDS: ExtraId[] = ["mug", "magnet", "digital", "desk"];

export type EverydayContent = {
  header: {
    productName: string;
    backLabel: string;
    stepLabel: string;
    completeLabel: string;
    discountPercent: number;
    discountBadge: string;
  };
  step1: {
    progressName: string;
    title: string;
    description: string;
    styleHeading: string;
    framedTitle: string;
    framedDescription: string;
    canvasTitle: string;
    canvasDescription: string;
    previewLabel: string;
    sizeHeading: string;
    sizeDescription: string;
    unavailableLabel: string;
    outOfStockLabel: string;
    continueLabel: string;
    showTrust: boolean;
    showDeliveryEstimate: boolean;
  };
  step2: {
    progressName: string;
    title: string;
    description: string;
    showFrameColor: boolean;
    frameHeading: string;
    blackFrameLabel: string;
    whiteFrameLabel: string;
    backgroundHeading: string;
    premiumHint: string;
    limitedHeading: string;
    limitedPrice: string;
    optionalLabel: string;
    petNameHeading: string;
    petNameDescription: string;
    petNamePlaceholder: string;
    petNameMax: number;
    subtitleHeading: string;
    subtitleDescription: string;
    subtitlePlaceholder: string;
    subtitleMax: number;
    showPriority: boolean;
    priorityTitle: string;
    priorityPrice: string;
    priorityDescription: string;
    priorityInfo: string;
    continueLabel: string;
  };
  step3: {
    progressName: string;
    title: string;
    description: string;
    guideTitle: string;
    guideDescription: string;
    uploadHeading: string;
    uploadTitle: string;
    uploadHint: string;
    uploadingLabel: string;
    removeLabel: string;
    detailsHeading: string;
    detailsDescription: string;
    nameLabel: string;
    namePlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    optionalLabel: string;
    reassurance: string;
    addToCartLabel: string;
    showTrust: boolean;
  };
  trust: TrustItem[];
  backgrounds: EverydayBackground[];
  cart: {
    banner: string;
    title: string;
    emptyTitle: string;
    emptyText: string;
    emptyButton: string;
    styleLabel: string;
    sizeLabel: string;
    backgroundLabel: string;
    frameLabel: string;
    petNameLabel: string;
    subtitleLabel: string;
    photoLabel: string;
    priorityLabel: string;
    notAddedLabel: string;
    removeLabel: string;
    extrasHeading: string;
    optionalLabel: string;
    showGift: boolean;
    giftHeading: string;
    giftTitle: string;
    giftDescription: string;
    couponHeading: string;
    couponPlaceholder: string;
    applyLabel: string;
    removeCouponLabel: string;
    subtotalLabel: string;
    itemWord: string;
    itemsWord: string;
    discountLabel: string;
    totalLabel: string;
    checkoutLabel: string;
  };
  extras: Record<ExtraId, ExtraCopy>;
};

export const DEFAULT_EVERYDAY_CONTENT: EverydayContent = {
  header: {
    productName: "Everyday Pet Portrait",
    backLabel: "Back",
    stepLabel: "Step {step} of {total} - {name}",
    completeLabel: "{percent}% Complete",
    discountPercent: 30,
    discountBadge: "{percent}% OFF",
  },
  step1: {
    progressName: "Choose Your Portrait",
    title: "Choose Your Portrait",
    description: "Select your preferred portrait style and size. We'll create a beautiful, hand-drawn portrait of your pet.",
    styleHeading: "1. Select Portrait Style",
    framedTitle: "Framed Portrait",
    framedDescription: "A ready-to-hang framed portrait for your home.",
    canvasTitle: "Canvas Portrait",
    canvasDescription: "A premium canvas print with a modern look.",
    previewLabel: "Preview",
    sizeHeading: "2. Choose Your Size",
    sizeDescription: "Select the size that best fits your space.",
    unavailableLabel: "Temporarily unavailable",
    outOfStockLabel: "Out of stock",
    continueLabel: "Continue",
    showTrust: true,
    showDeliveryEstimate: true,
  },
  step2: {
    progressName: "Personalize Your Portrait",
    title: "Personalize Your Portrait",
    description: "Choose a background and add optional details to make it uniquely yours.",
    showFrameColor: true,
    frameHeading: "Choose a Frame Colour",
    blackFrameLabel: "Black Frame",
    whiteFrameLabel: "White Frame",
    backgroundHeading: "1. Choose a Background",
    premiumHint: "Premium + {price}",
    limitedHeading: "Limited Edition Backgrounds",
    limitedPrice: "+ {price}",
    optionalLabel: "(Optional)",
    petNameHeading: "2. Add Your Pet's Name",
    petNameDescription: "Show your pet's name on the portrait.",
    petNamePlaceholder: "Enter your pet's name",
    petNameMax: 20,
    subtitleHeading: "3. Add a Subtitle",
    subtitleDescription: "Add a short message or quote (e.g. Our Little Sunshine).",
    subtitlePlaceholder: "Our Little Sunshine",
    subtitleMax: 30,
    showPriority: true,
    priorityTitle: "Priority Preview",
    priorityPrice: "+ {price}",
    priorityDescription: "Get your preview within 1 working day (Instead of 2–3 days).",
    priorityInfo: "Your portrait moves to the front of our artists' queue, so your first preview reaches you faster.",
    continueLabel: "Continue",
  },
  step3: {
    progressName: "Upload Your Photo",
    title: "Upload Your Photo",
    description: "Choose a clear photo of your furry friend. We'll turn it into a beautiful, hand-drawn portrait you'll love.",
    guideTitle: "Photo Guide",
    guideDescription: "See example photos and helpful tips to get the best result.",
    uploadHeading: "1. Upload a Photo",
    uploadTitle: "Choose Image",
    uploadHint: "JPG, PNG or HEIC (Max 10MB)",
    uploadingLabel: "Uploading…",
    removeLabel: "Remove",
    detailsHeading: "2. Your Details",
    detailsDescription: "Where can we reach you with updates about your portrait?",
    nameLabel: "Full Name",
    namePlaceholder: "Enter your full name",
    phoneLabel: "Mobile Number",
    phonePlaceholder: "98765 43210",
    emailLabel: "Email Address",
    emailPlaceholder: "you@example.com",
    optionalLabel: "(Optional)",
    reassurance: "You'll receive a preview before printing, with unlimited revisions to get your portrait just right.",
    addToCartLabel: "Add to Cart",
    showTrust: true,
  },
  trust: [
    { icon: "shield", label: "Preview before printing" },
    { icon: "truck", label: "Free shipping across India" },
    { icon: "heart", label: "Hand-drawn with love" },
  ],
  backgrounds: [
    ...BACKGROUNDS.map((bg) => ({ id: bg.name, label: bg.label || bg.name, visible: true })),
    ...LIMITED_BACKGROUNDS.map((bg) => ({ id: bg.name, label: bg.label || bg.name, visible: true })),
  ],
  cart: {
    banner: "Your Selection",
    title: "Your Cart",
    emptyTitle: "Your Cart is Empty",
    emptyText: "Complete the 3-step customizer and tap Add to Cart to review your portrait here.",
    emptyButton: "Continue customizing",
    styleLabel: "Portrait style",
    sizeLabel: "Size",
    backgroundLabel: "Background",
    frameLabel: "Frame color",
    petNameLabel: "Pet name",
    subtitleLabel: "Subtitle",
    photoLabel: "Uploaded photo",
    priorityLabel: "Priority Preview",
    notAddedLabel: "Not added",
    removeLabel: "Remove",
    extrasHeading: "Additional Products",
    optionalLabel: "Optional",
    showGift: true,
    giftHeading: "Gift Wrapping",
    giftTitle: "Make it gift-ready 🎁",
    giftDescription: "We'll beautifully wrap your portrait, ready to gift to someone special.",
    couponHeading: "Coupon Code",
    couponPlaceholder: "Enter coupon code",
    applyLabel: "Apply",
    removeCouponLabel: "Remove",
    subtotalLabel: "Subtotal ({count} {items})",
    itemWord: "item",
    itemsWord: "items",
    discountLabel: "Discount",
    totalLabel: "Total",
    checkoutLabel: "Proceed to Checkout",
  },
  extras: {
    mug: { label: "Custom Pet Mug", description: "Create a custom mug using your pet's image.", visible: true },
    magnet: { label: "Custom Pet Fridge Magnet", description: "A custom fridge magnet of your pet.", visible: true },
    digital: { label: "Digital Download", description: "Digital files suitable for wallpapers and other digital uses.", visible: true },
    desk: { label: "Desk Portrait", description: "A compact portrait with wooden stand, perfect for your desk.", visible: true },
  },
};

/** Numeric fields and the range admin may set. */
export const NUMBER_LIMITS: Record<string, { min: number; max: number }> = {
  "header.discountPercent": { min: 0, max: 90 },
  "step2.petNameMax": { min: 5, max: 40 },
  "step2.subtitleMax": { min: 10, max: 60 },
};

const MAX_TEXT = 600;

type Flat = Record<string, string | number | boolean>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/** Copies only the keys the defaults know, with the same primitive type. */
function mergeFlat<T extends Flat>(defaults: T, raw: unknown, path: string): T {
  const out = { ...defaults };
  if (!isRecord(raw)) return out;
  for (const key of Object.keys(defaults) as (keyof T & string)[]) {
    const base = defaults[key];
    const value = raw[key];
    if (typeof base === "string" && typeof value === "string") {
      out[key] = value.slice(0, MAX_TEXT) as T[typeof key];
    } else if (typeof base === "boolean" && typeof value === "boolean") {
      out[key] = value as T[typeof key];
    } else if (typeof base === "number" && typeof value === "number" && Number.isFinite(value)) {
      const limit = NUMBER_LIMITS[`${path}.${key}`];
      const rounded = Math.round(value);
      out[key] = (limit ? Math.min(limit.max, Math.max(limit.min, rounded)) : rounded) as T[typeof key];
    }
  }
  return out;
}

function mergeTrust(raw: unknown): TrustItem[] {
  if (!Array.isArray(raw)) return DEFAULT_EVERYDAY_CONTENT.trust.map((item) => ({ ...item }));
  const items: TrustItem[] = [];
  for (const entry of raw.slice(0, 4)) {
    if (!isRecord(entry)) continue;
    const icon = TRUST_ICONS.includes(entry.icon as TrustIcon) ? (entry.icon as TrustIcon) : "heart";
    const label = typeof entry.label === "string" ? entry.label.slice(0, 80) : "";
    items.push({ icon, label });
  }
  return items;
}

/** Keeps every known background exactly once, in the saved order, new ones appended. */
function mergeBackgrounds(raw: unknown): EverydayBackground[] {
  const defaults = DEFAULT_EVERYDAY_CONTENT.backgrounds;
  const known = new Set(ALL_BACKGROUNDS.map((bg) => bg.name));
  const out: EverydayBackground[] = [];
  const seen = new Set<string>();
  if (Array.isArray(raw)) {
    for (const entry of raw) {
      if (!isRecord(entry) || typeof entry.id !== "string") continue;
      if (!known.has(entry.id) || seen.has(entry.id)) continue;
      const base = defaults.find((bg) => bg.id === entry.id)!;
      seen.add(entry.id);
      out.push({
        id: entry.id,
        label: typeof entry.label === "string" && entry.label.trim() ? entry.label.slice(0, 40) : base.label,
        visible: typeof entry.visible === "boolean" ? entry.visible : true,
      });
    }
  }
  for (const bg of defaults) {
    if (!seen.has(bg.id)) out.push({ ...bg });
  }
  return out;
}

/** Saved JSON → full content. Unknown keys are dropped; missing keys use the defaults. */
export function mergeEverydayContent(raw: unknown): EverydayContent {
  const source = isRecord(raw) ? raw : {};
  const d = DEFAULT_EVERYDAY_CONTENT;
  const extrasRaw = isRecord(source.extras) ? source.extras : {};
  return {
    header: mergeFlat(d.header, source.header, "header"),
    step1: mergeFlat(d.step1, source.step1, "step1"),
    step2: mergeFlat(d.step2, source.step2, "step2"),
    step3: mergeFlat(d.step3, source.step3, "step3"),
    trust: mergeTrust(source.trust),
    backgrounds: mergeBackgrounds(source.backgrounds),
    cart: mergeFlat(d.cart, source.cart, "cart"),
    extras: {
      mug: mergeFlat(d.extras.mug, extrasRaw.mug, "extras.mug"),
      magnet: mergeFlat(d.extras.magnet, extrasRaw.magnet, "extras.magnet"),
      digital: mergeFlat(d.extras.digital, extrasRaw.digital, "extras.digital"),
      desk: mergeFlat(d.extras.desk, extrasRaw.desk, "extras.desk"),
    },
  };
}

/** "Premium + {price}" → "Premium + ₹199". Unknown placeholders are left as typed. */
export function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : match
  );
}

/** Crossed-out "was" price for the header, from the discount percent. */
export function compareAtPrice(price: number, discountPercent: number) {
  const percent = Math.min(90, Math.max(0, discountPercent));
  if (percent <= 0) return price;
  return Math.round(price / (1 - percent / 100));
}
