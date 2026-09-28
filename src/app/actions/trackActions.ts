"use server";

import { headers } from "next/headers";
import { formatChangePoints, validateChangePoints } from "@/lib/change-points";
import {
  latestPreview,
  MAX_REVISION_ROUNDS,
  phoneKey,
  safeTrackingUrl,
  type OrderUpdate,
} from "@/lib/fulfillment";
import { notifyArtistRevision, notifyArtworkApproved, notifyRevisionReceived, notifyShipmentQueued } from "@/lib/notifications";
import { sendOrderToVendor } from "@/lib/vendor";
import { storedPetPhotoUrl } from "@/lib/pet-photo";
import {
  ensureWorkflow,
  findArtistById,
  insertUpdate,
  recordEvent,
  saveWorkflow,
  updatesFor,
  workflowFor,
} from "@/lib/portal-db";
import { supabaseAdmin } from "@/lib/supabase-admin";

export type TrackUpdate = {
  id: string;
  kind: OrderUpdate["kind"];
  image_url: string | null;
  note: string | null;
  created_at: string;
};

export type TrackOrder = {
  id: string;
  pet_name: string;
  created_at: string;
  fulfillment_stage: string;
  tracking_url: string | null;
  revision_count: number;
  revision_limit: number;
  approved_update_id: string | null;
  approved_at: string | null;
  needs_decision: boolean;
  updates: TrackUpdate[];
};

async function portalOrigin() {
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") || h.get("host");
    if (!host) return "";
    const proto = h.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
    return `${proto}://${host}`;
  } catch {
    return "";
  }
}

function publicUpdate(update: OrderUpdate): TrackUpdate {
  return {
    id: update.id,
    kind: update.kind,
    image_url: storedPetPhotoUrl(update.image_url) || null,
    note: update.note || null,
    created_at: update.created_at,
  };
}

async function ordersForPhone(phone: string) {
  const key = phoneKey(phone);
  if (!key) return { ok: false as const, error: "Enter the 10-digit phone number from your order." };

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("id, pet_name, created_at, customer_phone, photo_url")
    .eq("customer_phone_key", key)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Track lookup error:", error);
    return { ok: false as const, error: "Order tracking is not available yet. Please try again shortly." };
  }

  const rows = data ?? [];
  const ids = rows.map((row) => String(row.id));
  const updates = await updatesFor(ids);
  const byOrder = new Map<string, TrackUpdate[]>();
  for (const update of updates) {
    const list = byOrder.get(update.order_id) ?? [];
    list.push(publicUpdate(update));
    byOrder.set(update.order_id, list);
  }

  const orders: TrackOrder[] = [];
  for (const row of rows) {
    const id = String(row.id);
    const workflow = (await workflowFor(id)) ?? {
      status: row.photo_url ? "ready_for_artwork" : "awaiting_images",
      tracking_url: null,
      revision_count: 0,
      approved_update_id: null,
      approved_at: null,
      needs_decision: false,
    };
    orders.push({
      id,
      pet_name: String(row.pet_name || "Your portrait"),
      created_at: String(row.created_at || ""),
      fulfillment_stage: workflow.status,
      tracking_url: safeTrackingUrl(workflow.tracking_url) || null,
      revision_count: workflow.revision_count,
      revision_limit: MAX_REVISION_ROUNDS,
      approved_update_id: workflow.approved_update_id,
      approved_at: workflow.approved_at,
      needs_decision: workflow.needs_decision,
      updates: byOrder.get(id) ?? [],
    });
  }

  return { ok: true as const, orders };
}

export async function lookupOrdersByPhone(phone: string) {
  const result = await ordersForPhone(phone);
  if (!result.ok) return result;
  return { ok: true as const, orders: result.orders };
}

async function orderMatchesPhone(orderId: string, phone: string) {
  const key = phoneKey(phone);
  if (!key || !orderId) return null;
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("id, pet_name, customer_phone, customer_email, photo_url, created_at")
    .eq("id", orderId)
    .maybeSingle();
  if (error || !data) return null;
  if (phoneKey(String(data.customer_phone || "")) !== key) return null;
  return data;
}

async function lockApprovedVersion(input: {
  orderId: string;
  phone: string;
  actor: string;
  detail: string;
}) {
  const order = await orderMatchesPhone(input.orderId, input.phone);
  if (!order && input.actor === "customer") return { ok: false as const, error: "We couldn't find that order." };

  const source = order ?? (await supabaseAdmin.from("orders").select("id, pet_name, customer_email, photo_url, created_at").eq("id", input.orderId).maybeSingle()).data;
  if (!source) return { ok: false as const, error: "We couldn't find that order." };

  const workflow = await ensureWorkflow(source);
  if (workflow.status !== "artwork_review") {
    return { ok: false as const, error: "This preview can no longer be approved." };
  }
  if (workflow.approved_update_id) {
    return { ok: false as const, error: "A picture is already locked for this order." };
  }

  const updates = await updatesFor([input.orderId]);
  const preview = latestPreview(updates);
  if (!preview) return { ok: false as const, error: "A preview has to be ready before this can be approved." };

  const approvedAt = new Date().toISOString();
  const saved = await saveWorkflow(input.orderId, "artwork_review", {
    status: "final_approval",
    approved_update_id: preview.id,
    approved_at: approvedAt,
    approved_by: input.actor,
    needs_decision: false,
  });
  if (!saved) return { ok: false as const, error: "This preview can no longer be approved." };

  await insertUpdate({
    order_id: input.orderId,
    kind: "approved",
    image_url: preview.image_url,
    note: "This picture is locked for shipment.",
    created_by: input.actor,
  });
  await recordEvent({
    order_id: input.orderId,
    actor: input.actor,
    action: "artwork_approved",
    detail: input.detail,
  });

  if (source.customer_email) {
    try {
      await notifyArtworkApproved({
        orderId: input.orderId,
        updateId: preview.id,
        to: source.customer_email,
        petName: source.pet_name || "",
      });
    } catch (error) {
      console.error("Approval email error:", error);
    }
  }

  try {
    await sendOrderToVendor({ orderId: input.orderId, actor: "approval" });
  } catch (error) {
    console.error("Vendor API error:", error);
  }

  const shipmentEmail = process.env.SHIPMENT_EMAIL?.trim();
  if (shipmentEmail) {
    try {
      const origin = await portalOrigin();
      await notifyShipmentQueued({
        orderId: input.orderId,
        to: shipmentEmail,
        petName: source.pet_name || "",
        portalUrl: origin ? `${origin}/shipment` : "",
      });
    } catch (error) {
      console.error("Shipment queue email error:", error);
    }
  }

  return { ok: true as const, previewId: preview.id };
}

export async function approvePreview(orderId: string, phone: string) {
  const locked = await lockApprovedVersion({
    orderId,
    phone,
    actor: "customer",
    detail: `Customer approved preview.`,
  });
  if (!locked.ok) return locked;
  return lookupOrdersByPhone(phone);
}

export async function requestRevision(orderId: string, phone: string, points: string[]) {
  const checked = validateChangePoints(points);
  if (!checked.ok) return checked;
  const trimmed = formatChangePoints(checked.points);

  const order = await orderMatchesPhone(orderId, phone);
  if (!order) return { ok: false as const, error: "We couldn't find that order." };
  const workflow = await ensureWorkflow(order);
  if (workflow.status !== "artwork_review") {
    return { ok: false as const, error: "A revision can only be requested while a preview is ready." };
  }
  if (workflow.revision_count >= MAX_REVISION_ROUNDS) {
    return {
      ok: false as const,
      error: "Both revision rounds are used. Approve this picture, or the team will accept the latest picture and move it to shipment.",
    };
  }

  const nextCount = workflow.revision_count + 1;
  const saved = await saveWorkflow(orderId, "artwork_review", {
    status: "revision_requested",
    revision_count: nextCount,
    needs_decision: false,
  });
  if (!saved) return { ok: false as const, error: "A revision can only be requested while a preview is ready." };

  let updateId = "";
  try {
    updateId = await insertUpdate({
      order_id: orderId,
      kind: "revision",
      note: trimmed,
      created_by: "customer",
    });
  } catch (err) {
    console.error("Revision insert error:", err);
    await saveWorkflow(orderId, "revision_requested", {
      status: "artwork_review",
      revision_count: workflow.revision_count,
      needs_decision: workflow.needs_decision,
    });
    return { ok: false as const, error: "The revision note could not be saved." };
  }

  await recordEvent({
    order_id: orderId,
    actor: "customer",
    action: "revision_requested",
    detail: `Round ${nextCount} of ${MAX_REVISION_ROUNDS}. ${trimmed}`,
  });

  if (order.customer_email) {
    try {
      await notifyRevisionReceived({
        orderId,
        updateId,
        to: order.customer_email,
        petName: order.pet_name || "",
        note: trimmed,
        round: nextCount,
      });
    } catch (error) {
      console.error("Revision confirmation error:", error);
    }
  }

  if (workflow.artist_id) {
    const artist = await findArtistById(workflow.artist_id);
    if (artist?.email) {
      const origin = await portalOrigin();
      try {
        await notifyArtistRevision({
          orderId,
          updateId,
          to: artist.email,
          artistName: artist.name || "",
          petName: order.pet_name || "",
          note: trimmed,
          portalUrl: origin ? `${origin}/artist` : "",
        });
      } catch (mailError) {
        console.error("Revision email error:", mailError);
      }
    }
  }

  return lookupOrdersByPhone(phone);
}

export async function acceptLatestForShipment(orderId: string, actor: string) {
  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select("id, pet_name, customer_email, customer_phone, photo_url, created_at")
    .eq("id", orderId)
    .maybeSingle();
  if (error || !order) return { ok: false as const, error: error?.message || "Order not found." };

  const workflow = await ensureWorkflow(order);
  if (!workflow.needs_decision || workflow.revision_count < MAX_REVISION_ROUNDS || workflow.status !== "artwork_review") {
    return { ok: false as const, error: "This order is not waiting for you to accept the latest picture." };
  }

  return lockApprovedVersion({
    orderId,
    phone: String(order.customer_phone || ""),
    actor,
    detail: "Admin accepted the latest picture after both revision rounds and moved the order to shipment.",
  });
}
