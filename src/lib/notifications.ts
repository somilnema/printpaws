import {
  sendArtworkApprovedEmail,
  sendDeliveredEmail,
  sendOrderEmail,
  sendOverdueEmail,
  sendPreviewReadyEmail,
  sendRevisionReceivedEmail,
  sendRevisionRequestedEmail,
  sendShippedEmail,
  sendShipmentQueuedEmail,
  sendArtistAssignedEmail,
} from "@/lib/mailer";
import { emailByKey, findArtistById, saveEmailLog } from "@/lib/portal-db";
import { supabaseAdmin } from "@/lib/supabase-admin";

const ATTEMPTS_PER_SEND = 3;

function errorText(error: unknown) {
  if (!error) return "Email could not be sent.";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "message" in error) return String((error as { message: unknown }).message);
  return "Email could not be sent.";
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendTracked(input: {
  orderId?: string | null;
  eventKey: string;
  eventType: string;
  to: string;
  subject: string;
  html?: string;
  send: () => Promise<{ success: boolean; error?: unknown; subject?: string }>;
}) {
  if (!input.to) return { ok: false as const, error: "Missing recipient" };
  const existing = await emailByKey(input.eventKey);
  if (existing?.status === "sent") return { ok: true as const, alreadySent: true };

  let attempts = existing?.attempt_count ?? 0;
  let lastError = "";
  for (let tryIndex = 0; tryIndex < ATTEMPTS_PER_SEND; tryIndex += 1) {
    attempts += 1;
    try {
      const result = await input.send();
      if (result.success) {
        await saveEmailLog({
          order_id: input.orderId,
          event_key: input.eventKey,
          event_type: input.eventType,
          recipient: input.to,
          subject: result.subject || input.subject,
          status: "sent",
          attempt_count: attempts,
          last_error: null,
          sent_at: new Date().toISOString(),
        });
        return { ok: true as const, alreadySent: false };
      }
      lastError = errorText(result.error);
    } catch (error) {
      lastError = errorText(error);
    }
    if (tryIndex < ATTEMPTS_PER_SEND - 1) await sleep(400 * (tryIndex + 1));
  }

  await saveEmailLog({
    order_id: input.orderId,
    event_key: input.eventKey,
    event_type: input.eventType,
    recipient: input.to,
    subject: input.subject,
    status: "failed",
    attempt_count: attempts,
    last_error: lastError,
  });
  return { ok: false as const, error: lastError };
}

export async function notifyPreviewReady(input: {
  orderId: string;
  updateId: string;
  to: string;
  petName: string;
  previewUrl: string;
  revised: boolean;
}) {
  const subject = input.revised
    ? `Updated preview for ${input.petName || "your portrait"}`
    : `Your ${input.petName || "portrait"} preview is ready`;
  return sendTracked({
    orderId: input.orderId,
    eventKey: `preview_ready:${input.updateId}`,
    eventType: input.revised ? "revised_preview_ready" : "preview_ready",
    to: input.to,
    subject,
    send: () =>
      sendPreviewReadyEmail({
        to: input.to,
        petName: input.petName,
        previewUrl: input.previewUrl,
        revised: input.revised,
      }),
  });
}

export async function notifyRevisionReceived(input: {
  orderId: string;
  updateId: string;
  to: string;
  petName: string;
  note: string;
  round: number;
}) {
  const subject = `We received your changes for ${input.petName || "your portrait"}`;
  return sendTracked({
    orderId: input.orderId,
    eventKey: `revision_received:${input.updateId}`,
    eventType: "revision_received",
    to: input.to,
    subject,
    send: () => sendRevisionReceivedEmail({ to: input.to, petName: input.petName, note: input.note, round: input.round }),
  });
}

export async function notifyArtistRevision(input: {
  orderId: string;
  updateId: string;
  to: string;
  artistName: string;
  petName: string;
  note: string;
  portalUrl: string;
}) {
  const subject = `Revision requested: ${input.petName || "Peternity order"}`;
  return sendTracked({
    orderId: input.orderId,
    eventKey: `revision_artist:${input.updateId}`,
    eventType: "revision_for_artist",
    to: input.to,
    subject,
    send: () =>
      sendRevisionRequestedEmail({
        to: input.to,
        artistName: input.artistName,
        petName: input.petName,
        note: input.note,
        portalUrl: input.portalUrl,
      }),
  });
}

export async function notifyArtworkApproved(input: { orderId: string; updateId: string; to: string; petName: string }) {
  const subject = `${input.petName || "Your portrait"} is approved`;
  return sendTracked({
    orderId: input.orderId,
    eventKey: `artwork_approved:${input.updateId}`,
    eventType: "artwork_approved",
    to: input.to,
    subject,
    send: () => sendArtworkApprovedEmail({ to: input.to, petName: input.petName }),
  });
}

export async function notifyShipmentQueued(input: {
  orderId: string;
  to: string;
  petName: string;
  portalUrl: string;
}) {
  const subject = `Ready to ship: ${input.petName || "Peternity order"}`;
  return sendTracked({
    orderId: input.orderId,
    eventKey: `shipment_queued:${input.orderId}`,
    eventType: "shipment_queued",
    to: input.to,
    subject,
    send: () =>
      sendShipmentQueuedEmail({
        to: input.to,
        petName: input.petName,
        orderId: input.orderId,
        portalUrl: input.portalUrl,
      }),
  });
}

export async function notifyShipped(input: {
  orderId: string;
  to: string;
  petName: string;
  trackingUrl: string;
  eventKey?: string;
}) {
  const subject = `Your ${input.petName || "portrait"} has shipped`;
  return sendTracked({
    orderId: input.orderId,
    eventKey: input.eventKey || `shipped:${input.orderId}`,
    eventType: "shipped",
    to: input.to,
    subject,
    send: () => sendShippedEmail({ to: input.to, petName: input.petName, trackingUrl: input.trackingUrl }),
  });
}

export async function notifyDelivered(input: {
  orderId: string;
  to: string;
  petName: string;
  trackingUrl?: string;
}) {
  const subject = `${input.petName || "Your portrait"} has been delivered`;
  return sendTracked({
    orderId: input.orderId,
    eventKey: `delivered:${input.orderId}`,
    eventType: "delivered",
    to: input.to,
    subject,
    send: () => sendDeliveredEmail({ to: input.to, petName: input.petName, trackingUrl: input.trackingUrl }),
  });
}

export async function notifyArtistAssigned(input: {
  orderId: string;
  artistId: string;
  to: string;
  artistName: string;
  petName: string;
  portalUrl: string;
}) {
  const subject = `New portrait assigned: ${input.petName || "Peternity order"}`;
  return sendTracked({
    orderId: input.orderId,
    eventKey: `artist_assigned:${input.orderId}:${input.artistId}`,
    eventType: "artist_assigned",
    to: input.to,
    subject,
    send: () =>
      sendArtistAssignedEmail({
        to: input.to,
        artistName: input.artistName,
        petName: input.petName,
        orderId: input.orderId,
        portalUrl: input.portalUrl,
      }),
  });
}

export async function notifyOverdue(input: {
  orderId: string;
  dueAt: string;
  audience: "artist" | "admin";
  to: string;
  artistName: string;
  petName: string;
  dueLabel: string;
  portalUrl: string;
}) {
  const subject = input.audience === "artist" ? `Artwork overdue: ${input.petName || "Peternity order"}` : `Overdue artwork: ${input.petName || "Peternity order"}`;
  return sendTracked({
    orderId: input.orderId,
    eventKey: `overdue_${input.audience}:${input.orderId}:${input.dueAt}`,
    eventType: input.audience === "artist" ? "overdue_artist" : "overdue_admin",
    to: input.to,
    subject,
    send: () =>
      sendOverdueEmail({
        to: input.to,
        audience: input.audience,
        artistName: input.artistName,
        petName: input.petName,
        orderId: input.orderId,
        dueLabel: input.dueLabel,
        portalUrl: input.portalUrl,
      }),
  });
}

export async function notifyOrderConfirmed(order: { id?: string; customer_email?: string; [key: string]: unknown }) {
  const orderId = String(order.id || "");
  const to = String(order.customer_email || "");
  const subject = `Order confirmed ${orderId.slice(0, 8).toUpperCase()}`;
  return sendTracked({
    orderId,
    eventKey: `order_confirmed:${orderId}`,
    eventType: "order_confirmed",
    to,
    subject,
    send: () => sendOrderEmail(order),
  });
}

export async function recordOrderConfirmation(order: { id?: string; customer_email?: string }, result: { success?: boolean; error?: unknown }) {
  const orderId = String(order.id || "");
  const to = String(order.customer_email || "");
  if (!orderId || !to) return;
  const subject = `Order confirmed ${orderId.slice(0, 8).toUpperCase()}`;
  await saveEmailLog({
    order_id: orderId,
    event_key: `order_confirmed:${orderId}`,
    event_type: "order_confirmed",
    recipient: to,
    subject,
    status: result.success ? "sent" : "failed",
    attempt_count: 1,
    last_error: result.success ? null : errorText(result.error),
    sent_at: result.success ? new Date().toISOString() : null,
  });
}

export async function retryEmail(eventKey: string) {
  const row = await emailByKey(eventKey);
  if (!row) return { ok: false as const, error: "That email is not in the log." };
  if (row.status === "sent") return { ok: true as const, alreadySent: true };
  if (!row.order_id) return { ok: false as const, error: "This email is not tied to an order." };

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select("id, pet_name, customer_email, customer_name, customer_phone, size, frame_style, num_pets, background, font, addon, gift_wrap, total_price, photo_url, payment_mode, coupon_code, online_paid, cod_due, shipping_address, shipping_city, shipping_state, shipping_pincode")
    .eq("id", row.order_id)
    .maybeSingle();
  if (error || !order) return { ok: false as const, error: error?.message || "Order not found." };

  if (row.event_type === "order_confirmed") {
    return sendTracked({
      orderId: order.id,
      eventKey,
      eventType: row.event_type,
      to: row.recipient,
      subject: row.subject,
      send: () => sendOrderEmail(order),
    });
  }

  if (row.event_type === "preview_ready" || row.event_type === "revised_preview_ready") {
    const updateId = eventKey.split(":")[1] || "";
    const { data: version } = await supabaseAdmin
      .from("artwork_versions")
      .select("image_url")
      .eq("id", updateId)
      .maybeSingle();
    return notifyPreviewReady({
      orderId: order.id,
      updateId,
      to: row.recipient,
      petName: order.pet_name || "",
      previewUrl: version?.image_url || "",
      revised: row.event_type === "revised_preview_ready",
    });
  }

  if (row.event_type === "revision_received") {
    const updateId = eventKey.split(":")[1] || "";
    const [{ data: version }, { data: workflow }] = await Promise.all([
      supabaseAdmin.from("artwork_versions").select("note").eq("id", updateId).maybeSingle(),
      supabaseAdmin.from("order_workflow").select("revision_count").eq("order_id", order.id).maybeSingle(),
    ]);
    return notifyRevisionReceived({
      orderId: order.id,
      updateId,
      to: row.recipient,
      petName: order.pet_name || "",
      note: version?.note || "",
      round: Number(workflow?.revision_count || 1),
    });
  }

  if (row.event_type === "shipment_queued") {
    return notifyShipmentQueued({
      orderId: order.id,
      to: row.recipient,
      petName: order.pet_name || "",
      portalUrl: "",
    });
  }

  if (row.event_type === "shipped") {
    const { data: workflow } = await supabaseAdmin.from("order_workflow").select("tracking_url").eq("order_id", order.id).maybeSingle();
    if (!workflow?.tracking_url) return { ok: false as const, error: "This order has no shipment link to send." };
    return notifyShipped({
      orderId: order.id,
      to: row.recipient,
      petName: order.pet_name || "",
      trackingUrl: workflow.tracking_url,
    });
  }

  if (row.event_type === "artwork_approved") {
    const updateId = eventKey.split(":")[1] || order.id;
    return notifyArtworkApproved({
      orderId: order.id,
      updateId,
      to: row.recipient,
      petName: order.pet_name || "",
    });
  }

  if (row.event_type === "delivered") {
    const { data: workflow } = await supabaseAdmin.from("order_workflow").select("tracking_url").eq("order_id", order.id).maybeSingle();
    return notifyDelivered({
      orderId: order.id,
      to: row.recipient,
      petName: order.pet_name || "",
      trackingUrl: workflow?.tracking_url || "",
    });
  }

  if (row.event_type === "artist_assigned") {
    const artistId = eventKey.split(":")[2] || "";
    const artist = await findArtistById(artistId);
    if (!artist?.email) return { ok: false as const, error: "The artist account for this email no longer exists." };
    return notifyArtistAssigned({
      orderId: order.id,
      artistId,
      to: artist.email,
      artistName: artist.name || "",
      petName: order.pet_name || "",
      portalUrl: "",
    });
  }

  if (row.event_type === "overdue_artist" || row.event_type === "overdue_admin") {
    const dueAt = eventKey.split(":").slice(2).join(":");
    const { data: workflow } = await supabaseAdmin
      .from("order_workflow")
      .select("artist_id, due_at")
      .eq("order_id", order.id)
      .maybeSingle();
    const artist = workflow?.artist_id ? await findArtistById(workflow.artist_id) : null;
    const dueLabel = new Date(dueAt || workflow?.due_at || "").toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });
    return notifyOverdue({
      orderId: order.id,
      dueAt: dueAt || String(workflow?.due_at || ""),
      audience: row.event_type === "overdue_artist" ? "artist" : "admin",
      to: row.recipient,
      artistName: artist?.name || "",
      petName: order.pet_name || "",
      dueLabel,
      portalUrl: "",
    });
  }

  if (row.event_type === "revision_for_artist") {
    const updateId = eventKey.split(":")[1] || "";
    const { data: version } = await supabaseAdmin.from("artwork_versions").select("note").eq("id", updateId).maybeSingle();
    const artist = row.recipient ? { email: row.recipient, name: "" } : null;
    if (!artist?.email) return { ok: false as const, error: "This revision email has no recipient." };
    return notifyArtistRevision({
      orderId: order.id,
      updateId,
      to: artist.email,
      artistName: "",
      petName: order.pet_name || "",
      note: version?.note || "",
      portalUrl: "",
    });
  }

  return { ok: false as const, error: "This email cannot be retried from the log. It is kept here so you can see that it failed." };
}
