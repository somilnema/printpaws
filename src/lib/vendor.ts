import { safeTrackingUrl } from "@/lib/fulfillment";
import { OPERATIONS_MESSAGE, recordEvent, tableMissing, type VendorAttempt } from "@/lib/portal-db";
import { recordShipmentLink } from "@/lib/shipment-desk";
import { supabaseAdmin } from "@/lib/supabase-admin";

export type VendorSettingsView = {
  enabled: boolean;
  endpointUrl: string;
  hasKey: boolean;
  keyHint: string;
  missing: boolean;
};

type VendorRow = {
  enabled: boolean;
  endpoint_url: string;
  api_key: string;
};

function hint(key: string) {
  const trimmed = key.trim();
  if (trimmed.length < 4) return "";
  return `••••${trimmed.slice(-4)}`;
}

export function vendorEndpoint(value: string) {
  const url = value.trim();
  if (!url) return "";
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return "";
    return parsed.toString();
  } catch {
    return "";
  }
}

async function readSettings(): Promise<{ row: VendorRow | null; missing: boolean }> {
  const { data, error } = await supabaseAdmin
    .from("vendor_settings")
    .select("enabled, endpoint_url, api_key")
    .eq("id", 1)
    .maybeSingle();
  if (error) {
    if (tableMissing(error)) return { row: null, missing: true };
    throw error;
  }
  return { row: (data as VendorRow | null) ?? null, missing: false };
}

export async function getVendorSettings(): Promise<VendorSettingsView> {
  const { row, missing } = await readSettings();
  if (!row) {
    return { enabled: false, endpointUrl: "", hasKey: false, keyHint: "", missing };
  }
  return {
    enabled: Boolean(row.enabled),
    endpointUrl: row.endpoint_url || "",
    hasKey: Boolean(row.api_key),
    keyHint: hint(row.api_key || ""),
    missing,
  };
}

export async function saveVendorSettings(input: {
  enabled: boolean;
  endpointUrl: string;
  apiKey: string;
  actor: string;
}) {
  const endpoint = input.endpointUrl.trim();
  if (input.enabled && !vendorEndpoint(endpoint)) {
    return { ok: false as const, error: "The vendor address has to be an https link." };
  }
  if (endpoint && !vendorEndpoint(endpoint)) {
    return { ok: false as const, error: "The vendor address has to be an https link." };
  }

  const { row, missing } = await readSettings();
  if (missing) return { ok: false as const, error: OPERATIONS_MESSAGE };
  const nextKey = input.apiKey.trim() || row?.api_key || "";
  if (input.enabled && !nextKey) {
    return { ok: false as const, error: "Add the vendor API key before turning this on." };
  }

  const { error } = await supabaseAdmin.from("vendor_settings").upsert({
    id: 1,
    enabled: input.enabled,
    endpoint_url: vendorEndpoint(endpoint),
    api_key: nextKey,
    updated_at: new Date().toISOString(),
    updated_by: input.actor,
  });
  if (error) {
    if (tableMissing(error)) return { ok: false as const, error: OPERATIONS_MESSAGE };
    return { ok: false as const, error: error.message };
  }
  return { ok: true as const };
}

async function recordAttempt(input: {
  orderId: string;
  status: VendorAttempt["status"];
  trackingUrl?: string | null;
  error?: string | null;
  actor: string;
}) {
  const { error } = await supabaseAdmin.from("vendor_attempts").insert({
    order_id: input.orderId,
    status: input.status,
    tracking_url: input.trackingUrl || null,
    error: input.error || null,
    attempted_by: input.actor,
  });
  if (error && !tableMissing(error)) console.error("Vendor attempt log error:", error);
}

export async function sendOrderToVendor(input: { orderId: string; actor: string }) {
  const { row, missing } = await readSettings();
  if (missing) return { ok: false as const, error: OPERATIONS_MESSAGE, skipped: false };
  if (!row?.enabled) return { ok: true as const, skipped: true as const };
  const endpoint = vendorEndpoint(row.endpoint_url || "");
  if (!endpoint || !row.api_key) {
    return { ok: false as const, error: "The vendor API is on, but the address or key is missing.", skipped: false };
  }

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select(
      "id, pet_name, customer_name, customer_email, customer_phone, size, frame_style, addon, gift_wrap, memorial_text, total_price, payment_mode, cod_due, shipping_address, shipping_landmark, shipping_city, shipping_state, shipping_pincode"
    )
    .eq("id", input.orderId)
    .maybeSingle();
  if (error || !order) return { ok: false as const, error: error?.message || "Order not found.", skipped: false };

  const { data: workflow } = await supabaseAdmin
    .from("order_workflow")
    .select("status, approved_update_id, approved_at, tracking_url")
    .eq("order_id", input.orderId)
    .maybeSingle();
  if (!workflow?.approved_update_id || (workflow.status !== "final_approval" && workflow.status !== "shipped")) {
    return { ok: false as const, error: "Send an order to the vendor only after the picture is approved.", skipped: false };
  }

  const { data: version } = await supabaseAdmin
    .from("artwork_versions")
    .select("image_url")
    .eq("id", workflow.approved_update_id)
    .maybeSingle();

  const payload = {
    orderId: order.id,
    petName: order.pet_name || "",
    customer: {
      name: order.customer_name || "",
      email: order.customer_email || "",
      phone: order.customer_phone || "",
    },
    shipping: {
      address: order.shipping_address || "",
      landmark: order.shipping_landmark || "",
      city: order.shipping_city || "",
      state: order.shipping_state || "",
      pincode: order.shipping_pincode || "",
    },
    product: {
      size: order.size || "",
      frame: order.frame_style || "",
      addon: order.addon || "",
      giftWrap: Boolean(order.gift_wrap),
      memorialText: order.memorial_text || "",
    },
    payment: {
      mode: order.payment_mode || "",
      total: order.total_price || "",
      codDue: order.cod_due || 0,
    },
    approvedArtworkUrl: version?.image_url || "",
    approvedAt: workflow.approved_at || "",
  };

  let responseStatus = 0;
  let responseBody: unknown = null;
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${row.api_key}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });
    responseStatus = response.status;
    responseBody = await response.json().catch(() => null);
    if (!response.ok) {
      const message = `Vendor responded with ${response.status}.`;
      await recordAttempt({ orderId: input.orderId, status: "failed", error: message, actor: input.actor });
      await recordEvent({
        order_id: input.orderId,
        actor: input.actor,
        action: "vendor_failed",
        detail: message,
      });
      return { ok: false as const, error: `${message} The shipment desk can still paste the tracking link.`, skipped: false };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "The vendor could not be reached.";
    await recordAttempt({ orderId: input.orderId, status: "failed", error: message, actor: input.actor });
    await recordEvent({
      order_id: input.orderId,
      actor: input.actor,
      action: "vendor_failed",
      detail: message,
    });
    return { ok: false as const, error: `${message} The shipment desk can still paste the tracking link.`, skipped: false };
  }

  const record = responseBody && typeof responseBody === "object" ? (responseBody as Record<string, unknown>) : {};
  const tracking = safeTrackingUrl(String(record.trackingUrl || record.tracking_url || ""));
  await recordAttempt({
    orderId: input.orderId,
    status: "sent",
    trackingUrl: tracking || null,
    actor: input.actor,
  });
  await recordEvent({
    order_id: input.orderId,
    actor: input.actor,
    action: "vendor_sent",
    detail: tracking ? `Vendor accepted the order and returned ${tracking}` : `Vendor accepted the order (${responseStatus}). No tracking link yet.`,
  });

  if (tracking && safeTrackingUrl(workflow.tracking_url) !== tracking) {
    const saved = await recordShipmentLink({ orderId: input.orderId, trackingUrl: tracking, actor: "vendor" });
    if (!saved.ok) {
      return { ok: true as const, skipped: false as const, trackingSaved: false, warning: saved.error };
    }
    return { ok: true as const, skipped: false as const, trackingSaved: true };
  }

  return { ok: true as const, skipped: false as const, trackingSaved: false };
}
