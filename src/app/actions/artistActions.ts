"use server";

import { randomUUID } from "crypto";
import { createOriginalUploadUrl, readOriginalArtwork, removeArtworkFiles, saveCustomerProof } from "@/lib/artwork-files";
import { buildWatermarkedPreview } from "@/lib/artwork-preview";
import { getArtistSession } from "@/lib/artist-auth";
import { artistCanStartRevision, artistCanUpload, type OrderUpdate } from "@/lib/fulfillment";
import { notifyPreviewReady } from "@/lib/notifications";
import { sendOverdueReminders } from "@/lib/overdue";
import { storedPetPhotoUrl } from "@/lib/pet-photo";
import {
  deleteUpdate,
  ensureWorkflow,
  insertTeamNote,
  insertUpdate,
  notesFor,
  ordersForArtist,
  recordEvent,
  saveWorkflow,
  SETUP_MESSAGE,
  updatesFor,
  type OrderWorkflow,
  type TeamNote,
} from "@/lib/portal-db";
import { supabaseAdmin } from "@/lib/supabase-admin";

export type ArtistOrder = {
  id: string;
  pet_name?: string | null;
  size?: string | null;
  frame_style?: string | null;
  background?: string | null;
  font?: string | null;
  memorial_text?: string | null;
  photo_url?: string | null;
  fulfillment_stage?: string | null;
  due_at?: string | null;
  revision_count?: number;
  created_at?: string | null;
  updates: OrderUpdate[];
  teamNotes: TeamNote[];
};

export type ArtistPortal = {
  artist: { id: string; name: string; email: string };
  orders: ArtistOrder[];
  warning?: string;
};

const ARTIST_ORDER_FIELDS =
  "id, pet_name, size, frame_style, background, font, memorial_text, photo_url, created_at, customer_email";

export async function getArtistPortal(): Promise<ArtistPortal | null> {
  const artist = await getArtistSession();
  if (!artist) return null;
  await sendOverdueReminders().catch((error) => console.error("Overdue reminder error:", error));

  let assigned: { rows: OrderWorkflow[]; missing: boolean };
  try {
    assigned = await ordersForArtist(artist.id);
  } catch (error) {
    console.error("Artist workflow error:", error);
    return { artist, orders: [], warning: "Assigned orders could not be loaded." };
  }
  if (assigned.missing) return { artist, orders: [], warning: SETUP_MESSAGE };
  if (!assigned.rows.length) return { artist, orders: [] };

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select(ARTIST_ORDER_FIELDS)
    .in(
      "id",
      assigned.rows.map((row) => row.order_id)
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("Artist orders error:", error);
    return { artist, orders: [], warning: error.message };
  }

  const orders = (data ?? []) as Array<Omit<ArtistOrder, "updates" | "fulfillment_stage" | "due_at" | "revision_count" | "teamNotes"> & { customer_email?: string }>;
  const ids = orders.map((order) => order.id);
  const [updates, teamNotes] = await Promise.all([updatesFor(ids), notesFor(ids)]);
  const byOrder = new Map<string, OrderUpdate[]>();
  for (const update of updates) {
    const list = byOrder.get(update.order_id) ?? [];
    list.push(update);
    byOrder.set(update.order_id, list);
  }
  const workflowById = new Map(assigned.rows.map((row) => [row.order_id, row]));
  const notesByOrder = new Map<string, TeamNote[]>();
  for (const note of teamNotes) {
    const list = notesByOrder.get(note.order_id) ?? [];
    list.push(note);
    notesByOrder.set(note.order_id, list);
  }

  return {
    artist,
    orders: orders.map((order) => {
      const workflow = workflowById.get(order.id);
      return {
        id: order.id,
        pet_name: order.pet_name,
        size: order.size,
        frame_style: order.frame_style,
        background: order.background,
        font: order.font,
        memorial_text: order.memorial_text,
        photo_url: order.photo_url,
        created_at: order.created_at,
        fulfillment_stage: workflow?.status ?? "ready_for_artwork",
        due_at: workflow?.due_at ?? null,
        revision_count: workflow?.revision_count ?? 0,
        updates: byOrder.get(order.id) ?? [],
        teamNotes: notesByOrder.get(order.id) ?? [],
      };
    }),
  };
}

export async function startRevision(orderId: string) {
  const artist = await getArtistSession();
  if (!artist) return { ok: false as const, error: "Sign in again to continue." };
  if (!orderId) return { ok: false as const, error: "Missing order." };

  const { data: order, error } = await supabaseAdmin.from("orders").select("id, photo_url, created_at").eq("id", orderId).maybeSingle();
  if (error || !order) return { ok: false as const, error: error?.message || "Order not found." };

  const workflow = await ensureWorkflow(order);
  if (workflow.artist_id !== artist.id) return { ok: false as const, error: "This order is not assigned to you." };
  if (!artistCanStartRevision(workflow.status)) {
    return { ok: false as const, error: "This revision is already started or no longer waiting." };
  }

  const saved = await saveWorkflow(orderId, workflow.status, { status: "revision_in_progress" });
  if (!saved) return { ok: false as const, error: "This revision could not be started. Refresh and try again." };
  await recordEvent({
    order_id: orderId,
    actor: artist.email,
    action: "revision_started",
    detail: "Artist started the revision.",
  });
  return { ok: true as const };
}

const MAX_ARTWORK_BYTES = 20 * 1024 * 1024;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ARTWORK_TYPES: Record<string, { ext: string; contentType: string }> = {
  "image/jpeg": { ext: "jpg", contentType: "image/jpeg" },
  "image/jpg": { ext: "jpg", contentType: "image/jpeg" },
  "image/png": { ext: "png", contentType: "image/png" },
  "image/webp": { ext: "webp", contentType: "image/webp" },
};
const EXT_TYPES: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

async function loadUploadableOrder(artistId: string, orderId: string) {
  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .select("id, pet_name, customer_email, photo_url, created_at")
    .eq("id", orderId)
    .maybeSingle();
  if (orderError || !order) return { ok: false as const, error: orderError?.message || "Order not found." };

  const workflow = await ensureWorkflow(order);
  if (workflow.artist_id !== artistId) return { ok: false as const, error: "This order is not assigned to you." };
  if (workflow.approved_update_id) {
    return { ok: false as const, error: "The approved picture is locked and cannot be replaced." };
  }
  if (!artistCanUpload(workflow.status)) {
    return { ok: false as const, error: "This order is no longer waiting on a preview." };
  }
  return { ok: true as const, order, workflow };
}

export async function createArtworkUpload(input: { orderId: string; type: string; size: number }) {
  const artist = await getArtistSession();
  if (!artist) return { ok: false as const, error: "Sign in again to continue." };

  const orderId = String(input.orderId || "");
  if (!orderId) return { ok: false as const, error: "Missing order." };
  if (!input.size) return { ok: false as const, error: "Choose the artwork image." };
  if (input.size > MAX_ARTWORK_BYTES) return { ok: false as const, error: "Use an artwork file under 20 MB." };
  const kind = ARTWORK_TYPES[input.type || "image/jpeg"];
  if (!kind) return { ok: false as const, error: "Use a JPG, PNG, or WebP image." };

  const loaded = await loadUploadableOrder(artist.id, orderId);
  if (!loaded.ok) return loaded;

  const versionId = randomUUID();
  try {
    const signed = await createOriginalUploadUrl(orderId, versionId, kind.ext);
    return { ok: true as const, versionId, ext: kind.ext, contentType: kind.contentType, ...signed };
  } catch (error) {
    console.error("Artwork upload URL error:", error);
    return { ok: false as const, error: error instanceof Error ? error.message : "The upload could not be started." };
  }
}

export async function finishArtworkUpload(input: {
  orderId: string;
  versionId: string;
  ext: string;
  note?: string;
  teamNote?: string;
}) {
  const artist = await getArtistSession();
  if (!artist) return { ok: false as const, error: "Sign in again to continue." };

  const orderId = String(input.orderId || "");
  const versionId = String(input.versionId || "");
  const ext = String(input.ext || "");
  const note = String(input.note || "").trim();
  const teamNote = String(input.teamNote || "").trim();
  if (!orderId) return { ok: false as const, error: "Missing order." };
  if (!UUID_PATTERN.test(versionId) || !EXT_TYPES[ext]) {
    return { ok: false as const, error: "The uploaded artwork could not be found. Please upload it again." };
  }
  if (note.length > 2000 || teamNote.length > 2000) {
    return { ok: false as const, error: "Keep each note under 2000 characters." };
  }

  const loaded = await loadUploadableOrder(artist.id, orderId);
  if (!loaded.ok) {
    await removeArtworkFiles(orderId, versionId);
    return loaded;
  }
  const { order, workflow } = loaded;

  const bytes = await readOriginalArtwork(orderId, versionId, ext);
  if (!bytes || bytes.length === 0) {
    return { ok: false as const, error: "The uploaded artwork could not be found. Please upload it again." };
  }
  if (bytes.length > MAX_ARTWORK_BYTES) {
    await removeArtworkFiles(orderId, versionId);
    return { ok: false as const, error: "Use an artwork file under 20 MB." };
  }

  let proofUrl = "";
  try {
    const preview = await buildWatermarkedPreview(bytes, orderId);
    proofUrl = await saveCustomerProof(orderId, versionId, preview);
  } catch (error) {
    await removeArtworkFiles(orderId, versionId);
    console.error("Artwork preview error:", error);
    return { ok: false as const, error: error instanceof Error ? error.message : "The preview could not be saved." };
  }

  const imageUrl = storedPetPhotoUrl(proofUrl);
  if (!imageUrl) {
    await removeArtworkFiles(orderId, versionId);
    return { ok: false as const, error: "The preview was created but the saved link was invalid." };
  }

  let insertedId = "";
  try {
    insertedId = await insertUpdate({
      id: versionId,
      order_id: orderId,
      kind: "preview",
      image_url: imageUrl,
      note: note || null,
      created_by: artist.email,
    });
  } catch (error) {
    await removeArtworkFiles(orderId, versionId);
    return { ok: false as const, error: error instanceof Error ? error.message : "The preview could not be saved." };
  }

  const needsDecision = workflow.revision_count >= 2;
  const saved = await saveWorkflow(orderId, workflow.status, {
    status: "artwork_review",
    needs_decision: needsDecision,
  });
  if (!saved) {
    await deleteUpdate(insertedId);
    await removeArtworkFiles(orderId, versionId);
    return { ok: false as const, error: "This order is no longer waiting on a preview." };
  }

  await recordEvent({
    order_id: orderId,
    actor: artist.email,
    action: "preview_uploaded",
    detail: needsDecision ? "Revised preview uploaded. Both revision rounds are used, so admin must accept it if the customer does not." : "Preview uploaded for customer review.",
  });

  let warning = "";
  if (teamNote) {
    const savedNote = await insertTeamNote({ order_id: orderId, author: artist.email, body: teamNote });
    if (!savedNote.ok) warning = savedNote.error;
  }

  if (order.customer_email) {
    try {
      await notifyPreviewReady({
        orderId,
        updateId: insertedId,
        to: order.customer_email,
        petName: order.pet_name || "",
        previewUrl: imageUrl,
        revised: workflow.revision_count > 0,
      });
    } catch (err) {
      console.error("Preview email error:", err);
    }
  }

  return warning ? { ok: true as const, warning } : { ok: true as const };
}
