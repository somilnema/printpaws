// Everyday Pet Portrait configurator: copy, switches, defaults and option lists.
// Defaults live here; /admin/configurator saves overrides that are merged on top.
// Prices never live here: they come from Admin Pricing.
// Multi-Pet and You & Your Pet reuse the same shape (plus `flow`), so they share every Everyday component.

import { BACKGROUNDS, LIMITED_BACKGROUNDS, optionSlug } from "@/lib/backgrounds";
import { REVIEWS, REVIEWS_SUMMARY } from "@/lib/reviews";

/** Products built on the Everyday three-step configurator. */
export type ConfiguratorProduct = "everyday" | "multi_pet" | "you_and_your_pet" | "mini_desk" | "gift_bundle";

export const CONFIGURATOR_PRODUCTS: ConfiguratorProduct[] = ["everyday", "multi_pet", "you_and_your_pet", "mini_desk", "gift_bundle"];

export const CONFIGURATOR_SLUGS: Record<ConfiguratorProduct, string> = {
  everyday: "everyday-pet-portrait",
  multi_pet: "multi-pet-portrait",
  you_and_your_pet: "you-and-your-pet",
  mini_desk: "mini-desk-portrait",
  gift_bundle: "signature-gift-bundle",
};

export const CONFIGURATOR_NAMES: Record<ConfiguratorProduct, string> = {
  everyday: "Everyday Pet Portrait",
  multi_pet: "Multi-Pet Portrait",
  you_and_your_pet: "You & Your Pet Portrait",
  mini_desk: "Desk Portrait",
  gift_bundle: "Signature Gift Bundle",
};

/** Media slot prefix and admin group for each product's own photos. */
export const CONFIGURATOR_MEDIA: Record<ConfiguratorProduct, { prefix: string; group: string }> = {
  everyday: { prefix: "everyday", group: "Everyday configurator" },
  multi_pet: { prefix: "multi-pet", group: "Multi-Pet configurator" },
  you_and_your_pet: { prefix: "you-pet", group: "You & Your Pet configurator" },
  mini_desk: { prefix: "mini-desk", group: "Desk Portrait configurator" },
  gift_bundle: { prefix: "gift-bundle", group: "Gift Bundle configurator" },
};

export function configuratorForSlug(slug: string): ConfiguratorProduct | null {
  return CONFIGURATOR_PRODUCTS.find((product) => CONFIGURATOR_SLUGS[product] === slug) || null;
}

export function isConfiguratorProduct(value: unknown): value is ConfiguratorProduct {
  return CONFIGURATOR_PRODUCTS.includes(value as ConfiguratorProduct);
}

/** Desk Portrait and Signature Gift Bundle: their own steps, not a Multi-Pet / You & Your Pet flow. */
export type NewProduct = "mini_desk" | "gift_bundle";

export const NEW_PRODUCTS: NewProduct[] = ["mini_desk", "gift_bundle"];

export function isNewProduct(value: unknown): value is NewProduct {
  return value === "mini_desk" || value === "gift_bundle";
}

export type BundleTier = "essential" | "signature";

export const BUNDLE_TIERS: BundleTier[] = ["essential", "signature"];

export function isBundleTier(value: unknown): value is BundleTier {
  return value === "essential" || value === "signature";
}

export type DeskPets = 1 | 2 | 3;

export type PetTypeId = "dog" | "cat" | "other";

export const PET_TYPE_IDS: PetTypeId[] = ["dog", "cat", "other"];

/** What every bundle tier contains (fixed in code so nothing is charged twice). */
export type BundleInclusion = "portrait" | "mug" | "digital" | "magnet" | "standard_packaging" | "premium_packaging";

export const TRUST_ICONS = ["shield", "truck", "heart", "eye", "brush", "star", "refresh", "gift", "clock", "paw"] as const;
export type TrustIcon = (typeof TRUST_ICONS)[number];

export type TrustItem = { icon: TrustIcon; label: string };

export type EverydayBackground = {
  /** Order and pricing key. Never changes once created. */
  id: string;
  label: string;
  visible: boolean;
  /** Tile colour when no tile photo has been uploaded. */
  color: string;
  /** Charges the Limited Edition price from Pricing. Fixed for built-in backgrounds. */
  limited: boolean;
  custom: boolean;
};

export type EverydayFrame = { id: string; label: string; visible: boolean; color: string; custom: boolean };

export type EverydayAccordion = { icon: TrustIcon; title: string; body: string };

export type EverydayPhotoGuide = { title: string; intro: string; tips: string[] };

export type ExtraCopy = { label: string; description: string; visible: boolean };

export type ExtraId = "mug" | "magnet" | "digital" | "desk";

export const EXTRA_IDS: ExtraId[] = ["mug", "magnet", "digital", "desk"];

/** One card in the reviews section. Cards keep their place; the photo is that place's media slot. */
export type ReviewCopy = {
  visible: boolean;
  name: string;
  date: string;
  rating: number;
  verified: boolean;
  text: string;
  /** Small tag on the photo, e.g. "+2". Empty hides it. */
  photosBadge: string;
};

export type EverydayContent = {
  header: {
    productName: string;
    pageSubtitle: string;
    reviewsLabel: string;
    backLabel: string;
    stepLabel: string;
    completeLabel: string;
    priceFormat: string;
    discountPercent: number;
    discountBadge: string;
    pageBackground: string;
    /** Breadcrumb link before the product name (desktop). */
    homeLabel: string;
    /** Pop-up when a choice can't go on, e.g. a size not offered for this many pets. */
    noticeTitle: string;
    noticeButton: string;
  };
  /** Product photos at the top of the page. The photos themselves are media slots. */
  gallery: {
    photoCount: number;
    showVideo: boolean;
  };
  step1: {
    progressName: string;
    title: string;
    description: string;
    defaultStyle: string;
    defaultFramedSize: string;
    defaultCanvasSize: string;
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
    deliveryTitle: string;
    deliverySubtitle: string;
    deliveryPlaceholder: string;
    deliveryInvalid: string;
    deliveryResult: string;
    deliveryRange: string;
    deliveryMinDays: number;
    deliveryMaxDays: number;
    // Preview pop-up: shown as two photos side by side until an infographic is uploaded.
    previewTitle: string;
    previewFramedTitle: string;
    previewFramedTagline: string;
    previewCanvasTitle: string;
    previewCanvasTagline: string;
    previewUnavailable: string;
  };
  step2: {
    progressName: string;
    title: string;
    description: string;
    showFrameColor: boolean;
    frameHeading: string;
    defaultFrame: string;
    backgroundHeading: string;
    defaultBackground: string;
    premiumHint: string;
    limitedHeading: string;
    limitedPrice: string;
    optionalLabel: string;
    petNameHeading: string;
    petNameDescription: string;
    petNamePlaceholder: string;
    petNameMax: number;
    petNameDefaultOn: boolean;
    subtitleHeading: string;
    subtitleDescription: string;
    subtitlePlaceholder: string;
    subtitleMax: number;
    subtitleDefaultOn: boolean;
    showPriority: boolean;
    priorityDefaultOn: boolean;
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
    uploadMaxMb: number;
    uploadingLabel: string;
    removeLabel: string;
    detailsHeading: string;
    detailsDescription: string;
    nameLabel: string;
    namePlaceholder: string;
    phoneLabel: string;
    phonePrefix: string;
    phonePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    optionalLabel: string;
    reassurance: string;
    addToCartLabel: string;
    showTrust: boolean;
    photoError: string;
    nameError: string;
    phoneError: string;
    emailError: string;
    formatErrorTitle: string;
    formatError: string;
    tooLargeTitle: string;
    tooLargeError: string;
    uploadFailTitle: string;
    uploadFailedLabel: string;
    retryLabel: string;
    dialogButton: string;
  };
  trustStep1: TrustItem[];
  trust: TrustItem[];
  backgrounds: EverydayBackground[];
  frames: EverydayFrame[];
  photoGuide: EverydayPhotoGuide;
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
    canvasFrameLabel: string;
    petNameLabel: string;
    subtitleLabel: string;
    photoLabel: string;
    priorityLabel: string;
    notAddedLabel: string;
    removeLabel: string;
    extrasHeading: string;
    optionalLabel: string;
    showGift: boolean;
    /** Crossed-out "was" prices on the add-ons. Show them only for a genuine, approved discount. */
    showCompareAt: boolean;
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
    /** Asked before a portrait from another product page is replaced (the cart holds one portrait). */
    replaceConfirm: string;
    couponEmptyError: string;
    /** {code} and {off} are filled in. */
    couponAppliedMessage: string;
    couponCheckError: string;
  };
  extras: Record<ExtraId, ExtraCopy>;
  below: {
    showTestimonial: boolean;
    testimonialText: string;
    testimonialAuthor: string;
    showTrustedBanner: boolean;
    trustedLabel: string;
    // Shared page sections under the order form (their own text and photos are edited elsewhere).
    showUnboxing: boolean;
    showTicker: boolean;
    showHowItWorks: boolean;
    showFeatures: boolean;
    showCarousel: boolean;
    showComparison: boolean;
    showFaq: boolean;
    showReviews: boolean;
    showInstagram: boolean;
    showTrustFeatures: boolean;
  };
  reviews: {
    summary: string;
    verifiedLabel: string;
    items: ReviewCopy[];
  };
  accordions: EverydayAccordion[];
  /** Multi-Pet and You & Your Pet only: their extra choice, photo methods and launch switches. */
  flow?: FlowContent;
  /** Multi-Pet only: sizes not offered for a pet count, e.g. { four: ['framed:8"x10"'] }. */
  hiddenSizes?: Record<string, string[]>;
  /** Desk Portrait only: its Step 1–3 copy and switches. */
  desk?: DeskContent;
  /** Desk Portrait only: background colour swatches (ids are stored on orders). */
  deskColours?: DeskColour[];
  /** Signature Gift Bundle only: tiers, greeting card and pet details copy. */
  bundle?: BundleContent;
  /** Signature Gift Bundle only: the pet age choices (may be empty). */
  bundleAges?: string[];
};

export type DeskColour = { id: string; label: string; color: string; visible: boolean; custom: boolean };

export type DeskContent = {
  // Step 1 (title/description/progressName/continueLabel/showTrust come from content.step1 like Everyday)
  petsHeading: string;
  onePetLabel: string;
  /** {count} is filled in. */
  manyPetsLabel: string;
  verticalLabel: string;
  horizontalLabel: string;
  /** Chip on the 2 / 3 pet cards when the extra charge is above zero. {price} is filled in. */
  extraPriceLabel: string;
  /** On by default. Off = the landing card says Coming soon and the page is not found. */
  launched: boolean;
  showTwoPets: boolean;
  showThreePets: boolean;
  /** 1..3 */
  defaultPets: number;
  infoTitle: string;
  infoPoints: string[];
  standIncludedLabel: string;
  // Step 2 (title/description/continueLabel from content.step2; no portrait preview)
  colourHeading: string;
  defaultColour: string;
  namesHeading: string;
  namesPlaceholder: string;
  namesHelp: string;
  namesMax: number;
  namesError: string;
  subtitleHeading: string;
  subtitlePlaceholder: string;
  subtitleMax: number;
  subtitleDefaultOn: boolean;
  suggestionsLabel: string;
  suggestions: string[];
  // Step 3 (title/description/details/phone/email copy from content.step3)
  uploadHeading: string;
  /** Inline tips box under the upload tiles (tips = Photo guide tips). Empty hides it. */
  guidelinesTitle: string;
  /** {count} and {layout} are filled in. */
  selectedLabel: string;
  /** {n} is filled in. */
  slotLabel: string;
  /** {slot} is filled in. */
  slotError: string;
  uploadsPendingLabel: string;
  petRemoveConfirm: string;
  // Cart / order labels
  petsCartLabel: string;
  layoutCartLabel: string;
  colourCartLabel: string;
  namesCartLabel: string;
  standCartLabel: string;
  standCartValue: string;
  extraPetsCartLabel: string;
  photosCartLabel: string;
  /** Fixed size written to orders.size (the desk has no size choice). */
  productionSize: string;
};

export type BundleTierCopy = { title: string; description: string; badge: string; visible: boolean };

export type BundleContent = {
  // Step 1 (EverydayChooseStep is reused for style and size)
  tierHeading: string;
  /** "" = nothing preselected. "" | "essential" | "signature" */
  defaultTier: string;
  /** "" hides the price chip on the tier cards. {price} is filled in. */
  tierPriceLabel: string;
  tierError: string;
  essentialTitle: string;
  essentialDescription: string;
  essentialBadge: string;
  essentialVisible: boolean;
  signatureTitle: string;
  signatureDescription: string;
  signatureBadge: string;
  signatureVisible: boolean;
  // Step 2 (EverydayPersonalizeStep is reused)
  /** On by default. Off = the landing card says Coming soon and the page is not found. */
  launched: boolean;
  greetingEnabled: boolean;
  greetingEssential: boolean;
  greetingSignature: boolean;
  greetingHeading: string;
  greetingTitle: string;
  greetingDescription: string;
  greetingPriceLabel: string;
  greetingMessageLabel: string;
  greetingPlaceholder: string;
  greetingMax: number;
  greetingError: string;
  // Step 3
  showPetDetails: boolean;
  /** Step 1 size cards show a price. Off by default (handoff p3: no price in the configurator). */
  showSizePrices: boolean;
  /** Inline tips box under the upload tile (tips = Photo guide tips). Empty hides it. */
  guidelinesTitle: string;
  petDetailsHeading: string;
  petTypeLabel: string;
  dogLabel: string;
  catLabel: string;
  otherLabel: string;
  breedLabel: string;
  breedPlaceholder: string;
  ageLabel: string;
  agePlaceholder: string;
  // Cart / order labels
  tierCartLabel: string;
  includedHeading: string;
  includedValue: string;
  greetingCartLabel: string;
  greetingMessageCartLabel: string;
  petDetailsCartLabel: string;
  // Inclusion labels (cart, staff view, vendor note)
  itemPortrait: string;
  itemMug: string;
  itemDigital: string;
  itemMagnet: string;
  itemStandardPackaging: string;
  itemPremiumPackaging: string;
};

/**
 * Copy and switches the Multi-Pet and You & Your Pet flows add to the Everyday shape.
 * Anything Peternity has not approved yet (Limited Edition, Mixed Photos, …) starts switched off.
 */
export type FlowContent = {
  // Step 1: composition cards (You & Your Pet) or pet-count cards (Multi-Pet)
  choiceHeading: string;
  choiceDescription: string;
  includedLabel: string;
  soloTitle: string;
  soloDescription: string;
  familyTitle: string;
  familyDescription: string;
  upgradeLabel: string;
  petsWord: string;
  // Step 2
  showLimited: boolean;
  soloPersonLabel: string;
  soloPersonPlaceholder: string;
  soloPetLabel: string;
  soloPetPlaceholder: string;
  familyNamesLabel: string;
  familyNamesPlaceholder: string;
  familyNamesMax: number;
  showTribute: boolean;
  tributeHeading: string;
  tributeDescription: string;
  tributePriceLabel: string;
  tributeChooseLabel: string;
  tributeError: string;
  tributeNoteLabel: string;
  tributeNotePlaceholder: string;
  tributeNoteError: string;
  // Step 3
  methodHeading: string;
  groupEnabled: boolean;
  groupTitle: string;
  groupDescription: string;
  separateEnabled: boolean;
  separateTitle: string;
  separateDescription: string;
  mixedEnabled: boolean;
  mixedTitle: string;
  mixedDescription: string;
  groupUploadLabel: string;
  requiredLabel: string;
  petSlotLabel: string;
  personSlotLabel: string;
  youSlotLabel: string;
  yourPetSlotLabel: string;
  familyPetSlotLabel: string;
  familyMaxPeople: number;
  replaceLabel: string;
  confirmGroupLabel: string;
  confirmGroupError: string;
  referencesHeading: string;
  referencesDescription: string;
  referencesMax: number;
  referenceAddLabel: string;
  referenceForLabel: string;
  referenceAnyone: string;
  referencePetError: string;
  petRemoveConfirm: string;
  slotError: string;
  uploadsPendingLabel: string;
  /** Step 1 pop-up for a size this pet count / composition doesn't offer. {size} and {count} are filled in. */
  sizeHiddenError: string;
  showInstructions: boolean;
  instructionsHeading: string;
  instructionsPlaceholder: string;
  instructionsMax: number;
  /** Note under the artist box, e.g. "Final composition remains subject to artistic feasibility." Empty hides it. */
  instructionsHint: string;
  // Cart
  choiceCartLabel: string;
  namesCartLabel: string;
  haloCartLabel: string;
  methodCartLabel: string;
  photosCartLabel: string;
  referencesCartValue: string;
  instructionsCartLabel: string;
};

const NEUTRAL_COLOR = "#F1E7DC";

export const DEFAULT_EVERYDAY_CONTENT: EverydayContent = {
  header: {
    productName: "Everyday Pet Portrait",
    pageSubtitle: "Free shipping across India",
    reviewsLabel: "145 Reviews",
    backLabel: "Back",
    stepLabel: "Step {step} of {total} - {name}",
    completeLabel: "{percent}% Complete",
    priceFormat: "Rs. {price}.00",
    discountPercent: 30,
    discountBadge: "{percent}% OFF",
    pageBackground: "#FAF7F2",
    homeLabel: "Home",
    noticeTitle: "Missing Details",
    noticeButton: "Got It",
  },
  gallery: {
    photoCount: 10,
    showVideo: true,
  },
  step1: {
    progressName: "Choose Your Portrait",
    title: "Choose Your Portrait",
    description: "Select your preferred portrait style and size. We'll create a beautiful, hand-drawn portrait of your pet.",
    defaultStyle: "framed",
    defaultFramedSize: '8"x10"',
    defaultCanvasSize: '8"x12"',
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
    deliveryTitle: "When will I receive my order?",
    deliverySubtitle: "Enter your PIN code to check delivery time",
    deliveryPlaceholder: "Enter 6-digit PIN code",
    deliveryInvalid: "Please enter a valid 6-digit PIN code.",
    deliveryResult: "Estimated delivery: {min}–{max} days",
    deliveryRange: "Expected between {from} – {to} to PIN {pin}",
    deliveryMinDays: 8,
    deliveryMaxDays: 12,
    previewTitle: "Framed vs Canvas",
    previewFramedTitle: "Framed Portrait",
    previewFramedTagline: "Ready to Hang • Classic Look",
    previewCanvasTitle: "Canvas Portrait",
    previewCanvasTagline: "Gallery Wrapped • Premium",
    previewUnavailable: "Framed portraits are temporarily unavailable.",
  },
  step2: {
    progressName: "Personalize Your Portrait",
    title: "Personalize Your Portrait",
    description: "Choose a background and add optional details to make it uniquely yours.",
    showFrameColor: true,
    frameHeading: "Choose a Frame Colour",
    defaultFrame: "black",
    backgroundHeading: "1. Choose a Background",
    defaultBackground: "Pearl",
    premiumHint: "Premium + {price}",
    limitedHeading: "Limited Edition Backgrounds",
    limitedPrice: "+ {price}",
    optionalLabel: "(Optional)",
    petNameHeading: "2. Add Your Pet's Name",
    petNameDescription: "Show your pet's name on the portrait.",
    petNamePlaceholder: "Enter your pet's name",
    petNameMax: 20,
    petNameDefaultOn: true,
    subtitleHeading: "3. Add a Subtitle",
    subtitleDescription: "Add a short message or quote (e.g. Our Little Sunshine).",
    subtitlePlaceholder: "Our Little Sunshine",
    subtitleMax: 30,
    subtitleDefaultOn: true,
    showPriority: true,
    priorityDefaultOn: false,
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
    uploadHint: "JPG, PNG or HEIC (Max {max}MB)",
    // The live shop accepted originals up to 25 MB (they are compressed before upload); keep accepting them.
    uploadMaxMb: 25,
    uploadingLabel: "Uploading…",
    removeLabel: "Remove",
    detailsHeading: "2. Your Details",
    detailsDescription: "Where can we reach you with updates about your portrait?",
    nameLabel: "Full Name",
    namePlaceholder: "Enter your full name",
    phoneLabel: "Mobile Number",
    phonePrefix: "+91",
    phonePlaceholder: "98765 43210",
    emailLabel: "Email Address",
    emailPlaceholder: "you@example.com",
    optionalLabel: "(Optional)",
    reassurance: "You'll receive a preview before printing, with unlimited revisions to get your portrait just right.",
    addToCartLabel: "Add to Cart",
    showTrust: true,
    photoError: "Please choose a pet photo to continue.",
    nameError: "Please enter your full name to continue.",
    phoneError: "Please enter a valid Indian mobile number.",
    emailError: "Please enter a valid email to continue.",
    formatErrorTitle: "Photo format not supported",
    formatError: "We couldn't read this photo on your device. Please choose a JPG or PNG.",
    tooLargeTitle: "File is too large",
    tooLargeError: "“{name}” is {size} MB. Please choose a photo under {max} MB.",
    uploadFailTitle: "Photo upload failed",
    uploadFailedLabel: "Upload failed.",
    retryLabel: "Tap to retry.",
    dialogButton: "Try again",
  },
  trustStep1: [
    { icon: "heart", label: "Hand-drawn with love" },
    { icon: "truck", label: "Free shipping across India" },
    { icon: "shield", label: "Preview before printing" },
  ],
  trust: [
    { icon: "shield", label: "Preview before printing" },
    { icon: "truck", label: "Free shipping across India" },
    { icon: "heart", label: "Hand-drawn with love" },
  ],
  backgrounds: [
    ...BACKGROUNDS.map((bg) => ({
      id: bg.name,
      label: bg.label || bg.name,
      visible: true,
      color: normalizeHex(bg.value, NEUTRAL_COLOR),
      limited: false,
      custom: false,
    })),
    ...LIMITED_BACKGROUNDS.map((bg) => ({
      id: bg.name,
      label: bg.label || bg.name,
      visible: true,
      color: NEUTRAL_COLOR,
      limited: true,
      custom: false,
    })),
  ],
  frames: [
    { id: "black", label: "Black Frame", visible: true, color: "#1F1F1F", custom: false },
    { id: "white", label: "White Frame", visible: true, color: "#FFFFFF", custom: false },
  ],
  photoGuide: {
    title: "Tips for Taking the Perfect Photo of Your Pet",
    intro:
      "For best results, please follow our handy guide below when choosing a photo to upload. We use the exact image uploaded to create your artwork, so please only choose images you are happy for us to use.",
    tips: [
      "Take your photo at eye level with your pet.",
      "Take your photo in natural daylight and don't use flash.",
      "Try to get your pet to sit or stay still - make sure there's no blur.",
      "Photo is sharp and not a screenshot.",
      "Photo is a headshot and taken from a good distance.",
    ],
  },
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
    canvasFrameLabel: "Canvas wrap",
    petNameLabel: "Pet name",
    subtitleLabel: "Subtitle",
    photoLabel: "Uploaded photo",
    priorityLabel: "Priority Preview",
    notAddedLabel: "Not added",
    removeLabel: "Remove",
    extrasHeading: "Additional Products",
    optionalLabel: "Optional",
    showGift: true,
    showCompareAt: true,
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
    replaceConfirm: "Your cart already has a portrait from another page. Replace it with this one?",
    couponEmptyError: "Please enter a coupon code.",
    couponAppliedMessage: "{code} applied — {off} off",
    couponCheckError: "Could not validate coupon. Please try again.",
  },
  extras: {
    mug: { label: "Custom Pet Mug", description: "Create a custom mug using your pet's image.", visible: true },
    magnet: { label: "Custom Pet Fridge Magnet", description: "A custom fridge magnet of your pet.", visible: true },
    digital: { label: "Digital Download", description: "Digital files suitable for wallpapers and other digital uses.", visible: true },
    desk: { label: "Desk Portrait", description: "A compact portrait with wooden stand, perfect for your desk.", visible: true },
  },
  below: {
    showTestimonial: true,
    testimonialText:
      "Didn’t think I’d get emotional over a portrait honestly… but they captured him so perfectly. My family loved it instantly.",
    testimonialAuthor: "Vaidehi",
    showTrustedBanner: true,
    trustedLabel: "Trusted By 1,378+ Happy Pet Parents",
    showUnboxing: true,
    showTicker: true,
    showHowItWorks: true,
    showFeatures: true,
    showCarousel: true,
    showComparison: true,
    showFaq: true,
    showReviews: true,
    showInstagram: true,
    showTrustFeatures: true,
  },
  reviews: {
    summary: REVIEWS_SUMMARY,
    verifiedLabel: "Verified",
    items: REVIEWS.map((review) => ({
      visible: true,
      name: review.name,
      date: review.date,
      rating: review.rating,
      verified: review.verified,
      text: review.text,
      photosBadge: review.hasMultiplePhotos ? "+2" : "",
    })),
  },
  accordions: [
    {
      icon: "paw",
      title: "Description",
      body: [
        "Your pet isn’t just part of your life - they are your life in a thousand little moments. The way they wait for you. The way they look at you. The quiet comfort of just having them close.",
        "At Peternity, we turn your pet’s photo into a portrait that captures all of that - not just how they look, but how they feel to you.",
        "Every piece is carefully created to reflect their personality, so when you see it… it feels like they’re right there, exactly as you know them.",
        "- Preview your artwork before it’s printed\n- 2 revision rounds included\n- Ready to hang, made to stay with you",
        "***Because some bonds don’t fade. They deserve to be remembered, beautifully.***",
      ].join("\n\n"),
    },
    {
      icon: "truck",
      title: "Shipping",
      body: [
        "Within 48 hours, you’ll receive your pet’s portrait preview - the first moment it starts to feel real.",
        "We refine every detail with you, until it doesn’t just look right… it feels like them.",
        "The moment you approve, we begin printing within 24 hours - carefully, thoughtfully, as something that truly matters.",
        "**Delivery across India:** 4-7 working days after approval.",
        "From a photo you love… to a memory you can live with, every single day.",
      ].join("\n\n"),
    },
    {
      icon: "heart",
      title: "Satisfaction Guarantee",
      body: [
        "You’ll receive your portrait preview within 48 hours - and we don’t print until it feels right to you.",
        "We refine every detail with you, from expression to mood, until it truly feels like *them*.",
        "Because this isn’t something you should “settle” for. It should feel personal, emotional… and exactly right.",
      ].join("\n\n"),
    },
  ],
};

function cloneContent(content: EverydayContent): EverydayContent {
  return JSON.parse(JSON.stringify(content)) as EverydayContent;
}

/** Built-in backgrounds with the handoff spelling "Tea Rose". The id stays "Tea Rosé": orders store it. */
function handoffBackgrounds(): EverydayBackground[] {
  return DEFAULT_EVERYDAY_CONTENT.backgrounds.map((bg) => (bg.id === "Tea Rosé" ? { ...bg, label: "Tea Rose" } : { ...bg }));
}

// Multi-Pet handoff (FINAL PDF): copy from the written spec; mockup-only prices and promises are not used.
const MULTI_PET_FLOW: FlowContent = {
  choiceHeading: "2. How Many Pets?",
  choiceDescription: "Choose the number of pets to include in your portrait.",
  includedLabel: "Included",
  soloTitle: "",
  soloDescription: "",
  familyTitle: "",
  familyDescription: "",
  upgradeLabel: "+{price}",
  petsWord: "Pets",
  showLimited: false,
  soloPersonLabel: "",
  soloPersonPlaceholder: "",
  soloPetLabel: "",
  soloPetPlaceholder: "",
  familyNamesLabel: "",
  familyNamesPlaceholder: "",
  familyNamesMax: 60,
  // Halo feasibility, look and price are unconfirmed (handoff p13): off until Peternity approves it (p14).
  showTribute: false,
  tributeHeading: "5. A Special Tribute",
  tributeDescription: "Would you like to add a subtle halo above one of your pets?",
  tributePriceLabel: "+ {price}",
  tributeChooseLabel: "Which pet should have the halo?",
  tributeError: "Choose the pet who should have the halo.",
  tributeNoteLabel: "How will our artist recognise {pet}?",
  tributeNotePlaceholder: "e.g. the brown dog on the left",
  tributeNoteError: "Please tell us which pet should have the halo.",
  methodHeading: "How would you like to upload your photos?",
  groupEnabled: true,
  groupTitle: "One Group Photo",
  groupDescription: "Upload one photo with all your pets together.",
  separateEnabled: true,
  separateTitle: "Individual Pet Photos",
  separateDescription: "Upload a separate photo for each pet.",
  mixedEnabled: false,
  mixedTitle: "Mixed Photos",
  mixedDescription: "Upload a group photo plus additional reference photos.",
  groupUploadLabel: "Upload Group Photo",
  requiredLabel: "Required",
  petSlotLabel: "Pet {n}",
  personSlotLabel: "",
  youSlotLabel: "",
  yourPetSlotLabel: "",
  familyPetSlotLabel: "",
  familyMaxPeople: 4,
  replaceLabel: "Replace",
  confirmGroupLabel: "All my pets are clearly visible and easy to identify in this photo.",
  confirmGroupError: "Please confirm that every pet is visible in your group photo.",
  referencesHeading: "Add Additional Reference Photos",
  referencesDescription: "Share more photos if you'd like (e.g., clearer face, different angle).",
  referencesMax: 4,
  referenceAddLabel: "Add a reference photo",
  referenceForLabel: "Which pet is this?",
  referenceAnyone: "Choose a pet",
  referencePetError: "Please choose which pet this photo shows.",
  petRemoveConfirm: "Changing the number of pets removes the names and photos you added for the pets you're taking out. Continue?",
  slotError: "Please upload a photo for {slot}.",
  uploadsPendingLabel: "Please wait until your photos finish uploading.",
  sizeHiddenError: "Size {size} is not available for {count} pets. Please choose another size.",
  showInstructions: true,
  instructionsHeading: "Anything you'd like our artist to know?",
  instructionsPlaceholder: "e.g., Keep them close together, place one pet in the centre...",
  instructionsMax: 150,
  instructionsHint: "Final composition remains subject to artistic feasibility.",
  choiceCartLabel: "Pets",
  namesCartLabel: "Pet names",
  haloCartLabel: "Halo (Tribute)",
  methodCartLabel: "Photo method",
  photosCartLabel: "Uploaded photos",
  referencesCartValue: "+ {count} reference photo(s)",
  instructionsCartLabel: "Artist note",
};

// You & Your Pet handoff: one flat family upgrade, no people / pet counters, no halo in this release.
const YOU_PET_FLOW: FlowContent = {
  choiceHeading: "1. Choose Your Composition",
  choiceDescription: "",
  includedLabel: "Included in starting price",
  soloTitle: "Me & My Pet",
  soloDescription: "One person + one pet.",
  familyTitle: "My Family & Our Pet",
  familyDescription: "A family portrait with your pet.",
  upgradeLabel: "+ {price}",
  petsWord: "",
  showLimited: false,
  soloPersonLabel: "Your name",
  soloPersonPlaceholder: "e.g. Priya",
  soloPetLabel: "Your pet's name",
  soloPetPlaceholder: "e.g. Bruno",
  familyNamesLabel: "Names",
  familyNamesPlaceholder: "e.g. Rahul, Priya & Bruno",
  familyNamesMax: 60,
  showTribute: false,
  tributeHeading: "",
  tributeDescription: "",
  tributePriceLabel: "",
  tributeChooseLabel: "",
  tributeError: "",
  tributeNoteLabel: "",
  tributeNotePlaceholder: "",
  tributeNoteError: "",
  methodHeading: "How would you like to upload your photos?",
  groupEnabled: true,
  groupTitle: "One Complete Photo",
  groupDescription: "A single photo with everyone together.",
  separateEnabled: true,
  separateTitle: "Separate Photos",
  separateDescription: "Individual photos of each person and pet.",
  mixedEnabled: false,
  mixedTitle: "Mixed Photos",
  mixedDescription: "One group photo plus additional reference photos.",
  groupUploadLabel: "Upload Group Photo",
  requiredLabel: "Required",
  petSlotLabel: "",
  personSlotLabel: "Person {n}",
  youSlotLabel: "You",
  yourPetSlotLabel: "Your pet",
  familyPetSlotLabel: "Your pet",
  familyMaxPeople: 4,
  replaceLabel: "Replace",
  confirmGroupLabel: "",
  confirmGroupError: "",
  referencesHeading: "Add Additional Reference Photos",
  referencesDescription: "Share more photos if you'd like (e.g., clearer face, different angle).",
  referencesMax: 4,
  referenceAddLabel: "Add a reference photo",
  referenceForLabel: "",
  referenceAnyone: "",
  referencePetError: "",
  petRemoveConfirm: "",
  slotError: "Please upload a photo for {slot}.",
  uploadsPendingLabel: "Please wait until your photos finish uploading.",
  sizeHiddenError: "Size {size} is not available for this portrait. Please choose another size.",
  showInstructions: true,
  instructionsHeading: "Artist Instructions",
  instructionsPlaceholder: "e.g., Please keep us sitting together, just like in the photo.",
  instructionsMax: 150,
  instructionsHint: "",
  choiceCartLabel: "Composition",
  namesCartLabel: "Names",
  haloCartLabel: "",
  methodCartLabel: "Photo method",
  photosCartLabel: "Uploaded photos",
  referencesCartValue: "+ {count} reference photo(s)",
  instructionsCartLabel: "Artist note",
};

export const DEFAULT_MULTI_PET_CONTENT: EverydayContent = (() => {
  const content = cloneContent(DEFAULT_EVERYDAY_CONTENT);
  content.header.productName = "Multi-Pet Portrait";
  // Handoff: strikethrough and badge only for a genuine approved discount (set it in the admin when there is one).
  content.header.discountPercent = 0;
  Object.assign(content.step1, {
    title: "Bring Your Pets Together",
    description: "Celebrate all your furry family members in one beautiful portrait.",
    styleHeading: "1. Select Portrait Style",
    sizeHeading: "3. Choose Your Size",
  });
  Object.assign(content.step2, {
    frameHeading: "1. Choose Frame Colour",
    backgroundHeading: "2. Choose a Background",
    petNameHeading: "3. Add Your Pets' Names",
    petNameDescription: "Show your pets' names on the portrait.",
    petNamePlaceholder: "Pet {n} Name",
    petNameDefaultOn: false,
    subtitleHeading: "4. Add a Subtitle",
    subtitleDescription: "Add a short message or quote (e.g. Our Little Family).",
    subtitlePlaceholder: "Our Little Family",
    subtitleDefaultOn: false,
    showPriority: false,
    priorityDefaultOn: false,
    priorityDescription: "",
    priorityInfo: "",
  });
  Object.assign(content.step3, {
    progressName: "Upload Your Photos",
    title: "Upload Your Pets' Photos",
    description: "Share clear photos of all your pets. We'll turn them into a beautiful, hand-drawn portrait you'll love.",
    detailsHeading: "Your Details",
    photoError: "Please upload the photos we need to continue.",
  });
  content.backgrounds = handoffBackgrounds();
  content.photoGuide = {
    title: "Tips for Taking the Perfect Photos of Your Pets",
    intro:
      "For best results, please follow our guide below when choosing photos to upload. We use the exact images you upload to create your artwork, so please only choose photos you are happy for us to use.",
    tips: [
      "Use clear, well-lit photos.",
      "Make sure every face is visible.",
      "Avoid blur and heavy filters.",
      "Each pet should be easy to identify.",
      "A group photo should show all your pets.",
    ],
  };
  content.cart.petNameLabel = "Pet names";
  content.cart.frameLabel = "Frame colour";
  // Handoff p11/p12: an original price only for a genuine discount. p13: Desk Portrait and delivery promises are unconfirmed.
  content.cart.showCompareAt = false;
  content.step1.showDeliveryEstimate = false;
  content.extras.desk = { ...content.extras.desk, visible: false, description: "A compact portrait with a stand, perfect for your desk." };
  // The Everyday testimonial is about one pet.
  content.below.showTestimonial = false;
  content.extras.mug.description = "Create a custom mug using your pets' image.";
  content.extras.magnet.description = "A custom fridge magnet of your pets.";
  content.flow = { ...MULTI_PET_FLOW };
  content.hiddenSizes = {};
  return content;
})();

export const DEFAULT_YOU_PET_CONTENT: EverydayContent = (() => {
  const content = cloneContent(DEFAULT_EVERYDAY_CONTENT);
  content.header.productName = "You & Your Pet Portrait";
  content.header.discountPercent = 0;
  Object.assign(content.step1, {
    title: "Together Is Our Favourite Place",
    description: "Turn a special moment with your loved ones and your pet into a beautiful, hand-drawn portrait.",
    styleHeading: "2. Select Portrait Style",
    sizeHeading: "3. Choose Your Size",
  });
  Object.assign(content.step2, {
    frameHeading: "1. Choose Frame Colour",
    backgroundHeading: "2. Choose a Background",
    petNameHeading: "3. Add Names",
    petNameDescription: "Show names on the portrait.",
    petNameDefaultOn: false,
    subtitleHeading: "4. Add a Subtitle",
    subtitleDescription: "Add a short message or quote (e.g. Best Friends Forever).",
    subtitlePlaceholder: "Best Friends Forever",
    subtitleDefaultOn: false,
    showPriority: false,
    priorityDefaultOn: false,
    priorityDescription: "",
    priorityInfo: "",
  });
  Object.assign(content.step3, {
    progressName: "Upload Your Photos",
    title: "Upload Your Photos & Details",
    description: "Share your photos and a few details so our artists can create your perfect portrait.",
    detailsHeading: "Your Details",
    photoError: "Please upload the photos we need to continue.",
  });
  content.backgrounds = handoffBackgrounds();
  content.photoGuide = {
    title: "Tips for Taking the Perfect Photos",
    intro:
      "For best results, please follow our guide below when choosing photos to upload. We use the exact images you upload to create your artwork, so please only choose photos you are happy for us to use.",
    tips: [
      "Use clear, well-lit photos taken in daylight.",
      "Make sure every face is visible and in focus.",
      "Avoid blur, heavy filters and screenshots.",
      "In a group photo, everyone should be fully in the frame.",
    ],
  };
  content.cart.petNameLabel = "Names";
  content.flow = { ...YOU_PET_FLOW };
  content.hiddenSizes = {};
  return content;
})();

// Desk Portrait handoff: one fixed size, wooden stand always included, 1 pet vertical / 2–3 pets horizontal.
const DEFAULT_DESK: DeskContent = {
  petsHeading: "1. Select Number of Pets",
  onePetLabel: "1 Pet",
  manyPetsLabel: "{count} Pets",
  verticalLabel: "Vertical layout",
  horizontalLabel: "Horizontal layout",
  extraPriceLabel: "+ {price}",
  launched: true,
  showTwoPets: true,
  showThreePets: true,
  defaultPets: 1,
  infoTitle: "Good to Know",
  infoPoints: [
    "Single pet portraits are created in a vertical layout.",
    "Two and three pet portraits are created in a horizontal layout.",
    "A premium wooden stand is included with your desk portrait.",
  ],
  standIncludedLabel: "Wooden stand included",
  colourHeading: "1. Choose a Background Colour",
  defaultColour: "cream",
  namesHeading: "2. Add Pet Name(s)",
  namesPlaceholder: "e.g. Sona",
  namesHelp: "Enter the name(s) of your pet(s). For multiple pets, separate names with a comma (e.g., Max, Coco & Milo).",
  namesMax: 30,
  namesError: "Please enter your pet's name to continue.",
  subtitleHeading: "3. Add a Subtitle",
  subtitlePlaceholder: "My Little Sunshine",
  subtitleMax: 30,
  subtitleDefaultOn: false,
  suggestionsLabel: "Examples:",
  suggestions: ["My Little Sunshine", "Forever in Our Hearts", "Our Furry Family"],
  uploadHeading: "1. Upload Pet Photo(s)",
  guidelinesTitle: "Photo Guidelines for Best Results",
  selectedLabel: "You selected: {count} ({layout})",
  slotLabel: "Pet {n}",
  slotError: "Please upload a photo for {slot}.",
  uploadsPendingLabel: "Please wait until your photos finish uploading.",
  petRemoveConfirm: "Changing the number of pets removes the photos you added for the pets you're taking out. Continue?",
  petsCartLabel: "Pets",
  layoutCartLabel: "Layout",
  colourCartLabel: "Background colour",
  namesCartLabel: "Pet name(s)",
  standCartLabel: "Wooden stand",
  standCartValue: "Included",
  extraPetsCartLabel: "Extra pets",
  photosCartLabel: "Uploaded photos",
  productionSize: "Desk Portrait (fixed size)",
};

/** Built-in desk colours. Ids never change: orders store them. */
export const DEFAULT_DESK_COLOURS: DeskColour[] = [
  { id: "cream", label: "Cream", color: "#F6EEDF", visible: true, custom: false },
  { id: "beige", label: "Beige", color: "#EADBC8", visible: true, custom: false },
  { id: "light-pink", label: "Light Pink", color: "#F7DCDD", visible: true, custom: false },
  { id: "sage-green", label: "Sage Green", color: "#D6E2CC", visible: true, custom: false },
  { id: "light-blue", label: "Light Blue", color: "#D8E6F3", visible: true, custom: false },
  { id: "lavender", label: "Lavender", color: "#E4DDF0", visible: true, custom: false },
];

// Signature Gift Bundle handoff: Signature is highlighted but NOT preselected; one optional paid greeting card.
const DEFAULT_BUNDLE: BundleContent = {
  tierHeading: "1. Choose Your Bundle",
  defaultTier: "",
  tierPriceLabel: "",
  tierError: "Please choose a bundle to continue.",
  essentialTitle: "Essential Gift Bundle",
  essentialDescription: "",
  essentialBadge: "",
  essentialVisible: true,
  signatureTitle: "Signature Gift Bundle",
  signatureDescription: "Everything in Essential, plus:",
  signatureBadge: "★ Best Value",
  signatureVisible: true,
  launched: true,
  greetingEnabled: true,
  greetingEssential: true,
  greetingSignature: true,
  greetingHeading: "",
  greetingTitle: "Add a Personalised Greeting Card",
  greetingDescription: "Include a custom printed card with a heartfelt message for your loved one.",
  greetingPriceLabel: "+ {price}",
  greetingMessageLabel: "Your message",
  greetingPlaceholder: "Write a heartfelt message for your loved one...",
  greetingMax: 150,
  greetingError: "Please write the message for your greeting card.",
  showPetDetails: true,
  showSizePrices: false,
  guidelinesTitle: "Photo Guidelines for Best Results",
  petDetailsHeading: "2. Pet Details",
  petTypeLabel: "Pet Type",
  dogLabel: "Dog",
  catLabel: "Cat",
  otherLabel: "Other",
  breedLabel: "Breed",
  breedPlaceholder: "e.g., Golden Retriever",
  ageLabel: "Age",
  agePlaceholder: "Select age",
  tierCartLabel: "Bundle",
  includedHeading: "Included in your bundle",
  includedValue: "Included",
  greetingCartLabel: "Personalised Greeting Card",
  greetingMessageCartLabel: "Card message",
  petDetailsCartLabel: "Pet details",
  itemPortrait: "Personalised Pet Portrait",
  itemMug: "Custom Pet Mug",
  itemDigital: "High-Resolution Digital Portrait",
  itemMagnet: "Custom Pet Fridge Magnet",
  itemStandardPackaging: "Standard Gift Packaging",
  itemPremiumPackaging: "Premium Gift Packaging",
};

const DEFAULT_BUNDLE_AGES = ["< 1 year", "1 – 3 years", "4 – 7 years", "8+ years"];

/** Shared by both new products: no priority, no fake discount, no unconfirmed promises. */
function newProductBase(productName: string): EverydayContent {
  const content = cloneContent(DEFAULT_EVERYDAY_CONTENT);
  content.header.productName = productName;
  content.header.discountPercent = 0;
  Object.assign(content.step2, {
    petNameDefaultOn: false,
    subtitleDefaultOn: false,
    showPriority: false,
    priorityDefaultOn: false,
    priorityDescription: "",
    priorityInfo: "",
  });
  content.step1.showDeliveryEstimate = false;
  content.below.showTestimonial = false;
  content.cart.showCompareAt = false;
  return content;
}

export const DEFAULT_MINI_DESK_CONTENT: EverydayContent = (() => {
  const content = newProductBase("Desk Portrait");
  for (const id of EXTRA_IDS) content.extras[id] = { ...content.extras[id], visible: false };
  // No unnecessary add-ons: the wooden stand is always included.
  content.cart.showGift = false;
  Object.assign(content.step1, {
    progressName: "Choose Your Portrait",
    title: "Choose Your Portrait",
    description: "A personalised desk portrait of your pet, perfect for your home or workspace.",
  });
  Object.assign(content.step2, {
    progressName: "Personalise Your Portrait",
    title: "Personalise Your Portrait",
    description: "Choose a background colour and add your pet's name and an optional subtitle.",
  });
  Object.assign(content.step3, {
    title: "Upload Your Photo",
    description: "Upload clear photo(s) of your pet(s) to create your personalised desk portrait.",
    detailsHeading: "2. Your Details",
    photoError: "Please upload the photos we need to continue.",
  });
  content.photoGuide = {
    ...content.photoGuide,
    tips: [
      "Clear & well-lit photo",
      "Pet facing the camera",
      "Head and chest visible",
      "No filters or heavy edits",
    ],
  };
  content.desk = { ...DEFAULT_DESK, infoPoints: [...DEFAULT_DESK.infoPoints], suggestions: [...DEFAULT_DESK.suggestions] };
  content.deskColours = DEFAULT_DESK_COLOURS.map((colour) => ({ ...colour }));
  return content;
})();

export const DEFAULT_GIFT_BUNDLE_CONTENT: EverydayContent = (() => {
  const content = newProductBase("Signature Gift Bundle");
  // Included items are always hidden for their tier anyway; nothing else is sold on top of the bundle by default.
  for (const id of EXTRA_IDS) content.extras[id] = { ...content.extras[id], visible: false };
  // Packaging is part of the bundle: no paid gift wrap on top.
  content.cart.showGift = false;
  Object.assign(content.step1, {
    progressName: "Choose Your Gift Bundle",
    title: "Choose Your Gift Bundle",
    description: "Choose the gift that feels right. Every bundle includes a personalised pet portrait.",
    styleHeading: "2. Select Portrait Style",
    sizeHeading: "3. Choose Your Size",
  });
  Object.assign(content.step2, {
    progressName: "Personalise Your Gift",
    title: "Personalise Your Gift",
    description: "Add a personal touch to make this gift truly special.",
    showFrameColor: false,
    backgroundHeading: "1. Choose a Portrait Background",
    petNameHeading: "2. Add Your Pet's Name",
    petNameMax: 20,
    subtitleHeading: "3. Add a Subtitle",
    subtitlePlaceholder: "My Little Sunshine",
  });
  Object.assign(content.step3, {
    title: "Upload Your Photo",
    description: "Share your pet's photo and a few details to create a perfect, personalised gift.",
    uploadHeading: "1. Upload Your Pet's Photo",
    detailsHeading: "3. Your Details",
  });
  content.backgrounds = handoffBackgrounds().map((bg) => (bg.limited ? { ...bg, visible: false } : bg));
  // Handoff p8 photo guidance.
  content.photoGuide = {
    ...content.photoGuide,
    tips: ["Clear & well-lit photo", "Facing the camera", "Head and chest visible", "No filters or heavy edits"],
  };
  content.bundle = { ...DEFAULT_BUNDLE };
  content.bundleAges = [...DEFAULT_BUNDLE_AGES];
  content.hiddenSizes = {};
  return content;
})();

/** Defaults for a product before any admin edits. */
export function defaultContent(product: ConfiguratorProduct): EverydayContent {
  if (product === "multi_pet") return DEFAULT_MULTI_PET_CONTENT;
  if (product === "you_and_your_pet") return DEFAULT_YOU_PET_CONTENT;
  if (product === "mini_desk") return DEFAULT_MINI_DESK_CONTENT;
  if (product === "gift_bundle") return DEFAULT_GIFT_BUNDLE_CONTENT;
  return DEFAULT_EVERYDAY_CONTENT;
}

/** Numeric fields and the range admin may set. */
export const NUMBER_LIMITS: Record<string, { min: number; max: number }> = {
  "header.discountPercent": { min: 0, max: 90 },
  "gallery.photoCount": { min: 1, max: 10 },
  "reviews.items.rating": { min: 1, max: 5 },
  "step1.deliveryMinDays": { min: 1, max: 60 },
  "step1.deliveryMaxDays": { min: 1, max: 90 },
  "step2.petNameMax": { min: 5, max: 40 },
  "step2.subtitleMax": { min: 10, max: 60 },
  "step3.uploadMaxMb": { min: 1, max: 25 },
  "flow.familyNamesMax": { min: 10, max: 120 },
  "flow.familyMaxPeople": { min: 1, max: 10 },
  "flow.referencesMax": { min: 0, max: 8 },
  "flow.instructionsMax": { min: 50, max: 500 },
  "desk.defaultPets": { min: 1, max: 3 },
  "desk.namesMax": { min: 10, max: 80 },
  "desk.subtitleMax": { min: 10, max: 80 },
  "bundle.greetingMax": { min: 50, max: 500 },
};

const MAX_TEXT = 600;
const MAX_BODY = 4000;
const MAX_OPTIONS = 40;
const MAX_ACCORDIONS = 8;
const MAX_TIPS = 10;
const OPTION_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
/** Frame values other parts of the shop already use, so a new frame can't take them. */
const RESERVED_FRAME_IDS = ["canva", "wood"];

type Flat = Record<string, string | number | boolean>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeHex(value: unknown, fallback: string) {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value.trim()) ? value.trim().toUpperCase() : fallback;
}

function cleanLabel(value: unknown, fallback: string, max = 40) {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : fallback;
}

function asIcon(value: unknown): TrustIcon {
  return TRUST_ICONS.includes(value as TrustIcon) ? (value as TrustIcon) : "heart";
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

function mergeTrust(raw: unknown, defaults: TrustItem[]): TrustItem[] {
  if (!Array.isArray(raw)) return defaults.map((item) => ({ ...item }));
  const items: TrustItem[] = [];
  for (const entry of raw.slice(0, 4)) {
    if (!isRecord(entry)) continue;
    items.push({ icon: asIcon(entry.icon), label: typeof entry.label === "string" ? entry.label.slice(0, 80) : "" });
  }
  return items;
}

/** Every built-in background once, in saved order, plus valid custom ones. Pricing tier of built-ins never changes. */
function mergeBackgrounds(raw: unknown, defaults: EverydayBackground[]): EverydayBackground[] {
  const builtInSlugs = new Set(defaults.map((bg) => optionSlug(bg.id)));
  const out: EverydayBackground[] = [];
  const seen = new Set<string>();
  if (Array.isArray(raw)) {
    for (const entry of raw) {
      if (out.length >= MAX_OPTIONS) break;
      if (!isRecord(entry) || typeof entry.id !== "string" || seen.has(entry.id)) continue;
      const id = entry.id;
      const visible = typeof entry.visible === "boolean" ? entry.visible : true;
      const base = defaults.find((bg) => bg.id === id);
      if (base) {
        out.push({ ...base, label: cleanLabel(entry.label, base.label), visible, color: normalizeHex(entry.color, base.color) });
      } else if (entry.custom === true && id.length <= 40 && OPTION_ID.test(id) && !builtInSlugs.has(id)) {
        out.push({
          id,
          label: cleanLabel(entry.label, id),
          visible,
          color: normalizeHex(entry.color, NEUTRAL_COLOR),
          limited: entry.limited === true,
          custom: true,
        });
      } else {
        continue;
      }
      seen.add(id);
    }
  }
  for (const bg of defaults) {
    if (!seen.has(bg.id)) out.push({ ...bg });
  }
  return out;
}

function mergeFrames(raw: unknown, defaults: EverydayFrame[]): EverydayFrame[] {
  const out: EverydayFrame[] = [];
  const seen = new Set<string>();
  if (Array.isArray(raw)) {
    for (const entry of raw) {
      if (out.length >= MAX_OPTIONS) break;
      if (!isRecord(entry) || typeof entry.id !== "string" || seen.has(entry.id)) continue;
      const id = entry.id;
      const visible = typeof entry.visible === "boolean" ? entry.visible : true;
      const base = defaults.find((frame) => frame.id === id);
      if (base) {
        out.push({ ...base, label: cleanLabel(entry.label, base.label), visible, color: normalizeHex(entry.color, base.color) });
      } else if (entry.custom === true && id.length <= 40 && OPTION_ID.test(id) && !RESERVED_FRAME_IDS.includes(id)) {
        out.push({ id, label: cleanLabel(entry.label, id), visible, color: normalizeHex(entry.color, "#1F1F1F"), custom: true });
      } else {
        continue;
      }
      seen.add(id);
    }
  }
  for (const frame of defaults) {
    if (!seen.has(frame.id)) out.push({ ...frame });
  }
  return out;
}

function mergePhotoGuide(raw: unknown, d: EverydayPhotoGuide): EverydayPhotoGuide {
  if (!isRecord(raw)) return { ...d, tips: [...d.tips] };
  return {
    title: typeof raw.title === "string" ? raw.title.slice(0, MAX_TEXT) : d.title,
    intro: typeof raw.intro === "string" ? raw.intro.slice(0, MAX_BODY) : d.intro,
    tips: Array.isArray(raw.tips)
      ? raw.tips
          .filter((tip): tip is string => typeof tip === "string")
          .slice(0, MAX_TIPS)
          .map((tip) => tip.slice(0, MAX_TEXT))
      : [...d.tips],
  };
}

function mergeAccordions(raw: unknown, defaults: EverydayAccordion[]): EverydayAccordion[] {
  if (!Array.isArray(raw)) return defaults.map((item) => ({ ...item }));
  const items: EverydayAccordion[] = [];
  for (const entry of raw.slice(0, MAX_ACCORDIONS)) {
    if (!isRecord(entry)) continue;
    items.push({
      icon: asIcon(entry.icon),
      title: typeof entry.title === "string" ? entry.title.slice(0, 80) : "",
      body: typeof entry.body === "string" ? entry.body.slice(0, MAX_BODY) : "",
    });
  }
  return items;
}

/** Review cards keep their place (each place has its own photo slot), so the list never grows or shrinks. */
function mergeReviews(raw: unknown, d: EverydayContent["reviews"]): EverydayContent["reviews"] {
  const source = isRecord(raw) ? raw : {};
  const head = mergeFlat({ summary: d.summary, verifiedLabel: d.verifiedLabel }, source, "reviews");
  const items = Array.isArray(source.items) ? source.items : [];
  return {
    ...head,
    items: d.items.map((item, index) => mergeFlat(item, items[index], "reviews.items")),
  };
}

/** Saved JSON → full content. Unknown keys are dropped; missing keys use the defaults. */
export function mergeEverydayContent(raw: unknown, base: EverydayContent = DEFAULT_EVERYDAY_CONTENT): EverydayContent {
  const source = isRecord(raw) ? raw : {};
  const d = base;
  const extrasRaw = isRecord(source.extras) ? source.extras : {};
  const header = mergeFlat(d.header, source.header, "header");
  header.pageBackground = normalizeHex(header.pageBackground, d.header.pageBackground);
  const step1 = mergeFlat(d.step1, source.step1, "step1");
  if (step1.defaultStyle !== "framed" && step1.defaultStyle !== "canvas") step1.defaultStyle = d.step1.defaultStyle;
  step1.deliveryMaxDays = Math.max(step1.deliveryMinDays, step1.deliveryMaxDays);
  return {
    header,
    gallery: mergeFlat(d.gallery, source.gallery, "gallery"),
    step1,
    step2: mergeFlat(d.step2, source.step2, "step2"),
    step3: mergeFlat(d.step3, source.step3, "step3"),
    trustStep1: mergeTrust(source.trustStep1, d.trustStep1),
    trust: mergeTrust(source.trust, d.trust),
    backgrounds: mergeBackgrounds(source.backgrounds, d.backgrounds),
    frames: mergeFrames(source.frames, d.frames),
    photoGuide: mergePhotoGuide(source.photoGuide, d.photoGuide),
    cart: mergeFlat(d.cart, source.cart, "cart"),
    extras: {
      mug: mergeFlat(d.extras.mug, extrasRaw.mug, "extras.mug"),
      magnet: mergeFlat(d.extras.magnet, extrasRaw.magnet, "extras.magnet"),
      digital: mergeFlat(d.extras.digital, extrasRaw.digital, "extras.digital"),
      desk: mergeFlat(d.extras.desk, extrasRaw.desk, "extras.desk"),
    },
    below: mergeFlat(d.below, source.below, "below"),
    reviews: mergeReviews(source.reviews, d.reviews),
    accordions: mergeAccordions(source.accordions, d.accordions),
  };
}

/** Pet counts the Multi-Pet size rules can mention. */
export const SIZE_RULE_PETS = ["two", "three", "four"] as const;

/** Size rules: Multi-Pet per pet count, You & Your Pet per composition, Gift Bundle per tier. */
export const SIZE_RULE_KEYS: Partial<Record<ConfiguratorProduct, readonly string[]>> = {
  multi_pet: SIZE_RULE_PETS,
  you_and_your_pet: ["solo", "family"],
  gift_bundle: BUNDLE_TIERS,
};

/** 'framed' + '8"x10"' → 'framed:8"x10"' (sizes of both styles can share dimensions). */
export function sizeRuleKey(style: string, size: string) {
  return `${style}:${size}`;
}

function mergeHiddenSizes(raw: unknown, keys: readonly string[]): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  if (!isRecord(raw)) return out;
  for (const pets of keys) {
    const list = raw[pets];
    if (!Array.isArray(list)) continue;
    const keys = [
      ...new Set(
        list.filter((key): key is string => typeof key === "string" && /^(framed|canvas):\d{1,3}"x\d{1,3}"$/.test(key))
      ),
    ];
    if (keys.length) out[pets] = keys.slice(0, MAX_OPTIONS);
  }
  return out;
}

const MAX_LIST_ITEMS = 10;

/** Admin string list: trimmed, empty entries dropped, capped. An empty saved list stays empty. */
function mergeStringList(raw: unknown, defaults: string[], maxLength: number, unique = false): string[] {
  if (!Array.isArray(raw)) return [...defaults];
  const items = raw
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim().slice(0, maxLength))
    .filter(Boolean);
  return (unique ? [...new Set(items)] : items).slice(0, MAX_LIST_ITEMS);
}

function mergeDesk(raw: unknown, d: DeskContent, colours: DeskColour[]): DeskContent {
  const source = isRecord(raw) ? raw : {};
  const { infoPoints, suggestions, ...flatDefaults } = d;
  const flat = mergeFlat(flatDefaults, source, "desk");
  if (flat.defaultColour && !colours.some((colour) => colour.id === flat.defaultColour)) flat.defaultColour = d.defaultColour;
  flat.productionSize = flat.productionSize.trim().slice(0, 80) || d.productionSize;
  // `...d` first keeps the default key order (the admin compares saved and default content as JSON).
  return {
    ...d,
    ...flat,
    infoPoints: mergeStringList(source.infoPoints, infoPoints, 120),
    suggestions: mergeStringList(source.suggestions, suggestions, 120),
  };
}

/** Every built-in colour once, in saved order, plus valid custom ones (like the frames). */
function mergeDeskColours(raw: unknown, defaults: DeskColour[]): DeskColour[] {
  const out: DeskColour[] = [];
  const seen = new Set<string>();
  if (Array.isArray(raw)) {
    for (const entry of raw) {
      if (out.length >= MAX_OPTIONS) break;
      if (!isRecord(entry) || typeof entry.id !== "string" || seen.has(entry.id)) continue;
      const id = entry.id;
      const visible = typeof entry.visible === "boolean" ? entry.visible : true;
      const base = defaults.find((colour) => colour.id === id);
      if (base) {
        out.push({ ...base, label: cleanLabel(entry.label, base.label), visible, color: normalizeHex(entry.color, base.color) });
      } else if (entry.custom === true && id.length <= 40 && OPTION_ID.test(id)) {
        out.push({ id, label: cleanLabel(entry.label, id), visible, color: normalizeHex(entry.color, NEUTRAL_COLOR), custom: true });
      } else {
        continue;
      }
      seen.add(id);
    }
  }
  for (const colour of defaults) {
    if (!seen.has(colour.id)) out.push({ ...colour });
  }
  // At least one colour must stay on, or the server would refuse every desk order.
  if (out.length && !out.some((colour) => colour.visible)) out[0] = { ...out[0], visible: true };
  return out;
}

function mergeBundle(raw: unknown, d: BundleContent): BundleContent {
  const bundle = mergeFlat(d, raw, "bundle");
  // At least one tier must stay on, or the server would refuse every bundle order.
  if (!bundle.essentialVisible && !bundle.signatureVisible) bundle.essentialVisible = true;
  if (bundle.defaultTier !== "" && !isBundleTier(bundle.defaultTier)) bundle.defaultTier = d.defaultTier;
  // A hidden tier can't be preselected.
  if (
    (bundle.defaultTier === "essential" && !bundle.essentialVisible) ||
    (bundle.defaultTier === "signature" && !bundle.signatureVisible)
  ) {
    bundle.defaultTier = "";
  }
  return bundle;
}

/** Saved JSON → full content for any configurator product (Everyday keeps its exact old shape). */
export function mergeProductContent(product: ConfiguratorProduct, raw: unknown): EverydayContent {
  const base = defaultContent(product);
  const merged = mergeEverydayContent(raw, base);
  const source = isRecord(raw) ? raw : {};
  if (base.desk) {
    const deskColours = mergeDeskColours(source.deskColours, base.deskColours || DEFAULT_DESK_COLOURS);
    merged.desk = mergeDesk(source.desk, base.desk, deskColours);
    merged.deskColours = deskColours;
  }
  if (base.bundle) {
    merged.bundle = mergeBundle(source.bundle, base.bundle);
    merged.bundleAges = mergeStringList(source.bundleAges, base.bundleAges || DEFAULT_BUNDLE_AGES, 40, true);
  }
  if (base.flow) {
    merged.flow = mergeFlat(base.flow, source.flow, "flow");
    // At least one photo method must stay on, or the shop and the server would refuse every order.
    if (!merged.flow.groupEnabled && !merged.flow.separateEnabled && !merged.flow.mixedEnabled) merged.flow.groupEnabled = true;
  }
  if (!base.flow && !base.bundle) return merged;
  const ruleKeys = SIZE_RULE_KEYS[product];
  if (ruleKeys) merged.hiddenSizes = mergeHiddenSizes(source.hiddenSizes, ruleKeys);
  return merged;
}

/** Fixed, non-admin rule: what each bundle tier contains. */
export function bundleInclusions(tier: BundleTier): BundleInclusion[] {
  return tier === "signature"
    ? ["portrait", "mug", "digital", "magnet", "premium_packaging"]
    : ["portrait", "mug", "digital", "standard_packaging"];
}

/** Add-ons a tier already includes: never offered or charged on top. */
export function bundleIncludedExtras(tier: BundleTier): ExtraId[] {
  return tier === "signature" ? ["mug", "digital", "magnet"] : ["mug", "digital"];
}

/** Admin label of an inclusion id (cart, staff view, vendor note). Unknown ids come back as they are. */
export function bundleInclusionLabel(content: EverydayContent, id: string): string {
  const bundle = content.bundle || DEFAULT_BUNDLE;
  const labels: Record<BundleInclusion, keyof BundleContent> = {
    portrait: "itemPortrait",
    mug: "itemMug",
    digital: "itemDigital",
    magnet: "itemMagnet",
    standard_packaging: "itemStandardPackaging",
    premium_packaging: "itemPremiumPackaging",
  };
  if (!Object.prototype.hasOwnProperty.call(labels, id)) return id;
  const field = labels[id as BundleInclusion];
  return String(bundle[field] || DEFAULT_BUNDLE[field]);
}

/** Title, description, badge and switch of one tier card. */
export function bundleTierCopy(content: EverydayContent, tier: BundleTier): BundleTierCopy {
  const bundle = content.bundle || DEFAULT_BUNDLE;
  return tier === "signature"
    ? { title: bundle.signatureTitle, description: bundle.signatureDescription, badge: bundle.signatureBadge, visible: bundle.signatureVisible }
    : { title: bundle.essentialTitle, description: bundle.essentialDescription, badge: bundle.essentialBadge, visible: bundle.essentialVisible };
}

/** Tiers the admin keeps on sale (copy switch only; prices are checked against Pricing elsewhere). */
export function visibleBundleTiers(content: EverydayContent): BundleTier[] {
  return BUNDLE_TIERS.filter((tier) => bundleTierCopy(content, tier).visible);
}

/** Whether the paid greeting card is offered with this tier. */
export function greetingOffered(content: EverydayContent, tier: BundleTier | ""): boolean {
  const bundle = content.bundle;
  if (!bundle || !bundle.greetingEnabled || !tier) return false;
  return tier === "signature" ? bundle.greetingSignature : bundle.greetingEssential;
}

/** 1 pet → vertical, 2 or 3 pets → horizontal (automatic, never chosen). */
/** Desk Portrait / Gift Bundle: the admin's Launch switch (Configurator → product options). */
export function newProductLaunched(content: EverydayContent | null | undefined) {
  // On unless the admin switched it off (content saved or cached before the switch existed counts as on).
  const flag = content?.desk ? content.desk.launched : content?.bundle?.launched;
  return flag !== false;
}

export function deskLayout(pets: number): "vertical" | "horizontal" {
  return pets === 1 ? "vertical" : "horizontal";
}

export function visibleDeskColours(content: EverydayContent): DeskColour[] {
  return (content.deskColours || []).filter((colour) => colour.visible);
}

/** "1 Pet" / "3 Pets" from the admin labels. */
export function deskPetsLabel(content: EverydayContent, n: number): string {
  const desk = content.desk || DEFAULT_DESK;
  return n === 1 ? desk.onePetLabel : fill(desk.manyPetsLabel, { count: n });
}

/** Sizes the admin keeps off sale for a rule: a pet count (Multi-Pet) or a composition (You & Your Pet). */
export function sizeHiddenForPets(content: EverydayContent, rule: string, style: string, size: string) {
  return Boolean(content.hiddenSizes?.[rule]?.includes(sizeRuleKey(style, size)));
}

/** "2. Choose a Background" shown as section `n`: the admin's number prefix follows the visible order. */
export function numberedHeading(heading: string, n: number) {
  const match = /^\s*\d+\.\s*/.exec(heading);
  return match ? `${n}. ${heading.slice(match[0].length)}` : heading;
}

/** Background ids the server charges the Limited Edition price for. */
export function limitedBackgroundIds(content: EverydayContent) {
  return content.backgrounds.filter((bg) => bg.limited).map((bg) => bg.id);
}

/** Stable id for a new background or frame. `taken` holds existing ids in any form. */
export function optionIdFromLabel(label: string, taken: string[], reserved: string[] = RESERVED_FRAME_IDS) {
  const used = new Set([...taken, ...reserved].map(optionSlug));
  const base = optionSlug(label).slice(0, 34) || "option";
  let id = base;
  for (let n = 2; used.has(id); n += 1) id = `${base}-${n}`;
  return id;
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
