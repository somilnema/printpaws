// Landing page (/landing) and home page (/) copy. These are the defaults: Admin → Landing & home saves
// overrides (content/landing.json in the site-media bucket) that are merged on top.
// Layout lives in src/components/landing. Prices never live here: "{price}" and "{percent}" come from Pricing.

import { REVIEWS } from "@/lib/reviews";
import { fallbackUrl, mediaSlot, mediaSlotForKey } from "@/lib/site-media-catalog";

/** Icons a hero benefit can show. */
export const BENEFIT_ICONS = ["preview", "revisions", "shipping", "heart", "gift", "star", "shield", "clock", "brush", "paw"] as const;
export type BenefitIcon = (typeof BENEFIT_ICONS)[number];

export type LandingAnnouncement = {
  text: string;
  /** Shown only while this coupon is live in Admin → Coupons. "" shows it always. */
  couponCode: string;
};

export type LandingBenefit = { icon: BenefitIcon; label: string };

/** A clip in the video row: a Media video slot and the caption over it. */
export type LandingClip = { slot: string; caption: string };

/** A review card. `photo` is a Media image slot ("" shows no photo). */
export type LandingReview = { name: string; text: string; rating: number; verified: boolean; photo: string };

export type LandingContent = {
  /** Browser tab and search result for /landing. */
  seo: { title: string; description: string };
  announcements: LandingAnnouncement[];
  hero: { headline: string; headlineAccent: string; text: string; imageAlt: string; cta: string };
  benefits: LandingBenefit[];
  portraits: { title: string; text: string; fromLabel: string; comingSoonLabel: string };
  video: { show: boolean; title: string; text: string };
  clips: LandingClip[];
  reviews: { show: boolean; title: string; text: string; verifiedLabel: string };
  reviewItems: LandingReview[];
  finalCta: { show: boolean; headline: string; text: string; cta: string };
  /** Home page (/): breadcrumb, the line under the phone headline and the rating row. */
  home: { breadcrumbHome: string; breadcrumbProduct: string; subtitle: string; showRating: boolean; rating: number; ratingLabel: string };
  /** Home page announcement bar. "{percent}" is the prepaid discount from Pricing; that message hides while it is 0. */
  homeAnnouncements: string[];
};

/** Longest lists the admin can build. */
export const LANDING_LIMITS = { announcements: 6, benefits: 3, clips: 8, reviews: 20, homeAnnouncements: 6 };

/** Number fields and the range admin may set. */
export const LANDING_NUMBER_LIMITS: Record<string, { min: number; max: number; step: number }> = {
  "home.rating": { min: 0, max: 5, step: 0.5 },
};

/** The shop's own reviews that have a photo, as they appear on the landing page today. */
export function builtInReviews(): LandingReview[] {
  return REVIEWS.filter((review) => review.image).map((review) => ({
    name: review.name,
    text: review.text,
    rating: review.rating,
    verified: review.verified,
    photo: mediaSlotForKey(review.image!)?.id || "",
  }));
}

export const DEFAULT_LANDING_CONTENT: LandingContent = {
  seo: {
    title: "Custom Pet Portraits | Peternity",
    description: "Turn your favourite pet photo into a personalized portrait made just for you.",
  },
  announcements: [
    { text: "Free Shipping Across India", couponCode: "" },
    { text: "Use Code PETLOVE10", couponCode: "PETLOVE10" },
  ],
  hero: {
    headline: "Their face.",
    headlineAccent: "Your favourite feeling.",
    text: "Turn your favourite pet photo into a personalized portrait made just for you.",
    imageAlt: "A pet beside its personalized portrait",
    cta: "Explore Our Portraits",
  },
  benefits: [
    { icon: "preview", label: "Preview before printing" },
    { icon: "revisions", label: "Unlimited revisions" },
    { icon: "shipping", label: "Free shipping across India" },
  ],
  portraits: {
    title: "Find Your Perfect Portrait",
    text: "Choose a style that matches your story.",
    fromLabel: "From {price}",
    comingSoonLabel: "Coming soon",
  },
  video: {
    show: true,
    title: "Real Pets. Real Memories.",
    text: "See how pet parents turn their favourite moments into something they can keep forever.",
  },
  // Admin → Media → Unboxing videos. Captions describe the videos uploaded there, so change both together.
  clips: [
    { slot: "unboxing-1", caption: "Meet Rose" }, // Real reaction
    { slot: "unboxing-2", caption: "Side by Side" }, // Unboxing and reveal
    { slot: "unboxing-7", caption: "A Birthday Gift" }, // Pure joy
    { slot: "unboxing-4", caption: "Unwrapping Roxy" }, // A gift that lasts
    { slot: "unboxing-5", caption: "A Family Reveal" }, // The perfect memory
  ],
  reviews: {
    show: true,
    title: "Loved by Pet Parents",
    text: "Every portrait has a story. Here's what our customers have to say.",
    verifiedLabel: "Verified Purchase",
  },
  reviewItems: builtInReviews(),
  finalCta: {
    show: true,
    headline: "Your Favourite Photo Deserves More Than a Camera Roll.",
    text: "Turn it into a personalized portrait you'll love seeing every day.",
    cta: "Create Your Portraits",
  },
  home: {
    breadcrumbHome: "Home",
    breadcrumbProduct: "Custom Pet Portrait",
    subtitle: "Free shipping across India",
    showRating: true,
    rating: 4.5,
    ratingLabel: "Trustpilot",
  },
  homeAnnouncements: ["Forever Starts Here", "Refined Until Perfect", "{percent}% Off (Prepaid Orders)"],
};

/** Shown under the final call to action until a closing photo is uploaded. */
export const FINAL_CTA_FALLBACK_IMAGE = "/review-image/review-7.png";

/** Shown on the right of the hero until a hero photo is uploaded. */
export const HERO_FALLBACK_IMAGE = "/Not just a image its them.png";

const MAX_TEXT = 600;

type Flat = Record<string, string | number | boolean>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.slice(0, max) : "";
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
      const limit = LANDING_NUMBER_LIMITS[`${path}.${key}`];
      const stepped = limit ? Math.round(value / limit.step) * limit.step : Math.round(value);
      out[key] = (limit ? Math.min(limit.max, Math.max(limit.min, stepped)) : stepped) as T[typeof key];
    }
  }
  return out;
}

/** A saved list, or a copy of the defaults when nothing usable was saved. */
function mergeList<T>(raw: unknown, defaults: T[], max: number, read: (entry: Record<string, unknown>) => T | null): T[] {
  if (!Array.isArray(raw)) return defaults.map((item) => ({ ...item }));
  const out: T[] = [];
  for (const entry of raw) {
    if (out.length >= max) break;
    const item = isRecord(entry) ? read(entry) : null;
    if (item) out.push(item);
  }
  return out;
}

function isIcon(value: unknown): value is BenefitIcon {
  return BENEFIT_ICONS.includes(value as BenefitIcon);
}

/** A Media slot id of this kind, or "". */
function slotOf(value: unknown, kind: "image" | "video") {
  return typeof value === "string" && mediaSlot(value)?.kind === kind ? value : "";
}

/** Saved JSON → full content. Unknown keys are dropped; missing keys use the defaults. */
export function mergeLandingContent(raw: unknown): LandingContent {
  const source = isRecord(raw) ? raw : {};
  const d = DEFAULT_LANDING_CONTENT;
  return {
    seo: mergeFlat(d.seo, source.seo, "seo"),
    announcements: mergeList(source.announcements, d.announcements, LANDING_LIMITS.announcements, (entry) => {
      const message = text(entry.text, 120).trim();
      if (!message) return null;
      return { text: message, couponCode: text(entry.couponCode, 40).trim().toUpperCase() };
    }),
    hero: mergeFlat(d.hero, source.hero, "hero"),
    benefits: mergeList(source.benefits, d.benefits, LANDING_LIMITS.benefits, (entry) => {
      const label = text(entry.label, 80).trim();
      return label ? { icon: isIcon(entry.icon) ? entry.icon : "heart", label } : null;
    }),
    portraits: mergeFlat(d.portraits, source.portraits, "portraits"),
    video: mergeFlat(d.video, source.video, "video"),
    clips: mergeList(source.clips, d.clips, LANDING_LIMITS.clips, (entry) => {
      const slot = slotOf(entry.slot, "video");
      return slot ? { slot, caption: text(entry.caption, 80) } : null;
    }),
    reviews: mergeFlat(d.reviews, source.reviews, "reviews"),
    reviewItems: mergeList(source.reviewItems, d.reviewItems, LANDING_LIMITS.reviews, (entry) => {
      const body = text(entry.text, MAX_TEXT).trim();
      if (!body) return null;
      const rating = typeof entry.rating === "number" && Number.isFinite(entry.rating) ? Math.round(entry.rating) : 5;
      return {
        name: text(entry.name, 60).trim(),
        text: body,
        rating: Math.min(5, Math.max(1, rating)),
        verified: entry.verified === true,
        photo: slotOf(entry.photo, "image"),
      };
    }),
    finalCta: mergeFlat(d.finalCta, source.finalCta, "finalCta"),
    home: mergeFlat(d.home, source.home, "home"),
    homeAnnouncements: Array.isArray(source.homeAnnouncements)
      ? source.homeAnnouncements
          .map((entry) => text(entry, 120).trim())
          .filter(Boolean)
          .slice(0, LANDING_LIMITS.homeAnnouncements)
      : [...d.homeAnnouncements],
  };
}

/** "From {price}" → "From ₹1,499". */
export function fillPrice(template: string, price: string) {
  return template.replace(/\{price\}/g, price);
}

/** Announcement text with the prepaid discount filled in; "" while a "{percent}" message has no discount to show. */
export function fillPercent(template: string, percent: number | null) {
  if (!template.includes("{percent}")) return template;
  return percent && percent > 0 ? template.replace(/\{percent\}/g, String(percent)) : "";
}

/** Shop URL of a Media slot: the admin upload, else its original file ("" when it has none). */
export function slotUrl(id: string, media: Record<string, string>) {
  const slot = mediaSlot(id);
  return slot ? media[slot.id] || fallbackUrl(slot) : "";
}
