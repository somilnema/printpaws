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
