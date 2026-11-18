// Multi-Pet and You & Your Pet: photo slots, checkout payload and the server-side checks both handoffs require.
// Shared by the shop (which boxes to show) and the server (what an order must contain). No I/O here.

import {
  BUNDLE_TIERS,
  EXTRA_IDS,
  bundleIncludedExtras,
  bundleInclusionLabel,
  bundleInclusions,
  deskLayout,
  fill,
  greetingOffered,
  sizeHiddenForPets,
  visibleBundleTiers,
  visibleDeskColours,
  type BundleTier,
  type DeskPets,
  type EverydayContent,
  type ExtraId,
  type FlowContent,
  type NewProduct,
  type PetTypeId,
} from "@/lib/everyday-content";
import {
  bundleTierAmount,
  deskExtraPetAmount,
  deskUnitPrice,
  displaySizeLabel,
  getPortraitBreakdown,
  greetingCardAmount,
  type PriceCatalog,
  type PricingInput,
  type Quote,
} from "@/lib/pricing";
import { storedPetPhotoUrl } from "@/lib/pet-photo";

/** Most copies one order can hold; the order record keeps the same cap. */
const MAX_COPIES = 99;

/** Add-on words a Multi-Pet / You & Your Pet order may carry. Anything else is refused, never charged. */
const FLOW_ADDON_TOKENS = new Set(["none", "priority_preview", "custom_mug", "fridge_magnet", "digital_download", "desk_portrait", "halo_tribute"]);

function extraSelected(input: PricingInput, id: ExtraId) {
  if (id === "mug") return Boolean(input.addMug);
  if (id === "magnet") return Boolean(input.addMagnet);
  if (id === "digital") return Boolean(input.addDigitalDownload);
  return Boolean(input.addDesk);
}

/** A frame the shop offers; anything else falls back to the default (or first) visible frame. */
function visibleFrame(content: EverydayContent, frame: string) {
  const frames = content.frames.filter((item) => item.visible);
  return (
    frames.find((item) => item.id === frame)?.id ||
    frames.find((item) => item.id === content.step2.defaultFrame)?.id ||
    frames[0]?.id ||
    frame ||
    null
  );
}

export type FlowProduct = "multi_pet" | "you_and_your_pet";
export type PhotoMethod = "group" | "separate" | "mixed";
export type Composition = "solo" | "family";

export const PHOTO_METHODS: PhotoMethod[] = ["group", "separate", "mixed"];

/** Multi-Pet starts at two pets (included in the base price). */
export const MULTI_PET_COUNTS = ["two", "three", "four"] as const;

const PET_NUMBERS: Record<string, number> = { two: 2, three: 3, four: 4 };

/** Order data values (You & Your Pet handoff §8; Multi-Pet uses the same structured record). */
export const PRODUCT_TYPE_VALUES: Record<FlowProduct, string> = {
  multi_pet: "multi_pet_portrait",
  you_and_your_pet: "you_and_your_pet",
};

export const PHOTO_METHOD_VALUES: Record<PhotoMethod, string> = {
  group: "complete_photo",
  separate: "separate_photos",
  mixed: "mixed_photos",
};

export const COMPOSITION_VALUES: Record<Composition, string> = {
  solo: "me_and_my_pet",
  family: "family_and_our_pet",
};

export function isFlowProduct(value: unknown): value is FlowProduct {
  return value === "multi_pet" || value === "you_and_your_pet";
}

export function isPhotoMethod(value: unknown): value is PhotoMethod {
  return PHOTO_METHODS.includes(value as PhotoMethod);
}

export function petCountNumber(pets: string | undefined) {
  return PET_NUMBERS[pets || ""] ?? 0;
}

export function methodEnabled(flow: FlowContent, method: PhotoMethod) {
  if (method === "group") return flow.groupEnabled;
  if (method === "separate") return flow.separateEnabled;
  return flow.mixedEnabled;
}

/** Only methods production can fulfil are switched on in the admin; the rest stay hidden. */
export function enabledMethods(flow: FlowContent): PhotoMethod[] {
  return PHOTO_METHODS.filter((method) => methodEnabled(flow, method));
}

export function methodCopy(flow: FlowContent, method: PhotoMethod) {
  if (method === "group") return { title: flow.groupTitle, description: flow.groupDescription };
  if (method === "separate") return { title: flow.separateTitle, description: flow.separateDescription };
  return { title: flow.mixedTitle, description: flow.mixedDescription };
}

export type SlotSpec = {
  key: string;
  role: "group" | "subject" | "reference";
  label: string;
  required: boolean;
  subject?: "pet" | "person";
  /** 1-based pet number the photo shows. */
  pet?: number;
  /** 1-based person number (You & Your Pet family photos). */
  person?: number;
};

export type FlowShape = {
  product: FlowProduct;
  method: PhotoMethod;
  composition: Composition;
  /** Number of pets (Multi-Pet). You & Your Pet always has one pet. */
  petCount: number;
};

/** Upload boxes for the chosen method, required ones first. Reference photos are listed by referenceKeys. */
export function slotSpecs(flow: FlowContent, shape: FlowShape): SlotSpec[] {
  const group: SlotSpec = { key: "group", role: "group", label: flow.groupUploadLabel, required: true };
  if (shape.method !== "separate") return [group];

  if (shape.product === "multi_pet") {
    return Array.from({ length: Math.max(shape.petCount, 0) }, (_, i) => ({
      key: `pet-${i + 1}`,
      role: "subject" as const,
      subject: "pet" as const,
      pet: i + 1,
      label: fill(flow.petSlotLabel, { n: i + 1 }),
      required: true,
    }));
  }

  if (shape.composition === "solo") {
    return [
      { key: "you", role: "subject", subject: "person", person: 1, label: flow.youSlotLabel, required: true },
      { key: "your-pet", role: "subject", subject: "pet", pet: 1, label: flow.yourPetSlotLabel, required: true },
    ];
  }

  // Family: the pet and at least one person are required; more people are optional and never change the price.
  const people = Math.max(1, flow.familyMaxPeople);
  return [
    { key: "family-pet", role: "subject", subject: "pet", pet: 1, label: flow.familyPetSlotLabel, required: true },
    ...Array.from({ length: people }, (_, i) => ({
      key: `person-${i + 1}`,
      role: "subject" as const,
      subject: "person" as const,
      person: i + 1,
      label: fill(flow.personSlotLabel, { n: i + 1 }),
      required: i === 0,
    })),
  ];
}

/** Optional reference photos: Mixed Photos only. They never add a pet or change the price. */
export function referenceKeys(flow: FlowContent, method: PhotoMethod): string[] {
  if (method !== "mixed") return [];
  return Array.from({ length: Math.max(0, flow.referencesMax) }, (_, i) => `ref-${i + 1}`);
}

/** Multi-Pet references must say which pet they show (handoff §5). */
export function referenceNeedsPet(product: FlowProduct) {
  return product === "multi_pet";
}

/** The group photo needs the "every pet is visible" confirmation (Multi-Pet, when the admin keeps the text). */
export function needsGroupConfirm(flow: FlowContent, shape: Pick<FlowShape, "product" | "method">) {
  return shape.product === "multi_pet" && shape.method !== "separate" && Boolean(flow.confirmGroupLabel.trim());
}

// ---------------------------------------------------------------------------
// Checkout payload (browser → server) and server validation
// ---------------------------------------------------------------------------

export type FlowPhotoInput = { key: string; url: string; pet?: number };

/** Fields the Multi-Pet and You & Your Pet configurators add to the checkout body. */
export type FlowPayload = {
  configurator: FlowProduct;
  composition?: Composition;
  tribute?: boolean;
  /** 1-based pet number that gets the halo. */
  haloPet?: number;
  photoMethod?: PhotoMethod;
  photos?: FlowPhotoInput[];
  namesEnabled?: boolean;
  names?: string[];
  artistNote?: string;
  confirmGroup?: boolean;
};

/**
 * Price-relevant rules, checked before any quote: the server never trusts the browser on
 * pet count, composition, halo, Priority Preview, Limited Edition or size eligibility.
 */
export function configuratorPricingProblem(
  input: PricingInput,
  product: FlowProduct,
  content: EverydayContent
): string | null {
  const flow = content.flow;
  if (!flow) return "This portrait is not available right now.";
  const pets = input.numPets || "";

  if (product === "multi_pet") {
    if (!(MULTI_PET_COUNTS as readonly string[]).includes(pets)) return "Please choose how many pets to include.";
  } else {
    if (pets !== "human") return "This portrait option is not available.";
    if (input.composition !== "solo" && input.composition !== "family") {
      return "Please choose Me & My Pet or My Family & Our Pet.";
    }
  }

  if (!input.size) return "Please choose a size.";
  // Whole copies only: the same quantity the order record keeps.
  const copies = Number(input.cartQty ?? 1);
  if (!Number.isInteger(copies) || copies < 1 || copies > MAX_COPIES) return `Please choose a quantity between 1 and ${MAX_COPIES}.`;
  // Add-ons and gift wrap switched off for this product are not on sale (the backend is authoritative, handoff p3/p12).
  for (const id of EXTRA_IDS) {
    if (extraSelected(input, id) && !content.extras[id].visible) return `${content.extras[id].label} is not available for this portrait.`;
  }
  if (input.giftWrap && !content.cart.showGift) return "Gift wrapping is not available for this portrait.";
  if (input.tribute && (product !== "multi_pet" || !flow.showTribute)) return "The halo option is not available.";
  if (input.priorityPreview && !content.step2.showPriority) return "Priority Preview is not available for this portrait.";

  const addons = (input.addon || "none").split(",").map((token) => token.trim());
  if (addons.some((token) => token && !FLOW_ADDON_TOKENS.has(token))) return "That add-on is not available for this portrait.";

  const background = content.backgrounds.find((bg) => bg.id === input.background);
  if (!background || !background.visible) return "That background is not available.";
  if (background.limited && !flow.showLimited) return "Limited Edition backgrounds are not available for this portrait yet.";

  // Sizes the admin keeps off sale for this many pets (Multi-Pet) or this composition (You & Your Pet).
  const style = input.portraitStyle === "canvas" ? "canvas" : "framed";
  const rule = product === "multi_pet" ? pets : input.composition || "solo";
  if (sizeHiddenForPets(content, rule, style, input.size)) {
    return product === "multi_pet"
      ? `Size ${displaySizeLabel(input.size)} is not available for ${petCountNumber(pets)} pets.`
      : `Size ${displaySizeLabel(input.size)} is not available for this portrait.`;
  }
  return null;
}

type Body = Record<string, unknown>;

function text(value: unknown, max: number) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export type OrderPhotoAsset = {
  key: string;
  role: "group" | "subject" | "reference";
  label: string;
  url: string;
  subject?: "pet" | "person";
  pet_id?: number;
  person_id?: number;
};

export type OrderDetails = {
  product_type: string;
  configurator: FlowProduct;
  composition?: string;
  composition_upgrade?: number;
  pet_count: number;
  pets: { id: number; name: string | null }[];
  names_enabled: boolean;
  names: string[];
  subtitle_enabled: boolean;
  subtitle: string | null;
  portrait_style: string;
  frame_colour: string | null;
  size: string;
  background: string;
  background_label: string;
  limited_edition_background: boolean;
  halo_enabled: boolean;
  halo_pet_id: number | null;
  /** How the customer describes the halo pet, so it can be found in a group photo. */
  halo_pet_note: string | null;
  halo_price: number;
  quantity: number;
  priority_preview: boolean;
  photo_method: string;
  photo_method_label: string;
  group_photo_confirmed: boolean | null;
  photo_assets: OrderPhotoAsset[];
  artist_instructions: string | null;
};

export type BuiltOrderDetails =
  | { ok: true; details: OrderDetails; primaryPhotoUrl: string; photoUrls: string[]; namesText: string }
  | { ok: false; error: string };

/**
 * Turns the browser's configurator fields into the structured order record and rejects anything the
 * chosen method, composition or pet count needs but is missing. Extra reference photos never count as pets.
 */
export function buildOrderDetails(
  body: Body,
  product: FlowProduct,
  content: EverydayContent,
  catalog: Pick<PriceCatalog, "familyUpgrade" | "multiPetHalo" | "limitedBackgrounds">,
  supabaseHost = ""
): BuiltOrderDetails {
  const flow = content.flow;
  if (!flow) return { ok: false, error: "This portrait is not available right now." };

  // Handoff p9: Indian mobile numbers. Spaces, dashes and a leading 0, 91 or +91 are fine.
  const phone = String(body.customerPhone ?? "").replace(/[\s-]/g, "");
  if (phone && !/^(?:\+?91|0)?[6-9]\d{9}$/.test(phone)) {
    return { ok: false, error: content.step3.phoneError || "Please enter a valid Indian mobile number." };
  }
  const method = body.photoMethod;
  if (!isPhotoMethod(method) || !methodEnabled(flow, method)) {
    return { ok: false, error: "Please choose how you'd like to upload your photos." };
  }

  const composition: Composition = body.composition === "family" ? "family" : "solo";
  const petCount = product === "multi_pet" ? petCountNumber(String(body.numPets || "")) : 1;
  if (product === "multi_pet" && petCount < 2) return { ok: false, error: "Please choose how many pets to include." };
  const shape: FlowShape = { product, method, composition, petCount };

  const sent = new Map<string, FlowPhotoInput>();
  if (Array.isArray(body.photos)) {
    for (const entry of body.photos.slice(0, 40)) {
      if (!entry || typeof entry !== "object") continue;
      const record = entry as Record<string, unknown>;
      const key = String(record.key || "");
      if (!key || sent.has(key)) continue;
      const pet = Number(record.pet);
      sent.set(key, { key, url: String(record.url || ""), pet: Number.isInteger(pet) ? pet : undefined });
    }
  }

  const assets: OrderPhotoAsset[] = [];
  for (const spec of slotSpecs(flow, shape)) {
    const url = storedPetPhotoUrl(sent.get(spec.key)?.url, supabaseHost);
    if (!url) {
      if (spec.required) return { ok: false, error: fill(flow.slotError, { slot: spec.label }) };
      continue;
    }
    assets.push({
      key: spec.key,
      role: spec.role,
      label: spec.label,
      url,
      ...(spec.subject ? { subject: spec.subject } : {}),
      ...(spec.pet ? { pet_id: spec.pet } : {}),
      ...(spec.person ? { person_id: spec.person } : {}),
    });
  }

  for (const key of referenceKeys(flow, method)) {
    const entry = sent.get(key);
    if (!entry) continue;
    const url = storedPetPhotoUrl(entry.url, supabaseHost);
    if (!url) return { ok: false, error: "A reference photo was not saved. Please upload it again." };
    const pet = entry.pet && entry.pet >= 1 && entry.pet <= petCount ? entry.pet : undefined;
    if (referenceNeedsPet(product) && !pet) {
      return { ok: false, error: "Please choose which pet each reference photo shows." };
    }
    const index = Number(key.slice(4));
    assets.push({
      key,
      role: "reference",
      label: pet && product === "multi_pet" ? `Reference ${index} · ${fill(flow.petSlotLabel, { n: pet })}` : `Reference ${index}`,
      url,
      ...(pet ? { pet_id: pet } : {}),
    });
  }

  const confirmNeeded = needsGroupConfirm(flow, shape);
  if (confirmNeeded && body.confirmGroup !== true) return { ok: false, error: flow.confirmGroupError || "Please confirm your group photo." };

  const namesEnabled = body.namesEnabled === true;
  const rawNames = Array.isArray(body.names) ? body.names : [];
  let names: string[] = [];
  if (namesEnabled) {
    if (product === "multi_pet") {
      names = Array.from({ length: petCount }, (_, i) => text(rawNames[i], content.step2.petNameMax));
    } else if (composition === "solo") {
      names = [text(rawNames[0], content.step2.petNameMax), text(rawNames[1], content.step2.petNameMax)];
    } else {
      names = [text(rawNames[0], flow.familyNamesMax)];
    }
  }

  const subtitle = text(body.memorialText, content.step2.subtitleMax);
  const tribute = product === "multi_pet" && body.tribute === true && flow.showTribute;
  const haloPet = Number(body.haloPet);
  if (tribute && !(Number.isInteger(haloPet) && haloPet >= 1 && haloPet <= petCount)) {
    return { ok: false, error: flow.tributeError || "Choose the pet who should have the halo." };
  }
  // Unless that pet has a name on the order, the customer says which one it is (it must be findable in a group photo).
  const haloNote = tribute ? text(body.haloNote, 80) : "";
  // A name alone does not identify the pet in a group photo, so the description is needed unless the admin removed it.
  if (tribute && !haloNote && method !== "separate" && Boolean(flow.tributeNoteLabel.trim())) {
    return { ok: false, error: flow.tributeNoteError || "Please tell us which pet should have the halo." };
  }

  const style = body.portraitStyle === "canvas" ? "canvas" : "framed";
  const background = String(body.background || "");
  const backgroundEntry = content.backgrounds.find((bg) => bg.id === background);
  const primary = assets.find((asset) => asset.role === "group") || assets.find((asset) => asset.role === "subject");
  if (!primary) return { ok: false, error: content.step3.photoError };

  const filledNames = names.filter(Boolean);
  const namesText =
    product === "you_and_your_pet" && composition === "solo" ? filledNames.join(" & ") : filledNames.join(", ");

  const details: OrderDetails = {
    product_type: PRODUCT_TYPE_VALUES[product],
    configurator: product,
    ...(product === "you_and_your_pet"
      ? {
          composition: COMPOSITION_VALUES[composition],
          composition_upgrade: composition === "family" ? Math.max(0, catalog.familyUpgrade || 0) : 0,
        }
      : {}),
    pet_count: petCount,
    pets:
      product === "multi_pet"
        ? Array.from({ length: petCount }, (_, i) => ({ id: i + 1, name: names[i] || null }))
        : [{ id: 1, name: composition === "solo" ? names[1] || null : null }],
    names_enabled: namesEnabled,
    names,
    subtitle_enabled: Boolean(subtitle),
    subtitle: subtitle || null,
    portrait_style: style,
    frame_colour: style === "framed" ? visibleFrame(content, text(body.frameStyle, 40)) : null,
    size: text(body.size, 40),
    background,
    background_label: backgroundEntry?.label || text(body.backgroundLabel, 60) || background,
    limited_edition_background: catalog.limitedBackgrounds.includes(background),
    halo_enabled: tribute,
    halo_pet_id: tribute ? haloPet : null,
    halo_pet_note: haloNote || null,
    halo_price: tribute ? Math.max(0, catalog.multiPetHalo || 0) : 0,
    quantity: Math.max(1, Math.min(99, Math.round(Number(body.cartQty) || 1))),
    priority_preview: body.priorityPreview === true,
    photo_method: PHOTO_METHOD_VALUES[method],
    photo_method_label: methodCopy(flow, method).title,
    group_photo_confirmed: confirmNeeded ? true : null,
    photo_assets: assets,
    artist_instructions: text(body.artistNote, flow.instructionsMax) || null,
  };

  return {
    ok: true,
    details,
    primaryPhotoUrl: primary.url,
    photoUrls: assets.map((asset) => asset.url),
    namesText,
  };
}

// ---------------------------------------------------------------------------
// Desk Portrait (mini_desk) and Signature Gift Bundle (gift_bundle). Not FlowProducts: their own payload,
// rules and order record. Prices come from Admin Pricing; copy and switches from their configurator content.
// ---------------------------------------------------------------------------

/** Fields the Desk Portrait / Gift Bundle configurators add to the checkout body. */
export type NewProductPayload = {
  configurator: NewProduct;
  /** Keys "pet-1".."pet-N" (desk N = pet count; bundle exactly "pet-1"). */
  photos: { key: string; url: string }[];
  /** Desk: REQUIRED pet name(s) text; bundle: pet name when its toggle is on, else "". */
  names: string;
  /** Desk: always true; bundle: the toggle. */
  namesEnabled: boolean;
  subtitleEnabled: boolean;
  subtitle: string;
  /** Desk colour id (same as background). */
  colour?: string;
  bundleTier?: BundleTier;
  greetingCard?: boolean;
  greetingMessage?: string;
  petType?: PetTypeId | "";
  petBreed?: string;
  petAge?: string;
};

export type DeskOrderDetails = {
  version: 1;
  product_type: "mini_desk";
  quantity: number;
  pet_count: DeskPets;
  layout_orientation: "vertical" | "horizontal";
  background_colour: { id: string; label: string; hex: string };
  pet_names: string;
  subtitle_enabled: boolean;
  subtitle: string;
  wooden_stand: "included";
  production_size: string;
  pet_photo_references: { key: string; pet: number; url: string }[];
  pricing: { base_product_price: number; extra_pet_charge: number; unit_price: number; final_total: number };
};

export type BundleOrderDetails = {
  version: 1;
  product_type: "gift_bundle";
  quantity: number;
  bundle_tier: BundleTier;
  bundle_label: string;
  portrait_style: "framed" | "canvas";
  size: string;
  frame: string;
  background: { id: string; label: string };
  pet_name_enabled: boolean;
  pet_name: string;
  subtitle_enabled: boolean;
  subtitle: string;
  included_items: { id: string; label: string }[];
  greeting_card: { selected: boolean; message: string; price_snapshot: number };
  photo: { key: "pet-1"; url: string };
  pet_details: { pet_type: PetTypeId | ""; breed: string; age: string };
  pricing: {
    base_bundle_price: number;
    portrait_price: number;
    greeting_card_price: number;
    unit_price: number;
    final_total: number;
  };
};

/** Every structured order record a staff view can meet. */
export type AnyOrderDetails = OrderDetails | DeskOrderDetails | BundleOrderDetails;

export function isDeskOrderDetails(details: AnyOrderDetails | null | undefined): details is DeskOrderDetails {
  return Boolean(details) && (details as { product_type?: unknown }).product_type === "mini_desk";
}

export function isBundleOrderDetails(details: AnyOrderDetails | null | undefined): details is BundleOrderDetails {
  return Boolean(details) && (details as { product_type?: unknown }).product_type === "gift_bundle";
}

/** Multi-Pet / You & Your Pet record (has `configurator` + `photo_assets`). */
export function isFlowOrderDetails(details: AnyOrderDetails | null | undefined): details is OrderDetails {
  return Boolean(details) && isFlowProduct((details as { configurator?: unknown }).configurator);
}

/** "one" | "two" | "three" → 1 | 2 | 3. Anything else is null. */
export function deskPetCount(numPets: string | undefined): DeskPets | null {
  if (numPets === "one") return 1;
  if (numPets === "two") return 2;
  if (numPets === "three") return 3;
  return null;
}

/** Photo slot keys the order needs: desk "pet-1".."pet-N", bundle "pet-1". */
export function newProductSlotKeys(product: NewProduct, input: { numPets?: string }): string[] {
  if (product === "gift_bundle") return ["pet-1"];
  const count = deskPetCount(input.numPets) ?? 0;
  return Array.from({ length: count }, (_, i) => `pet-${i + 1}`);
}

const PET_TYPE_IDS: PetTypeId[] = ["dog", "cat", "other"];
const BREED_MAX = 40;

function tierLabel(content: EverydayContent, tier: BundleTier) {
  const bundle = content.bundle;
  const title = tier === "essential" ? bundle?.essentialTitle : bundle?.signatureTitle;
  return title || (tier === "essential" ? "Essential Gift Bundle" : "Signature Gift Bundle");
}

/**
 * Price-relevant rules for the new products, checked before any quote and again when the order is recorded.
 * The server never trusts the browser on pet count, colour, tier, size, greeting card or add-ons.
 * A product priced below ₹1 is not on sale.
 */
export function newProductPricingProblem(
  input: PricingInput & Partial<NewProductPayload>,
  product: NewProduct,
  content: EverydayContent,
  catalog: PriceCatalog
): string | null {
  const copies = Number(input.cartQty ?? 1);
  if (!Number.isInteger(copies) || copies < 1 || copies > MAX_COPIES) return `Please choose a quantity between 1 and ${MAX_COPIES}.`;
  if (input.tribute || input.composition) return "This portrait option is not available.";
  const size = typeof input.size === "string" ? input.size : "";
  const background = typeof input.background === "string" ? input.background : "";

  if (product === "mini_desk") {
    const desk = content.desk;
    if (!desk) return "This portrait is not available right now.";
    if (input.bundleTier || input.greetingCard) return "This portrait option is not available.";
    const pets = deskPetCount(input.numPets);
    if (!pets) return "Please choose how many pets to include.";
    if ((pets === 2 && !desk.showTwoPets) || (pets === 3 && !desk.showThreePets)) return "That pet option is not available.";
    if (deskUnitPrice(catalog, "one") < 1) return "This portrait is not available right now.";
    if (input.giftWrap && !content.cart.showGift) return "Gift wrapping is not available for this portrait.";
    if (input.priorityPreview && !content.step2.showPriority) return "Priority Preview is not available for this portrait.";
    if (input.colour != null && String(input.colour) !== background) return "That background colour is not available.";
    if (!background || !visibleDeskColours(content).some((item) => item.id === background)) {
      return "That background colour is not available.";
    }
  } else {
    const bundle = content.bundle;
    if (!bundle) return "This gift bundle is not available right now.";
    if ((input.numPets || "one") !== "one") return "This gift bundle is for one pet.";
    const tier = input.bundleTier;
    if (!tier || !BUNDLE_TIERS.includes(tier) || !visibleBundleTiers(content).includes(tier)) {
      return bundle.tierError || "Please choose a bundle to continue.";
    }
    if (bundleTierAmount(catalog, tier) < 1) return "This bundle is not available right now.";
    // Included items are never sold again as paid extras (nothing is charged twice).
    for (const id of bundleIncludedExtras(tier)) {
      if (extraSelected(input, id)) return `${content.extras[id].label} is already included in your bundle.`;
    }
    // Packaging is included and the bundle price has no gift wrap, priority or Limited Edition charge.
    if (input.giftWrap) return "Gift packaging is already included in your bundle.";
    if (input.priorityPreview) return "Priority Preview is not available for this gift bundle.";
    if (input.greetingCard && (!greetingOffered(content, tier) || greetingCardAmount(catalog, { configurator: "gift_bundle", greetingCard: true }) < 1)) {
      return "The greeting card is not available for this bundle.";
    }
    if (!size) return "Please choose a size.";
    const entry = content.backgrounds.find((bg) => bg.id === background);
    if (!entry || !entry.visible || entry.limited) return "That background is not available.";
    const style = input.portraitStyle === "canvas" ? "canvas" : "framed";
    if (sizeHiddenForPets(content, tier, style, size)) return `Size ${displaySizeLabel(size)} is not available for this bundle.`;
  }

  // Add-ons switched off for this product are not on sale (the backend is authoritative).
  for (const id of EXTRA_IDS) {
    if (extraSelected(input, id) && !content.extras[id].visible) return `${content.extras[id].label} is not available for this portrait.`;
  }
  return null;
}

/**
 * orders.addon for the new products, derived on the server (the browser's `addon` text is ignored).
 * Desk: wooden_stand + the paid extras the customer added. Bundle: tier, each inclusion, greeting_card, paid extras.
 * Only call after newProductPricingProblem accepted the same body (quote time), so every flag here was priced.
 */
export function newProductAddonTokens(product: NewProduct, body: Record<string, unknown>): string[] {
  const tokens: string[] = [];
  if (product === "mini_desk") {
    tokens.push("wooden_stand");
  } else {
    const tier: BundleTier = body.bundleTier === "signature" ? "signature" : "essential";
    tokens.push(`bundle_${tier}`);
    for (const item of bundleInclusions(tier)) {
      if (item === "mug") tokens.push("bundle_mug");
      else if (item === "digital") tokens.push("bundle_digital");
      else if (item === "magnet") tokens.push("bundle_magnet");
      else if (item === "standard_packaging") tokens.push("packaging_standard");
      else if (item === "premium_packaging") tokens.push("packaging_premium");
    }
    if (body.greetingCard === true) tokens.push("greeting_card");
  }
  if (product === "mini_desk" && body.priorityPreview === true) tokens.push("priority_preview");
  if (body.addMug === true) tokens.push("custom_mug");
  if (body.addMagnet === true) tokens.push("fridge_magnet");
  if (body.addDigitalDownload === true) tokens.push("digital_download");
  if (body.addDesk === true) tokens.push("desk_portrait");
  return tokens;
}

/** orders row columns the record writes for a new product (all from server-checked values). */
export type NewProductColumns = {
  size: string;
  frame_style: string;
  portrait_style: string;
  num_pets: string;
  background: string;
  background_label: string;
  pet_name: string;
  memorial_text: string;
  photo_url: string;
  addon: string[];
  gift_wrap: boolean;
};

export type BuiltNewProductDetails =
  | {
      ok: true;
      details: DeskOrderDetails | BundleOrderDetails;
      columns: NewProductColumns;
      primaryPhotoUrl: string;
      photoUrls: string[];
    }
  | { ok: false; error: string };

/** Multi-line text (greeting card): keeps line breaks, trims, collapses runs of blank lines. */
function multiline(value: unknown) {
  return String(value ?? "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[^\S\n]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Single-line text, NOT truncated, so the caller can refuse an over-long value. */
function line(value: unknown) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Builds the structured order record for a Desk Portrait / Gift Bundle and refuses anything missing or invalid.
 * Re-runs newProductPricingProblem on the body, requires a stored photo for every slot key, names (desk),
 * subtitle / greeting / pet details limits. Prices are snapshot from `catalog`; when `quote` is given the
 * recomputed amount must equal quote.originalAmount (so the snapshot is exactly what was charged) and
 * final_total = quote.afterCouponAmount (orders.total_price: after coupon, before the prepaid discount).
 */
export function buildNewProductDetails(
  body: Body,
  product: NewProduct,
  content: EverydayContent,
  catalog: PriceCatalog,
  quote?: Pick<Quote, "originalAmount" | "afterCouponAmount"> | null,
  supabaseHost = ""
): BuiltNewProductDetails {
  const input = { ...(body as PricingInput & Partial<NewProductPayload>), configurator: product };
  const problem = newProductPricingProblem(input, product, content, catalog);
  if (problem) return { ok: false, error: problem };

  // Indian mobile numbers. Spaces, dashes, brackets and a leading 0, 91 or +91 are fine.
  const phone = String(body.customerPhone ?? "").replace(/[\s()-]/g, "");
  if (phone && !/^(?:\+?91|0)?[6-9]\d{9}$/.test(phone)) {
    return { ok: false, error: content.step3.phoneError || "Please enter a valid Indian mobile number." };
  }

  const qty = Math.max(1, Math.min(MAX_COPIES, Math.round(Number(body.cartQty) || 1)));
  const breakdown = getPortraitBreakdown({ ...input, cartQty: qty }, catalog);
  const originalAmount = breakdown.portraitSubtotal + breakdown.extrasAmount;
  if (quote && quote.originalAmount !== originalAmount) {
    return { ok: false, error: "Prices were just updated. Please review your cart and try again." };
  }
  const finalTotal = quote ? quote.afterCouponAmount : originalAmount;

  // Photos: one stored upload per slot ("pet-1".."pet-N").
  const sent = new Map<string, string>();
  if (Array.isArray(body.photos)) {
    for (const entry of body.photos.slice(0, 20)) {
      if (!entry || typeof entry !== "object") continue;
      const record = entry as Record<string, unknown>;
      const key = String(record.key || "");
      if (!key || sent.has(key)) continue;
      sent.set(key, String(record.url || ""));
    }
  }
  const numPets = product === "mini_desk" ? String(body.numPets || "") : "one";
  const keys = newProductSlotKeys(product, { numPets });
  const photos: { key: string; pet: number; url: string }[] = [];
  for (const [index, key] of keys.entries()) {
    const url = storedPetPhotoUrl(sent.get(key), supabaseHost);
    if (!url) {
      const desk = content.desk;
      if (product === "mini_desk" && desk?.slotError) {
        const slot = fill(desk.slotLabel || "Pet {n}", { n: index + 1 });
        return { ok: false, error: fill(desk.slotError, { slot }) };
      }
      return { ok: false, error: content.step3.photoError || "Please upload your pet's photo to continue." };
    }
    photos.push({ key, pet: index + 1, url });
  }
  const primary = photos[0];
  if (!primary) return { ok: false, error: content.step3.photoError || "Please upload your pet's photo to continue." };

  const rawNames = typeof body.names === "string" ? body.names : String(body.petName ?? "");
  const rawSubtitle = body.subtitle != null ? body.subtitle : body.memorialText;
  const extrasTokens = newProductAddonTokens(product, body);

  if (product === "mini_desk") {
    const desk = content.desk;
    if (!desk) return { ok: false, error: "This portrait is not available right now." };
    const pets = deskPetCount(numPets);
    if (!pets) return { ok: false, error: "Please choose how many pets to include." };
    const names = line(rawNames);
    if (!names) return { ok: false, error: desk.namesError || "Please enter your pet's name to continue." };
    if (names.length > desk.namesMax) return { ok: false, error: `Pet name(s) can be up to ${desk.namesMax} characters.` };
    const subtitleText = body.subtitleEnabled === true ? line(rawSubtitle) : "";
    if (subtitleText.length > desk.subtitleMax) return { ok: false, error: `The subtitle can be up to ${desk.subtitleMax} characters.` };
    const colourId = String(body.background ?? "");
    const colour = visibleDeskColours(content).find((item) => item.id === colourId);
    if (!colour) return { ok: false, error: "That background colour is not available." };
    const productionSize = line(desk.productionSize).slice(0, 80) || "Desk Portrait (fixed size)";

    const details: DeskOrderDetails = {
      version: 1,
      product_type: "mini_desk",
      quantity: qty,
      pet_count: pets,
      layout_orientation: deskLayout(pets),
      background_colour: { id: colour.id, label: colour.label, hex: colour.color },
      pet_names: names,
      subtitle_enabled: Boolean(subtitleText),
      subtitle: subtitleText,
      wooden_stand: "included",
      production_size: productionSize,
      pet_photo_references: photos,
      pricing: {
        base_product_price: deskUnitPrice(catalog, "one"),
        extra_pet_charge: deskExtraPetAmount(catalog, numPets),
        unit_price: deskUnitPrice(catalog, numPets),
        final_total: finalTotal,
      },
    };
    return {
      ok: true,
      details,
      primaryPhotoUrl: primary.url,
      photoUrls: photos.map((photo) => photo.url),
      columns: {
        size: productionSize,
        frame_style: "desk_stand",
        portrait_style: "desk",
        num_pets: numPets,
        background: colour.id,
        background_label: colour.label,
        pet_name: names,
        memorial_text: subtitleText,
        photo_url: primary.url,
        addon: extrasTokens,
        gift_wrap: body.giftWrap === true,
      },
    };
  }

  const bundle = content.bundle;
  if (!bundle) return { ok: false, error: "This gift bundle is not available right now." };
  const tier: BundleTier = input.bundleTier === "signature" ? "signature" : "essential";
  const style = body.portraitStyle === "canvas" ? "canvas" : "framed";
  const size = line(body.size).slice(0, 40);

  const namesEnabled = body.namesEnabled === true;
  const petName = namesEnabled ? line(rawNames) : "";
  if (petName.length > content.step2.petNameMax) {
    return { ok: false, error: `Your pet's name can be up to ${content.step2.petNameMax} characters.` };
  }
  const subtitleText = body.subtitleEnabled === true ? line(rawSubtitle) : "";
  if (subtitleText.length > content.step2.subtitleMax) {
    return { ok: false, error: `The subtitle can be up to ${content.step2.subtitleMax} characters.` };
  }

  const greetingSelected = body.greetingCard === true;
  const greetingMessage = greetingSelected ? multiline(body.greetingMessage) : "";
  if (greetingSelected && !greetingMessage) {
    return { ok: false, error: bundle.greetingError || "Please write the message for your greeting card." };
  }
  if (greetingMessage.length > bundle.greetingMax) {
    return { ok: false, error: `The greeting card message can be up to ${bundle.greetingMax} characters.` };
  }

  // Pet details are optional; when the admin hides them anything sent is dropped.
  const rawType = String(body.petType ?? "");
  if (rawType && !PET_TYPE_IDS.includes(rawType as PetTypeId)) return { ok: false, error: "Please choose a valid pet type." };
  const breed = line(body.petBreed);
  if (breed.length > BREED_MAX) return { ok: false, error: `The breed can be up to ${BREED_MAX} characters.` };
  const age = line(body.petAge);
  const ages = content.bundleAges || [];
  if (age && !ages.includes(age)) return { ok: false, error: "Please choose your pet's age from the list." };
  const showDetails = bundle.showPetDetails !== false;

  const backgroundId = String(body.background ?? "");
  const background = content.backgrounds.find((bg) => bg.id === backgroundId);
  if (!background) return { ok: false, error: "That background is not available." };
  const frame = style === "framed" ? visibleFrame(content, line(body.frameStyle).slice(0, 40)) || "black" : "canva";

  const tierPrice = bundleTierAmount(catalog, tier);
  const portraitPrice = Math.round(breakdown.sizePrice / qty);
  const greetingPrice = greetingCardAmount(catalog, { configurator: "gift_bundle", greetingCard: greetingSelected });
  const label = tierLabel(content, tier);

  const details: BundleOrderDetails = {
    version: 1,
    product_type: "gift_bundle",
    quantity: qty,
    bundle_tier: tier,
    bundle_label: label,
    portrait_style: style,
    size,
    frame,
    background: { id: background.id, label: background.label || background.id },
    pet_name_enabled: Boolean(petName),
    pet_name: petName,
    subtitle_enabled: Boolean(subtitleText),
    subtitle: subtitleText,
    included_items: bundleInclusions(tier).map((id) => ({ id, label: bundleInclusionLabel(content, id) })),
    greeting_card: {
      selected: greetingSelected,
      message: greetingMessage,
      price_snapshot: greetingSelected
        ? greetingCardAmount(catalog, { configurator: "gift_bundle", greetingCard: true })
        : 0,
    },
    photo: { key: "pet-1", url: primary.url },
    pet_details: {
      pet_type: showDetails ? ((rawType as PetTypeId) || "") : "",
      breed: showDetails ? breed : "",
      age: showDetails ? age : "",
    },
    pricing: {
      base_bundle_price: tierPrice,
      portrait_price: portraitPrice,
      greeting_card_price: greetingPrice,
      unit_price: tierPrice + portraitPrice + greetingPrice,
      final_total: finalTotal,
    },
  };
  return {
    ok: true,
    details,
    primaryPhotoUrl: primary.url,
    photoUrls: [primary.url],
    columns: {
      size,
      frame_style: frame,
      portrait_style: style,
      num_pets: "one",
      background: background.id,
      background_label: background.label || background.id,
      pet_name: petName || label,
      memorial_text: subtitleText,
      photo_url: primary.url,
      addon: extrasTokens,
      // Packaging is recorded through the addon tokens, never as paid gift wrap.
      gift_wrap: false,
    },
  };
}

function deskSummary(details: DeskOrderDetails) {
  const parts = [
    `Desk Portrait · ${details.pet_count} pet${details.pet_count > 1 ? "s" : ""} (${details.layout_orientation})`,
    `Colour: ${details.background_colour.label} (${details.background_colour.id})`,
    `Names: ${details.pet_names}`,
  ];
  if (details.subtitle) parts.push(`Subtitle: ${details.subtitle}`);
  parts.push("Wooden stand: included");
  if (details.quantity > 1) parts.push(`Quantity: ${details.quantity}`);
  parts.push(`Photos: ${details.pet_photo_references.map((photo) => `Pet ${photo.pet}: ${photo.url}`).join(" | ")}`);
  return parts.join(" · ");
}

function bundleSummary(details: BundleOrderDetails) {
  const parts = [
    `${details.bundle_label} · ${details.portrait_style} · ${details.size}`,
    `Included: ${details.included_items.map((item) => item.label).join(", ")}`,
    `Background: ${details.background.label}`,
  ];
  if (details.pet_name) parts.push(`Name: ${details.pet_name}`);
  if (details.subtitle) parts.push(`Subtitle: ${details.subtitle}`);
  if (details.greeting_card.selected) parts.push(`Greeting card: ${details.greeting_card.message}`);
  const pet = [details.pet_details.pet_type, details.pet_details.breed, details.pet_details.age].filter(Boolean).join(", ");
  if (pet) parts.push(`Pet: ${pet}`);
  if (details.quantity > 1) parts.push(`Quantity: ${details.quantity}`);
  parts.push(`Photo: ${details.photo.url}`);
  return parts.join(" · ");
}

/** One readable line for the order timeline (used until the order_details column exists). */
export function orderDetailsSummary(details: AnyOrderDetails) {
  if (isDeskOrderDetails(details)) return deskSummary(details);
  if (isBundleOrderDetails(details)) return bundleSummary(details);
  const parts: string[] = [];
  if (details.configurator === "multi_pet") {
    parts.push(`Multi-Pet Portrait · ${details.pet_count} pets`);
  } else {
    parts.push(`You & Your Pet · ${details.composition === COMPOSITION_VALUES.family ? "My Family & Our Pet" : "Me & My Pet"}`);
  }
  const names = details.names.filter(Boolean);
  if (names.length) parts.push(`Names: ${names.join(", ")}`);
  if (details.subtitle) parts.push(`Subtitle: ${details.subtitle}`);
  if (details.halo_enabled && details.halo_pet_id) {
    const name = details.pets.find((pet) => pet.id === details.halo_pet_id)?.name;
    const note = details.halo_pet_note;
    parts.push(`Halo: Pet ${details.halo_pet_id}${name ? ` (${name})` : ""}${note ? ` – ${note}` : ""}`);
  }
  if (details.quantity > 1) parts.push(`Quantity: ${details.quantity}`);
  parts.push(
    `Photos (${details.photo_method_label}): ${details.photo_assets.map((asset) => `${asset.label}: ${asset.url}`).join(" | ")}`
  );
  if (details.artist_instructions) parts.push(`Artist note: ${details.artist_instructions}`);
  return parts.join(" · ");
}

function num(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function str(value: unknown) {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

function obj(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function readDeskDetails(record: Record<string, unknown>): DeskOrderDetails {
  const pets = deskPetCount(["", "one", "two", "three"][num(record.pet_count)] || "") ?? 1;
  const colour = obj(record.background_colour);
  const pricing = obj(record.pricing);
  const photos = Array.isArray(record.pet_photo_references) ? record.pet_photo_references : [];
  return {
    version: 1,
    product_type: "mini_desk",
    quantity: Math.max(1, num(record.quantity)),
    pet_count: pets,
    layout_orientation: record.layout_orientation === "horizontal" ? "horizontal" : record.layout_orientation === "vertical" ? "vertical" : deskLayout(pets),
    background_colour: { id: str(colour.id), label: str(colour.label), hex: str(colour.hex) },
    pet_names: str(record.pet_names),
    subtitle_enabled: record.subtitle_enabled === true,
    subtitle: str(record.subtitle),
    wooden_stand: "included",
    production_size: str(record.production_size),
    pet_photo_references: photos
      .map(obj)
      .filter((photo) => typeof photo.url === "string")
      .map((photo, index) => ({ key: str(photo.key) || `pet-${index + 1}`, pet: num(photo.pet) || index + 1, url: str(photo.url) })),
    pricing: {
      base_product_price: num(pricing.base_product_price),
      extra_pet_charge: num(pricing.extra_pet_charge),
      unit_price: num(pricing.unit_price),
      final_total: num(pricing.final_total),
    },
  };
}

function readBundleDetails(record: Record<string, unknown>): BundleOrderDetails {
  const background = obj(record.background);
  const greeting = obj(record.greeting_card);
  const photo = obj(record.photo);
  const pet = obj(record.pet_details);
  const pricing = obj(record.pricing);
  const type = str(pet.pet_type);
  return {
    version: 1,
    product_type: "gift_bundle",
    quantity: Math.max(1, num(record.quantity)),
    bundle_tier: record.bundle_tier === "signature" ? "signature" : "essential",
    bundle_label: str(record.bundle_label),
    portrait_style: record.portrait_style === "canvas" ? "canvas" : "framed",
    size: str(record.size),
    frame: str(record.frame),
    background: { id: str(background.id), label: str(background.label) },
    pet_name_enabled: record.pet_name_enabled === true,
    pet_name: str(record.pet_name),
    subtitle_enabled: record.subtitle_enabled === true,
    subtitle: str(record.subtitle),
    included_items: (Array.isArray(record.included_items) ? record.included_items : [])
      .map(obj)
      .map((item) => ({ id: str(item.id), label: str(item.label) || str(item.id) }))
      .filter((item) => item.id),
    greeting_card: {
      selected: greeting.selected === true,
      message: str(greeting.message),
      price_snapshot: num(greeting.price_snapshot),
    },
    photo: { key: "pet-1", url: str(photo.url) },
    pet_details: {
      pet_type: PET_TYPE_IDS.includes(type as PetTypeId) ? (type as PetTypeId) : "",
      breed: str(pet.breed),
      age: str(pet.age),
    },
    pricing: {
      base_bundle_price: num(pricing.base_bundle_price),
      portrait_price: num(pricing.portrait_price),
      greeting_card_price: num(pricing.greeting_card_price),
      unit_price: num(pricing.unit_price),
      final_total: num(pricing.final_total),
    },
  };
}

/**
 * Reads a stored order_details value back (staff views). Anything malformed is ignored.
 * Desk Portrait / Gift Bundle records are recognised by `product_type`; use isDeskOrderDetails /
 * isBundleOrderDetails / isFlowOrderDetails to narrow.
 */
export function readOrderDetails(value: unknown): OrderDetails | DeskOrderDetails | BundleOrderDetails | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const productType = (value as { product_type?: unknown }).product_type;
  if (productType === "mini_desk") return readDeskDetails(value as Record<string, unknown>);
  if (productType === "gift_bundle") return readBundleDetails(value as Record<string, unknown>);
  return readFlowOrderDetails(value);
}

/** Multi-Pet / You & Your Pet record only (null for anything else). */
export function readFlowOrderDetails(value: unknown): OrderDetails | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Partial<OrderDetails>;
  if (!isFlowProduct(record.configurator) || !Array.isArray(record.photo_assets)) return null;
  return {
    ...(record as OrderDetails),
    names: Array.isArray(record.names) ? record.names.map(String) : [],
    pets: Array.isArray(record.pets) ? record.pets : [],
    photo_assets: record.photo_assets.filter(
      (asset): asset is OrderPhotoAsset => Boolean(asset) && typeof asset === "object" && typeof asset.url === "string"
    ),
  };
}
