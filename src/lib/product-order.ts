// Multi-Pet and You & Your Pet: photo slots, checkout payload and the server-side checks both handoffs require.
// Shared by the shop (which boxes to show) and the server (what an order must contain). No I/O here.

import {
  EXTRA_IDS,
  fill,
  sizeHiddenForPets,
  type EverydayContent,
  type ExtraId,
  type FlowContent,
} from "@/lib/everyday-content";
import { displaySizeLabel, type PriceCatalog, type PricingInput } from "@/lib/pricing";
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

/** One readable line for the order timeline (used until the order_details column exists). */
export function orderDetailsSummary(details: OrderDetails) {
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

/** Reads a stored order_details value back (staff views). Anything malformed is ignored. */
export function readOrderDetails(value: unknown): OrderDetails | null {
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
