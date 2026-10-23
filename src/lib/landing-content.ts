// Landing page copy. Change text here; layout lives in src/components/landing.

export type Announcement = {
  text: string;
  /** Shown only while this coupon is live in Admin → Coupons. */
  couponCode?: string;
};

export const ANNOUNCEMENTS: Announcement[] = [
  { text: "Free Shipping Across India" },
  { text: "Use Code PETLOVE10", couponCode: "PETLOVE10" },
];

export const HERO = {
  headline: "Their face.",
  headlineAccent: "Your favourite feeling.",
  text: "Turn your favourite pet photo into a personalized portrait made just for you.",
  benefits: [
    { icon: "preview", label: "Preview before printing" },
    { icon: "revisions", label: "Unlimited revisions" },
    { icon: "shipping", label: "Free shipping across India" },
  ],
  cta: "Explore Our Portraits",
} as const;

export const PORTRAIT_SECTION = {
  title: "Find Your Perfect Portrait",
  text: "Choose a style that matches your story.",
};

export const VIDEO_SECTION = {
  title: "Real Pets. Real Memories.",
  text: "See how pet parents turn their favourite moments into something they can keep forever.",
  // Keys of the Admin → Media → Unboxing videos slots. Captions describe the videos
  // uploaded there, so change both together.
  clips: [
    { video: "IMG_3784 (1).MOV", caption: "Meet Rose" }, // Real reaction
    { video: "IMG_6005.MOV", caption: "Side by Side" }, // Unboxing and reveal
    { video: "IMG_4486.MOV", caption: "A Birthday Gift" }, // Pure joy
    { video: "IMG_6165.MOV", caption: "Unwrapping Roxy" }, // A gift that lasts
    { video: "IMG_6181.MOV", caption: "A Family Reveal" }, // The perfect memory
  ],
};

export const REVIEW_SECTION = {
  title: "Loved by Pet Parents",
  text: "Every portrait has a story. Here's what our customers have to say.",
};

export const FINAL_CTA = {
  headline: "Your Favourite Photo Deserves More Than a Camera Roll.",
  text: "Turn it into a personalized portrait you'll love seeing every day.",
  cta: "Create Your Portraits",
  fallbackImage: "/review-image/review-7.png",
};
