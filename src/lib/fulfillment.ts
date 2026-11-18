import type { BundleOrderDetails, DeskOrderDetails } from "@/lib/product-order";

export const MAX_REVISION_ROUNDS = 2;
export const SLA_HOURS = 48;
export const SLA_LIMIT_HOURS = 72;
const HOUR_MS = 60 * 60 * 1000;

export const WORKFLOW_STATUSES = [
  "awaiting_images",
  "ready_for_artwork",
  "artwork_in_progress",
  "artwork_review",
  "revision_requested",
  "revision_in_progress",
  "final_approval",
  "shipped",
  "delivered",
  "on_hold",
  "cancelled",
] as const;

export type WorkflowStatus = (typeof WORKFLOW_STATUSES)[number];
export type UpdateKind = "preview" | "revision" | "approved";

export type OrderUpdate = {
  id: string;
  order_id: string;
  kind: UpdateKind;
  image_url?: string | null;
  note?: string | null;
  created_by?: string | null;
  created_at: string;
};

export type TimelineStep = {
  key: string;
  label: string;
  state: "done" | "current" | "upcoming";
};

const STAGE_LABELS: Record<string, string> = {
  awaiting_images: "Waiting for photos",
  ready_for_artwork: "Ready for artwork",
  artwork_in_progress: "Artwork in progress",
  artwork_review: "Artwork review",
  revision_requested: "Revision requested",
  revision_in_progress: "Revision in progress",
  final_approval: "Ready to ship",
  shipped: "Shipped",
  delivered: "Delivered",
  on_hold: "On hold",
  cancelled: "Cancelled",
};

const ARTWORK_OPEN = new Set<string>([
  "ready_for_artwork",
  "artwork_in_progress",
  "artwork_review",
  "revision_requested",
  "revision_in_progress",
]);

const FLOW = [
  "awaiting_images",
  "ready_for_artwork",
  "artwork_in_progress",
  "artwork_review",
  "final_approval",
  "shipped",
  "delivered",
];

export function isWorkflowStatus(value: unknown): value is WorkflowStatus {
  return WORKFLOW_STATUSES.includes(value as WorkflowStatus);
}

export function stageLabel(stage?: string | null) {
  if (!stage) return STAGE_LABELS.ready_for_artwork;
  return STAGE_LABELS[stage] || stage;
}

export function phoneKey(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 10) return "";
  return digits.slice(-10);
}

export function hasPetPhoto(photoUrl?: string | null) {
  return Boolean(String(photoUrl || "").trim());
}

export function addHours(iso: string, hours: number) {
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return "";
  return new Date(time + hours * HOUR_MS).toISOString();
}

export function initialDueAt(slaStartedAt: string) {
  return addHours(slaStartedAt, SLA_HOURS);
}

export function maximumDueAt(slaStartedAt: string) {
  return addHours(slaStartedAt, SLA_LIMIT_HOURS);
}

export function isOverdue(status: string | null | undefined, dueAt?: string | null, now = Date.now()) {
  if (!status || !dueAt || !ARTWORK_OPEN.has(status)) return false;
  const due = new Date(dueAt).getTime();
  return !Number.isNaN(due) && due < now;
}

export function artworkIsOpen(status?: string | null) {
  return Boolean(status && ARTWORK_OPEN.has(status));
}

export function timelineSteps(
  stage: string | null | undefined,
  updates: { kind: string }[]
): TimelineStep[] {
  const current = isWorkflowStatus(stage) ? stage : "ready_for_artwork";
  const hasRevision = updates.some((update) => update.kind === "revision") || current.startsWith("revision");
  const keys = FLOW.filter((key) => key !== "awaiting_images" || current === "awaiting_images");
  if (hasRevision) {
    const reviewAt = keys.indexOf("artwork_review");
    keys.splice(reviewAt, 0, "revision_requested");
    if (current === "revision_in_progress" || updates.some((update) => update.kind === "revision")) {
      const requestedAt = keys.indexOf("revision_requested");
      if (current === "revision_in_progress") keys.splice(requestedAt + 1, 0, "revision_in_progress");
    }
  }
  if (current === "on_hold" || current === "cancelled") keys.push(current);

  const currentIndex = Math.max(0, keys.indexOf(current));
  return keys.map((key, index) => ({
    key,
    label: STAGE_LABELS[key] || key,
    state: current === "cancelled" && key !== "cancelled"
      ? "upcoming"
      : index < currentIndex
        ? "done"
        : index === currentIndex
          ? "current"
          : "upcoming",
  }));
}

export function artistCanUpload(stage?: string | null) {
  return stage === "artwork_in_progress" || stage === "revision_in_progress";
}

export function artistCanStartRevision(stage?: string | null) {
  return stage === "revision_requested";
}

export function adminCanAssign(stage?: string | null) {
  return (
    stage === "ready_for_artwork" ||
    stage === "artwork_in_progress" ||
    stage === "artwork_review" ||
    stage === "revision_requested" ||
    stage === "revision_in_progress"
  );
}

export function adminCanHold(stage?: string | null) {
  return (
    stage === "awaiting_images" ||
    stage === "ready_for_artwork" ||
    artworkIsOpen(stage) ||
    stage === "final_approval"
  );
}

export function adminCanCancel(stage?: string | null) {
  return stage !== "delivered" && stage !== "cancelled" && stage !== "shipped";
}

export function shipperCanAddTracking(stage?: string | null) {
  return stage === "final_approval" || stage === "shipped";
}

export function shipperCanMarkDelivered(stage?: string | null) {
  return stage === "shipped";
}

export const SHIPMENT_QUEUE = ["final_approval", "shipped", "delivered"] as const;

export function safeTrackingUrl(value?: string | null) {
  const url = String(value ?? "").trim();
  if (!url) return "";
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return "";
    return parsed.toString();
  } catch {
    return "";
  }
}

export function latestPreview(updates: OrderUpdate[]) {
  return [...updates].reverse().find((update) => update.kind === "preview" && update.image_url) || null;
}

/**
 * Work items for the server-derived Desk Portrait / Signature Gift Bundle tokens in `orders.addon`
 * (contract section 6). Bundle inclusions are not charged as add-ons, but production still has to make them.
 */
export const NEW_PRODUCT_ADDON_LABELS: Record<string, string> = {
  wooden_stand: "Wooden stand (included)",
  bundle_essential: "Essential Gift Bundle",
  bundle_signature: "Signature Gift Bundle",
  bundle_mug: "Included: Custom Pet Mug",
  bundle_digital: "Included: Hi-Res Digital Download",
  bundle_magnet: "Included: Custom Fridge Magnet",
  packaging_standard: "Included: Standard Gift Packaging",
  packaging_premium: "Included: Premium Gift Packaging",
  greeting_card: "Personalised Greeting Card",
};

function newProductAddonLabel(token: string) {
  return Object.prototype.hasOwnProperty.call(NEW_PRODUCT_ADDON_LABELS, token) ? NEW_PRODUCT_ADDON_LABELS[token] : null;
}

function addonTokenList(addon: string | null | undefined) {
  return String(addon || "")
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean);
}

/** True when the add-on list carries a Desk Portrait / Gift Bundle token. */
export function hasNewProductAddon(addon: string | null | undefined) {
  return addonTokenList(addon).some((token) => newProductAddonLabel(token) !== null);
}

/**
 * Staff/vendor text for `orders.addon`. Only the Desk Portrait / Gift Bundle tokens are relabelled; any other
 * add-on list comes back exactly as stored, so existing orders read the same as before.
 */
export function readableAddon(addon: string | null | undefined) {
  const raw = String(addon || "");
  if (!hasNewProductAddon(raw)) return raw;
  return addonTokenList(raw)
    .map((token) => newProductAddonLabel(token) || token)
    .join(", ");
}

/** One readable work item per token, for the Desk Portrait / Gift Bundle only (empty for every other order). */
export function newProductWorkItems(addon: string | null | undefined) {
  if (!hasNewProductAddon(addon)) return [] as string[];
  return addonTokenList(addon).map((token) => newProductAddonLabel(token) || token);
}

function productTypeOf(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as { product_type?: unknown }).product_type : undefined;
}

/** The stored Desk Portrait details, or null for any other order. */
export function deskOrderDetails(value: unknown): DeskOrderDetails | null {
  return productTypeOf(value) === "mini_desk" ? (value as DeskOrderDetails) : null;
}

/** The stored Signature Gift Bundle details, or null for any other order. */
export function bundleOrderDetails(value: unknown): BundleOrderDetails | null {
  return productTypeOf(value) === "gift_bundle" ? (value as BundleOrderDetails) : null;
}

/** "Desk Portrait" / "Signature Gift Bundle" from the stored details or the add-on tokens; "" for every other order. */
export function newProductName(addon: string | null | undefined, details?: unknown) {
  if (deskOrderDetails(details)) return "Desk Portrait";
  if (bundleOrderDetails(details)) return "Signature Gift Bundle";
  const tokens = addonTokenList(addon);
  if (tokens.includes("bundle_essential") || tokens.includes("bundle_signature")) return "Signature Gift Bundle";
  if (tokens.includes("wooden_stand")) return "Desk Portrait";
  return "";
}

/** Plain-text production lines for a Desk Portrait / Gift Bundle (vendor notes). Empty for every other order. */
export function newProductSummaryLines(details: unknown): string[] {
  const desk = deskOrderDetails(details);
  if (desk) {
    const count = Number(desk.pet_count) || 1;
    const colour = desk.background_colour;
    return [
      `Desk Portrait: ${count} ${count === 1 ? "pet" : "pets"}, ${desk.layout_orientation === "horizontal" ? "horizontal" : "vertical"} layout`,
      colour ? `Background colour: ${[colour.label || colour.id, colour.hex].filter(Boolean).join(" ")}` : "",
      desk.pet_names ? `Pet name(s): ${desk.pet_names}` : "",
      desk.subtitle_enabled && desk.subtitle ? `Subtitle: ${desk.subtitle}` : "",
      "Wooden stand: Included",
      desk.production_size ? `Production size: ${desk.production_size}` : "",
      desk.quantity > 1 ? `Quantity: ${desk.quantity}` : "",
    ].filter(Boolean);
  }
  const bundle = bundleOrderDetails(details);
  if (bundle) {
    const items = Array.isArray(bundle.included_items) ? bundle.included_items : [];
    const card = bundle.greeting_card;
    const portrait = [
      bundle.portrait_style === "canvas" ? "Canvas" : "Framed",
      bundle.size,
      bundle.portrait_style === "canvas" ? "" : bundle.frame ? `${bundle.frame} frame` : "",
    ].filter(Boolean);
    return [
      `Signature Gift Bundle: ${bundle.bundle_label || bundle.bundle_tier}`,
      `Portrait: ${portrait.join(", ")}`,
      bundle.background ? `Background: ${bundle.background.label || bundle.background.id}` : "",
      bundle.pet_name_enabled && bundle.pet_name ? `Pet name: ${bundle.pet_name}` : "",
      bundle.subtitle_enabled && bundle.subtitle ? `Subtitle: ${bundle.subtitle}` : "",
      items.length ? `Included (make and pack): ${items.map((item) => item.label || item.id).join(", ")}` : "",
      card?.selected ? `Personalised Greeting Card message: ${card.message}` : "Personalised Greeting Card: Not selected",
      bundle.quantity > 1 ? `Quantity: ${bundle.quantity}` : "",
    ].filter(Boolean);
  }
  return [];
}
