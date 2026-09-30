import { getCloudinaryUrl } from "@/utils/cloudinary";

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
};

export const IMAGE_UPLOAD_LIMIT = 15 * 1024 * 1024;
export const VIDEO_UPLOAD_LIMIT = 20 * 1024 * 1024;

export const MEDIA_SLOTS: MediaSlot[] = [
  { id: "gallery-1", group: "Product gallery", label: "Photo 1", hint: "Opening photo. Also shown for black, white, and wood frames, and the Pearl background.", kind: "image", fallbackKey: "Main Image.png", maxEdge: 2000 },
  { id: "gallery-2", group: "Product gallery", label: "Photo 2", hint: "Second gallery photo, the Almond background, and Radha’s review.", kind: "image", fallbackKey: "2nd Image.png", maxEdge: 2000 },
  { id: "gallery-3", group: "Product gallery", label: "Photo 3", hint: "Third gallery photo and the Serenity background.", kind: "image", fallbackKey: "3rd Image.png", maxEdge: 2000 },
  { id: "gallery-4", group: "Product gallery", label: "Photo 4", hint: "Shown for framed sizes and the Celadon background.", kind: "image", fallbackKey: "4th Image (2).png", maxEdge: 2000 },
  { id: "gallery-5", group: "Product gallery", label: "Photo 5", hint: "Shown for canvas sizes and the Tea Rosé background.", kind: "image", fallbackKey: "5th Image.png", maxEdge: 2000 },
  { id: "gallery-6", group: "Product gallery", label: "Photo 6", hint: "Shown when Canvas is selected.", kind: "image", fallbackKey: "6th Image.png", maxEdge: 2000 },
  { id: "gallery-7", group: "Product gallery", label: "Photo 7", hint: "Later photo in the product gallery.", kind: "image", fallbackKey: "7th Image.png", maxEdge: 2000 },
  { id: "gallery-8", group: "Product gallery", label: "Photo 8", hint: "Later photo in the product gallery.", kind: "image", fallbackKey: "8th Image.png", maxEdge: 2000 },
  { id: "gallery-9", group: "Product gallery", label: "Photo 9", hint: "Later photo in the product gallery.", kind: "image", fallbackKey: "9th Image.png", maxEdge: 2000 },
  { id: "gallery-10", group: "Product gallery", label: "Photo 10", hint: "Last photo in the product gallery.", kind: "image", fallbackKey: "10th Image.png", maxEdge: 2000 },
  { id: "gallery-bg-1", group: "Product gallery", label: "Custom background 1", hint: "First background behind the pet when a custom background is selected.", kind: "image", fallbackKey: "/bg7.png", maxEdge: 2000 },
  { id: "gallery-bg-2", group: "Product gallery", label: "Custom background 2", hint: "Second custom background.", kind: "image", fallbackKey: "/bg8.png", maxEdge: 2000 },
  { id: "gallery-bg-3", group: "Product gallery", label: "Custom background 3", hint: "Third custom background.", kind: "image", fallbackKey: "/bg9.png", maxEdge: 2000 },
  { id: "gallery-cutout", group: "Product gallery", label: "Pet on custom background", hint: "The pet placed on top of a custom background.", kind: "image", fallbackKey: "/dog_portrait_closeup_1773940826280.png", maxEdge: 1600 },

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
  { id: "review-avatar", group: "Reviews", label: "Vaidehi’s portrait", hint: "Round photo on the testimonial card in the order form.", kind: "image", fallbackKey: "review bar image 1.jpg.jpeg", maxEdge: 800 },

  { id: "extra-mug", group: "Add-on products", label: "Mug", hint: "Mug photo in the order form.", kind: "image", fallbackKey: "/extras/mug.jpg", maxEdge: 900 },
  { id: "extra-magnet", group: "Add-on products", label: "Magnet", hint: "Magnet photo in the order form.", kind: "image", fallbackKey: "/extras/magnet.jpg", maxEdge: 900 },
  { id: "extra-digital", group: "Add-on products", label: "Digital download", hint: "Digital download photo in the order form.", kind: "image", fallbackKey: "/extras/digital-download.jpg", maxEdge: 900 },
];

const SLOT_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function buildIndex() {
  const byId = new Map<string, MediaSlot>();
  const byKey = new Map<string, MediaSlot>();

  for (const slot of MEDIA_SLOTS) {
    if (!SLOT_ID.test(slot.id)) throw new Error(`Invalid media slot id ${slot.id}`);
    if (byId.has(slot.id)) throw new Error(`Duplicate media slot ${slot.id}`);
    byId.set(slot.id, slot);

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

export function mediaSlot(id: string) {
  return index.byId.get(id) || null;
}

export function mediaSlotForKey(key: string) {
  return index.byKey.get(key) || index.byKey.get(getCloudinaryUrl(key)) || null;
}

export function fallbackUrl(slot: MediaSlot) {
  return getCloudinaryUrl(slot.fallbackKey);
}

/** Shop URL for a media key. Overrides win; everything else stays on the original file. */
export function resolveMediaUrl(key: string, overrides: Record<string, string>) {
  const slot = mediaSlotForKey(key);
  if (!slot) return getCloudinaryUrl(key);
  return overrides[slot.id] || getCloudinaryUrl(key);
}

export function mediaGroups() {
  const groups: string[] = [];
  for (const slot of MEDIA_SLOTS) {
    if (!groups.includes(slot.group)) groups.push(slot.group);
  }
  return groups;
}
