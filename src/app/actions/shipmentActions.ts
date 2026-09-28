"use server";

import { SHIPMENT_QUEUE, type OrderUpdate } from "@/lib/fulfillment";
import {
  latestVendorAttempts,
  notesFor,
  SETUP_MESSAGE,
  updatesFor,
  workflowsInStatus,
  type OrderWorkflow,
  type TeamNote,
  type VendorAttempt,
} from "@/lib/portal-db";
import { getShipmentSession } from "@/lib/shipment-auth";
import { recordDelivery, recordShipmentLink } from "@/lib/shipment-desk";
import { supabaseAdmin } from "@/lib/supabase-admin";

export type ShipmentOrder = {
  id: string;
  pet_name?: string | null;
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  size?: string | null;
  frame_style?: string | null;
  addon?: string | null;
  gift_wrap?: boolean | null;
  total_price?: string | number | null;
  cod_due?: string | number | null;
  payment_mode?: string | null;
  photo_url?: string | null;
  memorial_text?: string | null;
  shipping_address?: string | null;
  shipping_city?: string | null;
  shipping_state?: string | null;
  shipping_pincode?: string | null;
  shipping_landmark?: string | null;
  created_at?: string | null;
  fulfillment_stage: string;
  tracking_url: string | null;
  tracking_saved_by: string | null;
  tracking_saved_at: string | null;
  approved_update_id: string | null;
  approved_at: string | null;
  delivered_at: string | null;
  delivered_by: string | null;
  updates: OrderUpdate[];
  teamNotes: TeamNote[];
  vendor: VendorAttempt | null;
};

export type ShipmentDashboard = {
  user: string;
  warning?: string;
  orders: ShipmentOrder[];
};

const ORDER_FIELDS =
  "id, pet_name, customer_name, customer_email, customer_phone, size, frame_style, addon, gift_wrap, total_price, cod_due, payment_mode, photo_url, memorial_text, shipping_address, shipping_city, shipping_state, shipping_pincode, shipping_landmark, created_at";

export async function getShipmentDashboard(): Promise<ShipmentDashboard | null> {
  const session = await getShipmentSession();
  if (!session) return null;

  let queued: { rows: OrderWorkflow[]; missing: boolean };
  try {
    queued = await workflowsInStatus([...SHIPMENT_QUEUE]);
  } catch (error) {
    console.error("Shipment queue error:", error);
    return { user: session.user, orders: [], warning: "Shipment orders could not be loaded." };
  }
  if (queued.missing) return { user: session.user, orders: [], warning: SETUP_MESSAGE };
  if (!queued.rows.length) return { user: session.user, orders: [] };

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select(ORDER_FIELDS)
    .in(
      "id",
      queued.rows.map((row) => row.order_id)
    );

  if (error) {
    console.error("Shipment orders error:", error);
    return { user: session.user, orders: [], warning: error.message };
  }

  const orderIds = queued.rows.map((row) => row.order_id);
  const [updates, teamNotes, vendorAttempts] = await Promise.all([
    updatesFor(orderIds),
    notesFor(orderIds),
    latestVendorAttempts(orderIds),
  ]);
  const byOrder = new Map<string, OrderUpdate[]>();
  for (const update of updates) {
    const list = byOrder.get(update.order_id) ?? [];
    list.push(update);
    byOrder.set(update.order_id, list);
  }
  const notesByOrder = new Map<string, TeamNote[]>();
  for (const note of teamNotes) {
    const list = notesByOrder.get(note.order_id) ?? [];
    list.push(note);
    notesByOrder.set(note.order_id, list);
  }
  const vendorByOrder = new Map(vendorAttempts.map((attempt) => [attempt.order_id, attempt]));
  const workflowById = new Map(queued.rows.map((row) => [row.order_id, row]));
  const rank: Record<string, number> = { final_approval: 0, shipped: 1, delivered: 2 };

  const orders = ((data ?? []) as Array<Omit<ShipmentOrder, "updates" | "teamNotes" | "vendor" | "fulfillment_stage" | "tracking_url" | "tracking_saved_by" | "tracking_saved_at" | "approved_update_id" | "approved_at" | "delivered_at" | "delivered_by">>)
    .map((order) => {
      const workflow = workflowById.get(order.id);
      return {
        ...order,
        fulfillment_stage: workflow?.status ?? "final_approval",
        tracking_url: workflow?.tracking_url ?? null,
        tracking_saved_by: workflow?.tracking_saved_by ?? null,
        tracking_saved_at: workflow?.tracking_saved_at ?? null,
        approved_update_id: workflow?.approved_update_id ?? null,
        approved_at: workflow?.approved_at ?? null,
        delivered_at: workflow?.delivered_at ?? null,
        delivered_by: workflow?.delivered_by ?? null,
        updates: byOrder.get(order.id) ?? [],
        teamNotes: notesByOrder.get(order.id) ?? [],
        vendor: vendorByOrder.get(order.id) ?? null,
      };
    })
    .sort((a, b) => {
      const stage = (rank[a.fulfillment_stage] ?? 9) - (rank[b.fulfillment_stage] ?? 9);
      if (stage !== 0) return stage;
      return new Date(a.approved_at || a.created_at || 0).getTime() - new Date(b.approved_at || b.created_at || 0).getTime();
    });

  return { user: session.user, orders };
}

export async function saveShipmentTracking(orderId: string, trackingUrl: string) {
  const session = await getShipmentSession();
  if (!session) return { ok: false as const, error: "Sign in again to continue." };
  if (!orderId) return { ok: false as const, error: "Missing order." };
  return recordShipmentLink({ orderId, trackingUrl, actor: session.user });
}

export async function markShipmentDelivered(orderId: string) {
  const session = await getShipmentSession();
  if (!session) return { ok: false as const, error: "Sign in again to continue." };
  if (!orderId) return { ok: false as const, error: "Missing order." };
  return recordDelivery({ orderId, actor: session.user });
}
