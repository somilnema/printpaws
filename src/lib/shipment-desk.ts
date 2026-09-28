import { safeTrackingUrl } from "@/lib/fulfillment";
import { notifyDelivered, notifyShipped } from "@/lib/notifications";
import { recordEvent, saveWorkflow, workflowFor } from "@/lib/portal-db";
import { supabaseAdmin } from "@/lib/supabase-admin";

async function loadOrder(orderId: string) {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("id, pet_name, customer_email")
    .eq("id", orderId)
    .maybeSingle();
  if (error || !data) return { order: null, error: error?.message || "Order not found." };
  return { order: data, error: "" };
}

export async function recordShipmentLink(input: { orderId: string; trackingUrl: string; actor: string }) {
  const link = safeTrackingUrl(input.trackingUrl);
  if (!link) return { ok: false as const, error: "Paste a tracking link that starts with http:// or https://." };

  const { order, error } = await loadOrder(input.orderId);
  if (!order) return { ok: false as const, error };
  const workflow = await workflowFor(input.orderId);
  if (!workflow || (workflow.status !== "final_approval" && workflow.status !== "shipped")) {
    return { ok: false as const, error: "A tracking link can be saved after the customer approves the picture." };
  }
  if (!workflow.approved_update_id) {
    return { ok: false as const, error: "The approved picture is not locked yet." };
  }
  if (workflow.tracking_url && safeTrackingUrl(workflow.tracking_url) === link) {
    return { ok: true as const, updated: false };
  }

  const savedAt = new Date().toISOString();
  const firstLink = workflow.status === "final_approval";
  const saved = await saveWorkflow(input.orderId, workflow.status, {
    status: "shipped",
    tracking_url: link,
    tracking_saved_by: input.actor,
    tracking_saved_at: savedAt,
  });
  if (!saved) return { ok: false as const, error: "This tracking link could not be saved. Refresh and try again." };

  await recordEvent({
    order_id: input.orderId,
    actor: input.actor,
    action: firstLink ? "tracking_saved" : "tracking_updated",
    detail: link,
  });

  if (order.customer_email) {
    try {
      await notifyShipped({
        orderId: input.orderId,
        to: order.customer_email,
        petName: order.pet_name || "",
        trackingUrl: link,
        eventKey: firstLink ? undefined : `shipped-update:${input.orderId}:${Date.now()}`,
      });
    } catch (err) {
      console.error("Shipped email error:", err);
    }
  }

  return { ok: true as const, updated: true };
}

export async function recordDelivery(input: { orderId: string; actor: string }) {
  const { order, error } = await loadOrder(input.orderId);
  if (!order) return { ok: false as const, error };
  const workflow = await workflowFor(input.orderId);
  if (!workflow || workflow.status !== "shipped") {
    return { ok: false as const, error: "Mark delivered only after the tracking link is saved." };
  }
  if (!safeTrackingUrl(workflow.tracking_url)) {
    return { ok: false as const, error: "Add the tracking link before marking this delivered." };
  }

  const deliveredAt = new Date().toISOString();
  const saved = await saveWorkflow(input.orderId, "shipped", {
    status: "delivered",
    delivered_at: deliveredAt,
    delivered_by: input.actor,
  });
  if (!saved) return { ok: false as const, error: "This order could not be marked delivered. Refresh and try again." };

  await recordEvent({
    order_id: input.orderId,
    actor: input.actor,
    action: "delivered",
    detail: "Delivery confirmed by shipment.",
  });

  if (order.customer_email) {
    try {
      await notifyDelivered({
        orderId: input.orderId,
        to: order.customer_email,
        petName: order.pet_name || "",
        trackingUrl: workflow.tracking_url || "",
      });
    } catch (err) {
      console.error("Delivered email error:", err);
    }
  }

  return { ok: true as const };
}
