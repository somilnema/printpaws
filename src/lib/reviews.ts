// Customer reviews shown under the product pages and on the landing page.
// Plain data (no React), so server code (configurator defaults) can read it too.

export interface ReviewItem {
  name: string;
  initial: string;
  verified: boolean;
  date: string;
  rating: number;
  text: string;
  image?: string;
  hasMultiplePhotos?: boolean;
  itemType?: string;
  productBox?: {
    image: string;
    text: string;
  };
}

export const REVIEWS: ReviewItem[] = [
  {
    name: "Radha",
    initial: "R",
    verified: true,
    date: "12/20/2024",
    rating: 5,
    text: "I was absolutely blown away by the quality. The attention to detail is incredible, and it truly captures the spirit of my pet. I couldn't be happier with this masterpiece!",
    image: "/new-images/2nd Image.png",
    productBox: {
      image: "/review-image/review-box-icon.png",
      text: "One Pet Portrait - Premium Canvas"
    }
  },
  {
    name: "Vaidehi",
    initial: "K",
    verified: true,
    date: "12/13/2024",
    rating: 5,
    text: "I didn’t expect to feel this much. It’s not just a portrait - it genuinely feels like him. I pause every time I walk past it.",
    image: "/new-review/IMG-20260628-WA0015.jpg.jpeg",
    hasMultiplePhotos: true,
  },
  {
    name: "Ananya",
    initial: "A",
    verified: true,
    date: "10/19/2024",
    rating: 5,
    text: "The moment I saw it, I smiled… and then I teared up. You’ve captured something I can’t even explain.",
    image: "/new-review/IMG-20260706-WA0006.jpg.jpeg",
    productBox: {
      image: "/review-image/review-box-icon.png",
      text: "One Pet Portrait - Black Frame"
    }
  },
  {
    name: "Ishaan",
    initial: "I",
    verified: true,
    date: "10/17/2024",
    rating: 5,
    text: "It’s crazy how accurate it is. Not just the face - the feeling. It’s like she’s still right here.",
    image: "/new-review/IMG-20260706-WA0019.jpg.jpeg",
    itemType: "Pearl / 50x70 cm / 20x28\"",
    productBox: {
      image: "/review-image/review-box-icon.png",
      text: "One Pet Portrait - Premium Wood"
    }
  },
  {
    name: "Zoya",
    initial: "Z",
    verified: true,
    date: "9/24/2024",
    rating: 5,
    text: "I gifted this to my parents and they couldn’t stop looking at it. It’s one of those things that just hits you.",
    image: "/new-review/IMG-20260706-WA0020.jpg.jpeg",
  },
  {
    name: "Aarav",
    initial: "A",
    verified: true,
    date: "11/02/2024",
    rating: 5,
    text: "I’ve taken hundreds of photos of my dog, but this… this is the one that actually feels like him.",
    image: "/new-review/IMG-20260710-WA0004.jpg.jpeg",
    itemType: "Almond / 30x40 cm / 12x16\"",
    productBox: {
      image: "/review-image/review-box-icon.png",
      text: "Two Pet Portraits - Black Frame"
    }
  },
  {
    name: "Rhea",
    initial: "R",
    verified: true,
    date: "10/29/2024",
    rating: 5,
    text: "The eyes, the expression, everything - it’s so real it almost feels alive. I wasn’t expecting that.",
    image: "/new-review/IMG-20260712-WA0010.jpg.jpeg",
    productBox: {
      image: "/review-image/review-box-icon.png",
      text: "One Pet Portrait - Premium Wood"
    }
  },
  {
    name: "Reyansh",
    initial: "R",
    verified: true,
    date: "10/05/2024",
    rating: 5,
    text: "I thought it would be nice. I didn’t think it would mean this much. It’s now my favorite thing in the house.",
    image: "/new-review/IMG-20260713-WA0001.jpg.jpeg",
    productBox: {
      image: "/review-image/review-box-icon.png",
      text: "One Pet Portrait - Pearl Frame"
    }
  },
  {
    name: "Kiara",
    initial: "K",
    verified: true,
    date: "11/20/2024",
    rating: 5,
    text: "It’s the kind of thing you don’t just hang on a wall - you feel something every time you look at it.",
    image: "/new-review/IMG-20260714-WA0007.jpg.jpeg",
  },
  {
    name: "Vihaan",
    initial: "V",
    verified: true,
    date: "11/15/2024",
    rating: 5,
    text: "My dog passed away last year… and this brought back a part of him I thought I’d lost. I can’t thank you enough.",
    image: "/new-review/WhatsApp Image 2026-07-18 at 12.44.35 AM.jpeg",
  }
];

/** Rating line above the reviews grid. */
export const REVIEWS_SUMMARY = "4.5 / 145 Reviews";
