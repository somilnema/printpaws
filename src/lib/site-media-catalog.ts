import { getCloudinaryUrl } from "@/utils/cloudinary";
import { REVIEWS } from "@/lib/reviews";

export type MediaKind = "image" | "video";

export type MediaSlot = {
  id: string;
  group: string;
  label: string;
  hint: string;
  kind: MediaKind;
  /** The same string the shop passes to the media resolver today. */
  fallbackKey: string;
  /** Longest edge after upload. Videos are not resized. */
  maxEdge: number;
  /** No original file: the shop hides this spot until the admin uploads one. */
  optional?: boolean;
  /** Optional slots: what the shop shows until this one is uploaded (another slot id, or a file key). */
  inherits?: string;
  /** Heading inside the admin group, e.g. "Gallery" or "Cart". */
  section?: string;
};

export const IMAGE_UPLOAD_LIMIT = 15 * 1024 * 1024;
export const VIDEO_UPLOAD_LIMIT = 20 * 1024 * 1024;

/** Stock example photos the Photo Guide shows until example photos are uploaded. */
export const GUIDE_STOCK_PHOTOS = [
  "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=200&h=260",
  "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=200&h=260",
  "https://images.unsplash.com/photo-1531804055935-76f44d7c3621?auto=format&fit=crop&q=80&w=200&h=260",
  "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=200&h=260",
];

/** Order of the headings inside a configurator group in the admin. */
export const MEDIA_SECTIONS = [
  "Gallery",
  "Step 1 · Portrait",
  "Step 2 · Background tiles",
  "Step 3 · Photo guide",
  "Cart",
  "Below the form",
  "Reviews",
];

const S_GALLERY = MEDIA_SECTIONS[0];
const S_STEP1 = MEDIA_SECTIONS[1];
const S_TILES = MEDIA_SECTIONS[2];
const S_GUIDE = MEDIA_SECTIONS[3];
const S_CART = MEDIA_SECTIONS[4];
const S_BELOW = MEDIA_SECTIONS[5];
const S_REVIEWS = MEDIA_SECTIONS[6];

/** Where each gallery photo also shows up (the order form switches the gallery to it). */
const GALLERY_USES = [
  "Opening photo. Also shown for the frame colours and the Pearl and Black backgrounds.",
  "Second photo. Also shown when Almond is chosen.",
  "Third photo. Also shown when Serenity is chosen.",
  "Shown for framed sizes and the Celadon background.",
  "Shown for canvas sizes and the Tea Rosé background.",
  "Shown when Canvas is chosen.",
  "Later photo in the gallery.",
  "Later photo in the gallery.",
  "Later photo in the gallery.",
  "Last photo in the gallery.",
];

/** Original files of the "Trusted by" banner photos (the first is also the testimonial photo). */
const TRUSTED_FILES = ["review-avatar", "Review bar image 2.jpg.jpeg", "Review bat image 3.jpg.jpeg"];

/**
 * Photos every configurator product has for itself: gallery, preview pop-up, cart, the area under the
 * order form and the reviews. Each one shows today's shared photo until the admin uploads its own.
 */
function productPageSlots(
  prefix: string,
  group: string,
  subject: string,
  ownGiftWrap: boolean,
  /** false for products without portrait styles or backgrounds (Desk Portrait): no preview pop-up or cutout photos. */
  stylePhotos = true
): MediaSlot[] {
  const optional = { kind: "image" as const, fallbackKey: "", optional: true };
  const keep = (slot: MediaSlot) =>
    stylePhotos ||
    ![`${prefix}-gallery-cutout`, `${prefix}-style-infographic`, `${prefix}-preview-framed`, `${prefix}-preview-canvas`].includes(slot.id);
  return productPageSlotList(prefix, group, subject, ownGiftWrap, optional).filter(keep);
}

function productPageSlotList(
  prefix: string,
  group: string,
  subject: string,
  ownGiftWrap: boolean,
  optional: { kind: "image"; fallbackKey: string; optional: boolean }
): MediaSlot[] {
  return [
    ...GALLERY_USES.map((use, i): MediaSlot => ({
      ...optional,
      id: `${prefix}-gallery-${i + 1}`,
      group,
      section: S_GALLERY,
      label: `Gallery photo ${i + 1}`,
      hint: `${use} Show ${subject}. Until you upload one, the shared Product gallery photo ${i + 1} is shown.`,
      maxEdge: 2000,
      inherits: `gallery-${i + 1}`,
    })),
    {
      ...optional,
      id: `${prefix}-gallery-video`,
      group,
      section: S_GALLERY,
      label: "How the art is made (video)",
      hint: "Short video right after gallery photo 1. Until you upload one, the shared gallery video is shown, if there is one. Text & switches → Gallery can hide it.",
      kind: "video",
      maxEdge: 0,
      inherits: "gallery-video",
    },
    {
      ...optional,
      id: `${prefix}-gallery-cutout`,
      group,
      section: S_GALLERY,
      label: "Portrait on a Limited Edition background",
      hint: `Shown in the gallery on top of a Limited Edition background when one is chosen. Show ${subject}; a transparent PNG works best. Until you upload one, the shared photo is shown.`,
      maxEdge: 1600,
      inherits: "gallery-cutout",
    },
    {
      ...optional,
      id: `${prefix}-style-infographic`,
      group,
      section: S_STEP1,
      label: "Preview pop-up infographic",
      hint: "Opens from the Preview button on the style cards. Until you upload one, the shared infographic (Media → Order form) is shown; if there is none, the two photos below side by side.",
      maxEdge: 2400,
      inherits: "style-infographic",
    },
    {
      ...optional,
      id: `${prefix}-preview-framed`,
      group,
      section: S_STEP1,
      label: "Preview pop-up: framed photo",
      hint: "Square photo in the Preview pop-up, used only while no infographic is shown. Until you upload one, the original framed photo is shown.",
      maxEdge: 900,
      inherits: "/framestyle/black-frame.png",
    },
    {
      ...optional,
      id: `${prefix}-preview-canvas`,
      group,
      section: S_STEP1,
      label: "Preview pop-up: canvas photo",
      hint: "Square photo in the Preview pop-up, used only while no infographic is shown. Until you upload one, the original canvas photo is shown.",
      maxEdge: 900,
      inherits: "/framestyle/canvas-frame.png",
    },
    ...(
      [
        ["mug", "Add-on: mug", "extra-mug"],
        ["magnet", "Add-on: fridge magnet", "extra-magnet"],
        ["digital", "Add-on: digital download", "extra-digital"],
        ["desk", "Add-on: desk portrait", "extra-desk"],
      ] as const
    ).map(([id, label, shared]): MediaSlot => ({
      ...optional,
      id: `${prefix}-extra-${id}`,
      group,
      section: S_CART,
      label,
      hint: "Square photo in the cart's Additional Products. Until you upload one, the shared add-on photo (Media → Add-on products) is shown.",
      maxEdge: 900,
      inherits: shared,
    })),
    ...(ownGiftWrap
      ? [
          {
            ...optional,
            id: `${prefix}-gift-wrap`,
            group,
            section: S_CART,
            label: "Gift wrapping",
            hint: "Square photo of the wrapped gift, shown in the cart. Until you upload one, the Everyday gift photo is shown (or a gift icon).",
            maxEdge: 600,
            inherits: "everyday-gift-wrap",
          },
        ]
      : []),
    {
      ...optional,
      id: `${prefix}-testimonial`,
      group,
      section: S_BELOW,
      label: "Testimonial photo",
      hint: "Round photo on the testimonial card under the order form. Until you upload one, the shared photo (Media → Reviews → Vaidehi’s portrait) is shown.",
      maxEdge: 800,
      inherits: "review-avatar",
    },
    ...TRUSTED_FILES.map((shared, i): MediaSlot => ({
      ...optional,
      id: `${prefix}-trusted-${i + 1}`,
      group,
      section: S_BELOW,
      label: `“Trusted by” photo ${i + 1}`,
      hint: "Small round face photo in the “Trusted by” banner under the order form. Until you upload one, the original photo is shown.",
      maxEdge: 400,
      inherits: shared,
    })),
    ...REVIEWS.map((review, i): MediaSlot => ({
      ...optional,
      id: `${prefix}-review-${i + 1}`,
      group,
      section: S_REVIEWS,
      label: `Review ${i + 1} photo`,
      hint: `Photo on review card ${i + 1} (${review.name}’s by default). Until you upload one, the shared review photo is shown.`,
      maxEdge: 1400,
      inherits: review.image || "",
    })),
  ];
}

const PRODUCT_TILES: [string, string][] = [
  ["pearl", "Pearl"],
  ["almond", "Almond"],
  ["serenity", "Serenity"],
  ["celadon", "Celadon"],
  ["tea-rose", "Tea Rose"],
  ["black", "Black"],
  ["bg7", "Limited edition 1 (bg7)"],
  ["bg8", "Limited edition 2 (bg8)"],
  ["bg9", "Limited edition 3 (bg9)"],
];

/** Limited Edition tiles show their pattern file until a tile photo is uploaded. */
const TILE_FILES: Record<string, string> = { bg7: "/bg7.png", bg8: "/bg8.png", bg9: "/bg9.png" };

/** Desk Portrait Step 1 pet cards: [pets, card label, layout, original example photo]. */
const DESK_PET_EXAMPLES: [number, string, string, string][] = [
  [1, "1 Pet", "vertical", "/no-of-pets/one-pet.png"],
  [2, "2 Pets", "horizontal", "/no-of-pets/two-pet.png"],
  [3, "3 Pets", "horizontal", "/no-of-pets/three-pet.png"],
];

/** Multi-Pet and You & Your Pet photos: the Everyday layout, showing that product's own subjects. */
function productConfiguratorSlots(prefix: string, group: string, subject: string): MediaSlot[] {
  return [
    { id: `${prefix}-style-framed`, group, section: S_STEP1, label: "Framed Portrait card", hint: `Step 1 style card photo (tall 2:3). Show ${subject} in a frame, with the frame edges visible. Until you upload one, the Everyday photo is shown.`, kind: "image", fallbackKey: "", maxEdge: 1400, optional: true, inherits: "everyday-style-framed" },
    { id: `${prefix}-style-canvas`, group, section: S_STEP1, label: "Canvas Portrait card", hint: `Step 1 style card photo (tall 2:3). Show ${subject} on a stretched canvas, with the wrapped edge visible. Until you upload one, the Everyday photo is shown.`, kind: "image", fallbackKey: "", maxEdge: 1400, optional: true, inherits: "everyday-style-canvas" },
    ...PRODUCT_TILES.map(([slug, label]): MediaSlot => ({
      id: `${prefix}-bg-${slug}`,
      group,
      section: S_TILES,
      label: `Background tile: ${label}`,
      hint: `Square photo of ${subject} on this background, shown in Step 2. Keep the same subjects, pose and crop on every tile. Until you upload one, the tile shows the plain background.`,
      kind: "image",
      fallbackKey: "",
      maxEdge: 600,
      optional: true,
      inherits: TILE_FILES[slug],
    })),
    ...[1, 2, 3, 4].map((n): MediaSlot => ({
      id: `${prefix}-guide-${n}`,
      group,
      section: S_GUIDE,
      label: `Photo guide example ${n}`,
      hint: "Tall 3:4 example photo in the Photo Guide pop-up. Until you upload one, the Everyday example is shown.",
      kind: "image",
      fallbackKey: "",
      maxEdge: 600,
      optional: true,
      inherits: `everyday-guide-${n}`,
    })),
  ];
}

export const MEDIA_SLOTS: MediaSlot[] = [
  { id: "gallery-1", group: "Product gallery", label: "Photo 1", hint: "Opening photo. Also shown for black, white, and wood frames, and the Pearl background. Configurator product pages show their own Gallery photo 1 instead once it is uploaded.", kind: "image", fallbackKey: "Main Image.png", maxEdge: 2000 },
  { id: "gallery-video", group: "Product gallery", label: "How the art is made", hint: "Short video shown right after Photo 1. Hidden on the shop until you upload one.", kind: "video", fallbackKey: "", maxEdge: 0, optional: true },
  { id: "gallery-2", group: "Product gallery", label: "Photo 2", hint: "Second gallery photo, the Almond background, and Radha’s review.", kind: "image", fallbackKey: "2nd Image.png", maxEdge: 2000 },
  { id: "gallery-3", group: "Product gallery", label: "Photo 3", hint: "Third gallery photo and the Serenity background.", kind: "image", fallbackKey: "3rd Image.png", maxEdge: 2000 },
  { id: "gallery-4", group: "Product gallery", label: "Photo 4", hint: "Shown for framed sizes and the Celadon background.", kind: "image", fallbackKey: "4th Image (2).png", maxEdge: 2000 },
  { id: "gallery-5", group: "Product gallery", label: "Photo 5", hint: "Shown for canvas sizes and the Tea Rosé background.", kind: "image", fallbackKey: "5th Image.png", maxEdge: 2000 },
  { id: "gallery-6", group: "Product gallery", label: "Photo 6", hint: "Shown when Canvas is selected.", kind: "image", fallbackKey: "6th Image.png", maxEdge: 2000 },
  { id: "gallery-7", group: "Product gallery", label: "Photo 7", hint: "Later photo in the product gallery.", kind: "image", fallbackKey: "7th Image.png", maxEdge: 2000 },
  { id: "gallery-8", group: "Product gallery", label: "Photo 8", hint: "Later photo in the product gallery.", kind: "image", fallbackKey: "8th Image.png", maxEdge: 2000 },
  { id: "gallery-9", group: "Product gallery", label: "Photo 9", hint: "Later photo in the product gallery.", kind: "image", fallbackKey: "9th Image.png", maxEdge: 2000 },
  { id: "gallery-10", group: "Product gallery", label: "Photo 10", hint: "Last photo in the product gallery.", kind: "image", fallbackKey: "10th Image.png", maxEdge: 2000 },
  { id: "gallery-bg-1", group: "Product gallery", label: "Custom background 1", hint: "First Limited Edition background (bg7): behind the pet in the gallery, and the Step 2 tile pattern until a tile photo is uploaded.", kind: "image", fallbackKey: "/bg7.png", maxEdge: 2000 },
  { id: "gallery-bg-2", group: "Product gallery", label: "Custom background 2", hint: "Second Limited Edition background (bg8): gallery and Step 2 tile pattern, as above.", kind: "image", fallbackKey: "/bg8.png", maxEdge: 2000 },
  { id: "gallery-bg-3", group: "Product gallery", label: "Custom background 3", hint: "Third Limited Edition background (bg9): gallery and Step 2 tile pattern, as above.", kind: "image", fallbackKey: "/bg9.png", maxEdge: 2000 },
  { id: "gallery-cutout", group: "Product gallery", label: "Pet on custom background", hint: "The pet placed on top of a custom background. Configurator product pages can use their own (Configurator → Photos → Gallery).", kind: "image", fallbackKey: "/dog_portrait_closeup_1773940826280.png", maxEdge: 1600 },

  { id: "style-infographic", group: "Order form", label: "Framed vs canvas infographic", hint: "Opens from the Preview button next to “Choose Your Portrait Style”. Until you upload one, the pop-up shows the two style photos side by side. Also used on the configurator product pages until they get their own (Configurator → Photos).", kind: "image", fallbackKey: "", maxEdge: 2400, optional: true },
  { id: "pets-human", group: "Order form", label: "Human + Pet", hint: "Small photo on the Human + Pet option. Until you upload one, it shows a person and paw icon.", kind: "image", fallbackKey: "", maxEdge: 600, optional: true },

  { id: "everyday-style-framed", group: "Everyday configurator", section: S_STEP1, label: "Framed Portrait card", hint: "Step 1 style card photo (tall 2:3). Show a pet portrait in a frame.", kind: "image", fallbackKey: "/framestyle/everyday-style-framed.jpg", maxEdge: 1400 },
  { id: "everyday-style-canvas", group: "Everyday configurator", section: S_STEP1, label: "Canvas Portrait card", hint: "Step 1 style card photo (tall 2:3). Show a pet portrait on canvas.", kind: "image", fallbackKey: "/framestyle/everyday-style-canvas.jpg", maxEdge: 1400 },
  { id: "everyday-bg-pearl", group: "Everyday configurator", section: S_TILES, label: "Background tile: Pearl", hint: "Square photo of a pet on this background, shown in Step 2. Until you upload one, the tile shows the plain background.", kind: "image", fallbackKey: "", maxEdge: 600, optional: true },
  { id: "everyday-bg-almond", group: "Everyday configurator", section: S_TILES, label: "Background tile: Almond", hint: "Square photo of a pet on this background, shown in Step 2. Until you upload one, the tile shows the plain background.", kind: "image", fallbackKey: "", maxEdge: 600, optional: true },
  { id: "everyday-bg-serenity", group: "Everyday configurator", section: S_TILES, label: "Background tile: Serenity", hint: "Square photo of a pet on this background, shown in Step 2. Until you upload one, the tile shows the plain background.", kind: "image", fallbackKey: "", maxEdge: 600, optional: true },
  { id: "everyday-bg-celadon", group: "Everyday configurator", section: S_TILES, label: "Background tile: Celadon", hint: "Square photo of a pet on this background, shown in Step 2. Until you upload one, the tile shows the plain background.", kind: "image", fallbackKey: "", maxEdge: 600, optional: true },
  { id: "everyday-bg-tea-rose", group: "Everyday configurator", section: S_TILES, label: "Background tile: Tea Rosé", hint: "Square photo of a pet on this background, shown in Step 2. Until you upload one, the tile shows the plain background.", kind: "image", fallbackKey: "", maxEdge: 600, optional: true },
  { id: "everyday-bg-black", group: "Everyday configurator", section: S_TILES, label: "Background tile: Black", hint: "Square photo of a pet on this background, shown in Step 2. Until you upload one, the tile shows the plain background.", kind: "image", fallbackKey: "", maxEdge: 600, optional: true },
  { id: "everyday-bg-bg7", group: "Everyday configurator", section: S_TILES, inherits: "/bg7.png", label: "Background tile: Limited edition 1 (bg7)", hint: "Square photo of a pet on this background, shown in Step 2. Until you upload one, the tile shows the plain background.", kind: "image", fallbackKey: "", maxEdge: 600, optional: true },
  { id: "everyday-bg-bg8", group: "Everyday configurator", section: S_TILES, inherits: "/bg8.png", label: "Background tile: Limited edition 2 (bg8)", hint: "Square photo of a pet on this background, shown in Step 2. Until you upload one, the tile shows the plain background.", kind: "image", fallbackKey: "", maxEdge: 600, optional: true },
  { id: "everyday-bg-bg9", group: "Everyday configurator", section: S_TILES, inherits: "/bg9.png", label: "Background tile: Limited edition 3 (bg9)", hint: "Square photo of a pet on this background, shown in Step 2. Until you upload one, the tile shows the plain background.", kind: "image", fallbackKey: "", maxEdge: 600, optional: true },
  { id: "everyday-guide-1", group: "Everyday configurator", section: S_GUIDE, inherits: GUIDE_STOCK_PHOTOS[0], label: "Photo guide example 1", hint: "Tall 3:4 example photo in the Photo Guide pop-up. Until you upload one, a stock photo is shown.", kind: "image", fallbackKey: "", maxEdge: 600, optional: true },
  { id: "everyday-guide-2", group: "Everyday configurator", section: S_GUIDE, inherits: GUIDE_STOCK_PHOTOS[1], label: "Photo guide example 2", hint: "Tall 3:4 example photo in the Photo Guide pop-up. Until you upload one, a stock photo is shown.", kind: "image", fallbackKey: "", maxEdge: 600, optional: true },
  { id: "everyday-guide-3", group: "Everyday configurator", section: S_GUIDE, inherits: GUIDE_STOCK_PHOTOS[2], label: "Photo guide example 3", hint: "Tall 3:4 example photo in the Photo Guide pop-up. Until you upload one, a stock photo is shown.", kind: "image", fallbackKey: "", maxEdge: 600, optional: true },
  { id: "everyday-guide-4", group: "Everyday configurator", section: S_GUIDE, inherits: GUIDE_STOCK_PHOTOS[3], label: "Photo guide example 4", hint: "Tall 3:4 example photo in the Photo Guide pop-up. Until you upload one, a stock photo is shown.", kind: "image", fallbackKey: "", maxEdge: 600, optional: true },
  { id: "everyday-gift-wrap", group: "Everyday configurator", section: S_CART, label: "Gift wrapping", hint: "Square photo of the wrapped gift, shown in the cart. Until you upload one, the cart shows a gift icon.", kind: "image", fallbackKey: "", maxEdge: 600, optional: true },

  ...productPageSlots("everyday", "Everyday configurator", "one pet and its portrait", false),

  ...productConfiguratorSlots("multi-pet", "Multi-Pet configurator", "the pets together"),
  ...productPageSlots("multi-pet", "Multi-Pet configurator", "several pets together in one portrait", true),
  ...productConfiguratorSlots("you-pet", "You & Your Pet configurator", "a person with their pet"),
  { id: "you-pet-composition-solo", group: "You & Your Pet configurator", section: S_STEP1, label: "Me & My Pet card", hint: "Small photo on the Me & My Pet choice in Step 1: one person with one pet. Until you upload one, the card shows icons.", kind: "image", fallbackKey: "", maxEdge: 600, optional: true },
  { id: "you-pet-composition-family", group: "You & Your Pet configurator", section: S_STEP1, label: "My Family & Our Pet card", hint: "Small photo on the My Family & Our Pet choice in Step 1: a family with their pet. Until you upload one, the card shows icons.", kind: "image", fallbackKey: "", maxEdge: 600, optional: true },
  ...productPageSlots("you-pet", "You & Your Pet configurator", "a person with their pet", true),

  // Desk Portrait: no style cards or background tiles (one fixed size, colour swatches only).
  ...DESK_PET_EXAMPLES.map(([n, label, layout, file]): MediaSlot => ({
    id: `mini-desk-pets-${n}`,
    group: "Desk Portrait configurator",
    section: S_STEP1,
    label: `${label} card`,
    hint: `Example photo on the ${label} choice in Step 1 (${layout} layout). Until you upload one, the original example photo is shown.`,
    kind: "image",
    fallbackKey: "",
    maxEdge: 900,
    optional: true,
    inherits: file,
  })),
  ...[1, 2, 3, 4].map((n): MediaSlot => ({
    id: `mini-desk-guide-${n}`,
    group: "Desk Portrait configurator",
    section: S_GUIDE,
    label: `Photo guide example ${n}`,
    hint: "Tall 3:4 example photo in the Photo Guide pop-up. Until you upload one, the Everyday example is shown.",
    kind: "image",
    fallbackKey: "",
    maxEdge: 600,
    optional: true,
    inherits: `everyday-guide-${n}`,
  })),
  ...productPageSlots("mini-desk", "Desk Portrait configurator", "a pet portrait on its wooden desk stand", true, false),

  // Signature Gift Bundle: the Everyday layout (style cards, tiles, guide) plus one photo per bundle tier.
  ...productConfiguratorSlots("gift-bundle", "Gift Bundle configurator", "a pet portrait gift"),
  { id: "gift-bundle-tier-essential", group: "Gift Bundle configurator", section: S_STEP1, label: "Essential Gift Bundle card", hint: "Photo on the Essential bundle card in Step 1: the portrait, mug, digital portrait and standard packaging together. Until you upload one, the card shows a gift icon.", kind: "image", fallbackKey: "", maxEdge: 1200, optional: true },
  { id: "gift-bundle-tier-signature", group: "Gift Bundle configurator", section: S_STEP1, label: "Signature Gift Bundle card", hint: "Photo on the Signature bundle card in Step 1: everything in Essential plus the fridge magnet and premium packaging. Until you upload one, the card shows a gift icon.", kind: "image", fallbackKey: "", maxEdge: 1200, optional: true },
  ...productPageSlots("gift-bundle", "Gift Bundle configurator", "the pet portrait gift bundle", true),

  { id: "unboxing-1", group: "Unboxing videos", label: "Real reaction", hint: "First clip in the unboxing row.", kind: "video", fallbackKey: "IMG_3784 (1).MOV", maxEdge: 0 },
  { id: "unboxing-2", group: "Unboxing videos", label: "Unboxing and reveal", hint: "Second clip in the unboxing row.", kind: "video", fallbackKey: "IMG_6005.MOV", maxEdge: 0 },
  { id: "unboxing-3", group: "Unboxing videos", label: "Capturing every detail", hint: "Third clip in the unboxing row.", kind: "video", fallbackKey: "IMG_6007.MOV", maxEdge: 0 },
  { id: "unboxing-4", group: "Unboxing videos", label: "A gift that lasts", hint: "Fourth clip in the unboxing row.", kind: "video", fallbackKey: "IMG_6165.MOV", maxEdge: 0 },
  { id: "unboxing-5", group: "Unboxing videos", label: "The perfect memory", hint: "Fifth clip in the unboxing row.", kind: "video", fallbackKey: "IMG_6181.MOV", maxEdge: 0 },
  { id: "unboxing-6", group: "Unboxing videos", label: "Watch them react", hint: "Sixth clip in the unboxing row.", kind: "video", fallbackKey: "IMG_6239.MOV", maxEdge: 0 },
  { id: "unboxing-7", group: "Unboxing videos", label: "Pure joy", hint: "Seventh clip in the unboxing row.", kind: "video", fallbackKey: "IMG_4486.MOV", maxEdge: 0 },
  { id: "unboxing-8", group: "Unboxing videos", label: "Hand-painted details", hint: "Eighth clip in the unboxing row.", kind: "video", fallbackKey: "IMG_5576.MOV", maxEdge: 0 },

  { id: "feature-gift", group: "Feature stories", label: "Not just a gift", hint: "Photo beside “Not Just a Gift. It’s Them.”", kind: "image", fallbackKey: "/Not just a image its them.png", maxEdge: 1800 },
  { id: "feature-draw", group: "Feature stories", label: "We get them right", hint: "Video beside “We Don’t Just Draw Them.”", kind: "video", fallbackKey: "we-dont-just-draw-them.mp4", maxEdge: 0 },
  { id: "feature-stay", group: "Feature stories", label: "Made to stay", hint: "Photo beside “Made to Stay With You”.", kind: "image", fallbackKey: "/Made to stay with yiu final.webp", maxEdge: 1800 },

  { id: "how-it-works", group: "How it works", label: "Process photo", hint: "The photo on the left of How it works.", kind: "image", fallbackKey: "how-it-works-new.png", maxEdge: 1600 },

  { id: "portrait-levi", group: "Portrait carousel", label: "Levi", hint: "First portrait in the scrolling row.", kind: "image", fallbackKey: "/slideshowimage/Slide image -6.png", maxEdge: 1400 },
  { id: "portrait-cooper", group: "Portrait carousel", label: "Cooper", hint: "Scrolling portrait.", kind: "image", fallbackKey: "/slideshowimage/Silde image -1.png", maxEdge: 1400 },
  { id: "portrait-stella", group: "Portrait carousel", label: "Stella", hint: "Scrolling portrait.", kind: "image", fallbackKey: "/slideshowimage/Slide image -2.png", maxEdge: 1400 },
  { id: "portrait-charlie", group: "Portrait carousel", label: "Charlie", hint: "Scrolling portrait.", kind: "image", fallbackKey: "/slideshowimage/Slide image - 3.png", maxEdge: 1400 },
  { id: "portrait-loki", group: "Portrait carousel", label: "Loki", hint: "Scrolling portrait.", kind: "image", fallbackKey: "/slideshowimage/Slide image - 4.png", maxEdge: 1400 },
  { id: "portrait-daisy", group: "Portrait carousel", label: "Daisy", hint: "Scrolling portrait.", kind: "image", fallbackKey: "/slideshowimage/Slide image - 5.png", maxEdge: 1400 },
  { id: "portrait-rocky", group: "Portrait carousel", label: "Rocky", hint: "Scrolling portrait.", kind: "image", fallbackKey: "/slideshowimage/Slide image - 7.png", maxEdge: 1400 },
  { id: "portrait-bailey", group: "Portrait carousel", label: "Bailey", hint: "Scrolling portrait.", kind: "image", fallbackKey: "/slideshowimage/Slide imahe - 8.png", maxEdge: 1400 },

  { id: "social-1", group: "Social proof", label: "Real reaction", hint: "Left video in the shelter section.", kind: "video", fallbackKey: "socialproof/Social proof video -1.mp4", maxEdge: 0 },
  { id: "social-2", group: "Social proof", label: "Pure joy", hint: "Right video in the shelter section.", kind: "video", fallbackKey: "socialproof/Social proof video - 2.mp4", maxEdge: 0 },

  { id: "review-vaidehi", group: "Reviews", label: "Vaidehi’s review", hint: "Review photo.", kind: "image", fallbackKey: "/new-review/IMG-20260628-WA0015.jpg.jpeg", maxEdge: 1400 },
  { id: "review-ananya", group: "Reviews", label: "Ananya’s review", hint: "Review photo.", kind: "image", fallbackKey: "/new-review/IMG-20260706-WA0006.jpg.jpeg", maxEdge: 1400 },
  { id: "review-ishaan", group: "Reviews", label: "Ishaan’s review", hint: "Review photo.", kind: "image", fallbackKey: "/new-review/IMG-20260706-WA0019.jpg.jpeg", maxEdge: 1400 },
  { id: "review-zoya", group: "Reviews", label: "Zoya’s review", hint: "Review photo.", kind: "image", fallbackKey: "/new-review/IMG-20260706-WA0020.jpg.jpeg", maxEdge: 1400 },
  { id: "review-aarav", group: "Reviews", label: "Aarav’s review", hint: "Review photo.", kind: "image", fallbackKey: "/new-review/IMG-20260710-WA0004.jpg.jpeg", maxEdge: 1400 },
  { id: "review-rhea", group: "Reviews", label: "Rhea’s review", hint: "Review photo.", kind: "image", fallbackKey: "/new-review/IMG-20260712-WA0010.jpg.jpeg", maxEdge: 1400 },
  { id: "review-reyansh", group: "Reviews", label: "Reyansh’s review", hint: "Review photo.", kind: "image", fallbackKey: "/new-review/IMG-20260713-WA0001.jpg.jpeg", maxEdge: 1400 },
  { id: "review-kiara", group: "Reviews", label: "Kiara’s review", hint: "Review photo.", kind: "image", fallbackKey: "/new-review/IMG-20260714-WA0007.jpg.jpeg", maxEdge: 1400 },
  { id: "review-vihaan", group: "Reviews", label: "Vihaan’s review", hint: "Review photo.", kind: "image", fallbackKey: "/new-review/WhatsApp Image 2026-07-18 at 12.44.35 AM.jpeg", maxEdge: 1400 },
  { id: "review-nandini", group: "Reviews", label: "Nandini’s photo", hint: "Small review photo on the order form, on phones.", kind: "image", fallbackKey: "Nandini review image.jpg.jpeg", maxEdge: 800 },
  { id: "review-avatar", group: "Reviews", label: "Vaidehi’s portrait", hint: "Round photo on the testimonial card in the order form, and the first “Trusted by” face. Configurator product pages can use their own (Configurator → Photos).", kind: "image", fallbackKey: "review bar image 1.jpg.jpeg", maxEdge: 800 },

  { id: "extra-mug", group: "Add-on products", label: "Mug", hint: "Mug photo in the order form. Also used in the configurator carts until they get their own.", kind: "image", fallbackKey: "/extras/mug.jpg", maxEdge: 900 },
  { id: "extra-magnet", group: "Add-on products", label: "Magnet", hint: "Magnet photo in the order form. Also used in the configurator carts until they get their own.", kind: "image", fallbackKey: "/extras/magnet.jpg", maxEdge: 900 },
  { id: "extra-digital", group: "Add-on products", label: "Digital download", hint: "Digital download photo in the order form. Also used in the configurator carts until they get their own.", kind: "image", fallbackKey: "/extras/digital-download.jpg", maxEdge: 900 },
  { id: "extra-desk", group: "Add-on products", label: "Desk portrait", hint: "Desk portrait photo in the cart. Until you upload one, the cart uses the product detail photo. Configurator carts can use their own.", kind: "image", fallbackKey: "", maxEdge: 900, optional: true, inherits: "/feature-detail.png" },

  { id: "landing-hero", group: "Landing page", label: "Hero photo", hint: "Horizontal 16:9 photo of a pet beside its portrait. Keep the left side calm: the headline sits there. Until you upload one, the hero shows a portrait on the right.", kind: "image", fallbackKey: "", maxEdge: 2400, optional: true },
  { id: "landing-hero-video", group: "Landing page", label: "Hero video", hint: "Horizontal 16:9 brand video, plays muted on a loop. Leave the left side calm for the headline. The hero photo shows while it loads.", kind: "video", fallbackKey: "", maxEdge: 0, optional: true },
  { id: "landing-everyday", group: "Landing page", label: "Everyday Pet Portrait card", hint: "Vertical 3:4 photo: one pet and the finished portrait.", kind: "image", fallbackKey: "", maxEdge: 1400, optional: true },
  { id: "landing-multi-pet", group: "Landing page", label: "Multi-Pet Portrait card", hint: "Vertical 3:4 photo: several pets together in one portrait.", kind: "image", fallbackKey: "", maxEdge: 1400, optional: true },
  { id: "landing-you-and-pet", group: "Landing page", label: "You & Your Pet card", hint: "Vertical 3:4 photo: a person with their pet and the artwork.", kind: "image", fallbackKey: "", maxEdge: 1400, optional: true },
  { id: "landing-memorial", group: "Landing page", label: "Memorial Portrait card", hint: "Vertical 3:4 photo. Gentle, respectful memorial imagery.", kind: "image", fallbackKey: "", maxEdge: 1400, optional: true },
  { id: "landing-gift-bundle", group: "Landing page", label: "Signature Gift Bundle card", hint: "Vertical 3:4 photo of the actual bundle and what is inside.", kind: "image", fallbackKey: "", maxEdge: 1400, optional: true },
  { id: "landing-mini-desk", group: "Landing page", label: "Mini Desk Portrait card", hint: "Vertical 3:4 photo showing the small portrait on a desk or shelf.", kind: "image", fallbackKey: "", maxEdge: 1400, optional: true },
  { id: "landing-final", group: "Landing page", label: "Closing photo", hint: "Warm photo under “Your Favourite Photo Deserves More Than a Camera Roll.”", kind: "image", fallbackKey: "", maxEdge: 1800, optional: true },
];

const SLOT_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function buildIndex() {
  const byId = new Map<string, MediaSlot>();
  const byKey = new Map<string, MediaSlot>();

  for (const slot of MEDIA_SLOTS) {
    if (!SLOT_ID.test(slot.id)) throw new Error(`Invalid media slot id ${slot.id}`);
    if (byId.has(slot.id)) throw new Error(`Duplicate media slot ${slot.id}`);
    byId.set(slot.id, slot);
    if (slot.optional) continue;

    const resolved = getCloudinaryUrl(slot.fallbackKey);
    for (const key of [slot.fallbackKey, resolved]) {
      const existing = byKey.get(key);
      if (existing && existing.id !== slot.id) {
        throw new Error(`Media key "${key}" belongs to both ${existing.id} and ${slot.id}`);
      }
      byKey.set(key, slot);
    }
  }

  return { byId, byKey };
}

const index = buildIndex();

/** Backgrounds added in the configurator have no catalog entry, so their tile slots are recognised by name. */
const BACKGROUND_TILE_SLOT = /^(everyday|multi-pet|you-pet|gift-bundle)-bg-[a-z0-9]+(?:-[a-z0-9]+)*$/;

const TILE_GROUPS: Record<string, string> = {
  everyday: "Everyday configurator",
  "multi-pet": "Multi-Pet configurator",
  "you-pet": "You & Your Pet configurator",
  "gift-bundle": "Gift Bundle configurator",
};

export function mediaSlot(id: string) {
  const known = index.byId.get(id);
  if (known) return known;
  const match = BACKGROUND_TILE_SLOT.exec(id);
  if (!match) return null;
  const slot: MediaSlot = {
    id,
    group: TILE_GROUPS[match[1]] || "Everyday configurator",
    label: "Background tile",
    hint: "Square photo of a pet on this background.",
    kind: "image",
    fallbackKey: "",
    maxEdge: 600,
    optional: true,
  };
  return slot;
}

export function mediaSlotForKey(key: string) {
  return index.byKey.get(key) || index.byKey.get(getCloudinaryUrl(key)) || null;
}

export function fallbackUrl(slot: MediaSlot) {
  return slot.optional ? "" : getCloudinaryUrl(slot.fallbackKey);
}

const UPLOAD_KEY = "slot:";

/** Key that makes the shop resolver return a slot's admin upload ("" when there is none). */
export function uploadedKey(slotId: string) {
  return `${UPLOAD_KEY}${slotId}`;
}

/** Shop URL for a media key. Overrides win; everything else stays on the original file. */
export function resolveMediaUrl(key: string, overrides: Record<string, string>) {
  if (key.startsWith(UPLOAD_KEY)) return overrides[key.slice(UPLOAD_KEY.length)] || "";
  const slot = mediaSlotForKey(key);
  if (!slot) return getCloudinaryUrl(key);
  return overrides[slot.id] || getCloudinaryUrl(key);
}

/**
 * What the shop shows for a slot right now: its own photo, else what it inherits, followed down the chain.
 * `current` gives a slot's live URL (its upload, or its original file); "" when that slot shows nothing.
 */
export function shopMediaUrl(slotId: string, current: (id: string) => string): { url: string; from: string } {
  let id = slotId;
  for (let depth = 0; depth < 6; depth += 1) {
    const url = current(id);
    if (url) return { url, from: id };
    const next = mediaSlot(id)?.inherits;
    if (!next) break;
    if (index.byId.has(next)) {
      id = next;
      continue;
    }
    // A file key: the slot that owns it (so its replacement counts), else the file itself.
    const owner = mediaSlotForKey(next);
    if (owner) return { url: current(owner.id) || getCloudinaryUrl(next), from: owner.id };
    return { url: getCloudinaryUrl(next), from: "" };
  }
  return { url: "", from: "" };
}

/** Headings of a group's slots in admin order (empty when the group has none). */
export function mediaSections(group: string) {
  const used = new Set(MEDIA_SLOTS.filter((slot) => slot.group === group && slot.section).map((slot) => slot.section!));
  return MEDIA_SECTIONS.filter((section) => used.has(section));
}

export function mediaGroups() {
  const groups: string[] = [];
  for (const slot of MEDIA_SLOTS) {
    if (!groups.includes(slot.group)) groups.push(slot.group);
  }
  return groups;
}
