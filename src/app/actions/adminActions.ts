"use server";

import { randomUUID } from "crypto";
import { headers } from "next/headers";
import { getAdminSession } from "@/lib/admin-auth";
import {
  adminCanAssign,
  adminCanCancel,
  adminCanHold,
  artworkIsOpen,
  isOverdue,
  maximumDueAt,
  type OrderUpdate,
} from "@/lib/fulfillment";
import { notifyArtistAssigned, notifyOrderConfirmed, retryEmail } from "@/lib/notifications";
import { sendOverdueReminders } from "@/lib/overdue";
import { hashPassword } from "@/lib/passwords";
import {
  derivedWorkflow,
  emailLogFor,
  ensureWorkflow,
  eventsFor,
  findArtistById,
  insertArtist,
  insertShipper,
  latestVendorAttempts,
  listArtists,
  listShippers,
  notesFor,
  recordEvent,
  saveWorkflow,
  SETUP_MESSAGE,
  updatesFor,
  workflowFor,
  workflowsFor,
  type EmailLogRow,
  type OrderEvent,
  type OrderWorkflow,
  type TeamNote,
  type VendorAttempt,
} from "@/lib/portal-db";
import { acceptLatestForShipment } from "@/app/actions/trackActions";
import { storedPetPhotoUrl } from "@/lib/pet-photo";
import { supabaseAdmin } from "@/lib/supabase-admin";

export type AdminOrder = {
  id?: string;
  pet_name?: string;
  customer_email?: string;
  customer_name?: string;
  customer_phone?: string;
  size?: string;
  frame_style?: string;
  num_pets?: string | number;
  background?: string;
  font?: string;
  addon?: string;
  gift_wrap?: boolean;
  total_price?: string | number;
  photo_url?: string;
  created_at?: string;
  coupon_code?: string | null;
  payment_mode?: string;
  online_paid?: string | number;
  cod_due?: string | number;
  status?: string;
  shipping_address?: string;
  shipping_landmark?: string | null;
  shipping_city?: string | null;
  shipping_state?: string | null;
  shipping_pincode?: string | null;
  artist_id?: string | null;
  fulfillment_stage?: string | null;
  tracking_url?: string | null;
  tracking_saved_by?: string | null;
  tracking_saved_at?: string | null;
  due_at?: string | null;
  sla_started_at?: string | null;
  extension_reason?: string | null;
  revision_count?: number;
  approved_update_id?: string | null;
  approved_at?: string | null;
  approved_by?: string | null;
  needs_decision?: boolean;
  hold_reason?: string | null;
  cancel_reason?: string | null;
  delivered_at?: string | null;
  delivered_by?: string | null;
  overdue?: boolean;
  memorial_text?: string | null;
  updates?: OrderUpdate[];
  events?: OrderEvent[];
  emails?: EmailLogRow[];
  teamNotes?: TeamNote[];
  vendor?: VendorAttempt | null;
};

export type ArtistAccount = {
  id: string;
  name: string;
  email: string;
  created_at?: string;
};

export type RevenuePoint = {
  date: string;
  label: string;
  revenue: number;
  orders: number;
};

export type AdminDashboard = {
  user: string;
  warning?: string;
  stats: {
    totalRevenue: number;
    totalOrders: number;
    averageOrder: number;
    monthRevenue: number;
    monthOrders: number;
    todayRevenue: number;
    todayOrders: number;
  };
  chart: RevenuePoint[];
  orders: AdminOrder[];
  artists: ArtistAccount[];
  shippers: ArtistAccount[];
  workload: { id: string; name: string; open: number; overdue: number }[];
};

function parsePrice(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const n = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function dateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function buildDashboard(
  user: string,
  orders: AdminOrder[],
  artists: ArtistAccount[],
  shippers: ArtistAccount[],
  warning?: string
): AdminDashboard {
  const now = new Date();
  const today = startOfDay(now);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const dayCount = 14;
  const chartStart = startOfDay(new Date(today.getTime() - (dayCount - 1) * 86400000));

  const chartMap = new Map<string, RevenuePoint>();
  for (let i = 0; i < dayCount; i++) {
    const d = new Date(chartStart.getTime() + i * 86400000);
    const key = dateKey(d);
    chartMap.set(key, {
      date: key,
      label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      revenue: 0,
      orders: 0,
    });
  }

  let totalRevenue = 0;
  let monthRevenue = 0;
  let monthOrders = 0;
  let todayRevenue = 0;
  let todayOrders = 0;

  for (const order of orders) {
    const amount = parsePrice(order.total_price);
    totalRevenue += amount;
    const created = order.created_at ? new Date(order.created_at) : null;
    if (created && created >= monthStart) {
      monthRevenue += amount;
      monthOrders += 1;
    }
    if (created && created >= today) {
      todayRevenue += amount;
      todayOrders += 1;
    }
    if (created) {
      const key = dateKey(created);
      const point = chartMap.get(key);
      if (point) {
        point.revenue += amount;
        point.orders += 1;
      }
    }
  }

  const workload = artists.map((artist) => {
    const assigned = orders.filter((order) => order.artist_id === artist.id && order.fulfillment_stage !== "cancelled");
    return {
      id: artist.id,
      name: artist.name,
      open: assigned.filter((order) => artworkIsOpen(order.fulfillment_stage) || order.fulfillment_stage === "final_approval").length,
      overdue: assigned.filter((order) => order.overdue).length,
    };
  });

  return {
    user,
    warning,
    stats: {
      totalRevenue,
      totalOrders: orders.length,
      averageOrder: orders.length ? totalRevenue / orders.length : 0,
      monthRevenue,
      monthOrders,
      todayRevenue,
      todayOrders,
    },
    chart: Array.from(chartMap.values()),
    orders,
    artists,
    shippers,
    workload,
  };
}

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

async function loadOrders(): Promise<{ orders: AdminOrder[]; warning?: string }> {
  const pageSize = 1000;
  const orders: AdminOrder[] = [];

  for (let from = 0; from < 10000; from += pageSize) {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, from + pageSize - 1);

    if (error) {
      console.error("Admin orders fetch error:", error);
      return {
        orders,
        warning: orders.length ? `${error.message} Showing ${orders.length} orders.` : error.message,
      };
    }

    const batch = (data as AdminOrder[]) ?? [];
    orders.push(...batch);
    if (batch.length < pageSize) return { orders };
  }

  return { orders, warning: "Showing the latest 10,000 orders." };
}

function applyWorkflow(order: AdminOrder, workflow: OrderWorkflow | undefined): AdminOrder {
  const resolved = workflow ?? (order.id ? derivedWorkflow({ id: order.id, photo_url: order.photo_url, created_at: order.created_at }) : null);
  return {
    ...order,
    artist_id: resolved?.artist_id ?? null,
    fulfillment_stage: resolved?.status ?? "ready_for_artwork",
    tracking_url: resolved?.tracking_url ?? null,
    tracking_saved_by: resolved?.tracking_saved_by ?? null,
    tracking_saved_at: resolved?.tracking_saved_at ?? null,
    due_at: resolved?.due_at ?? null,
    sla_started_at: resolved?.sla_started_at ?? null,
    extension_reason: resolved?.extension_reason ?? null,
    revision_count: resolved?.revision_count ?? 0,
    approved_update_id: resolved?.approved_update_id ?? null,
    approved_at: resolved?.approved_at ?? null,
    approved_by: resolved?.approved_by ?? null,
    needs_decision: resolved?.needs_decision ?? false,
    hold_reason: resolved?.hold_reason ?? null,
    cancel_reason: resolved?.cancel_reason ?? null,
    delivered_at: resolved?.delivered_at ?? null,
    delivered_by: resolved?.delivered_by ?? null,
    overdue: isOverdue(resolved?.status, resolved?.due_at),
  };
}

export async function getAdminDashboard(): Promise<AdminDashboard | null> {
  try {
    const session = await getAdminSession();
    if (!session) return null;
    await sendOverdueReminders().catch((error) => console.error("Overdue reminder error:", error));
    const { orders, warning } = await loadOrders();
    const ids = orders.map((order) => order.id).filter((id): id is string => !!id);
    const [{ map: portals, missing }, updates, events, emails, artists, shippers, teamNotes, vendorAttempts] = await Promise.all([
      workflowsFor(ids),
      updatesFor(ids),
      eventsFor(ids),
      emailLogFor(ids),
      listArtists(),
      listShippers(),
      notesFor(ids),
      latestVendorAttempts(ids),
    ]);
    const byOrder = new Map<string, OrderUpdate[]>();
    for (const update of updates) {
      const list = byOrder.get(update.order_id) ?? [];
      list.push(update);
      byOrder.set(update.order_id, list);
    }
    const eventsByOrder = new Map<string, OrderEvent[]>();
    for (const event of events) {
      const list = eventsByOrder.get(event.order_id) ?? [];
      list.push(event);
      eventsByOrder.set(event.order_id, list);
    }
    const emailsByOrder = new Map<string, EmailLogRow[]>();
    for (const email of emails) {
      if (!email.order_id) continue;
      const list = emailsByOrder.get(email.order_id) ?? [];
      list.push(email);
      emailsByOrder.set(email.order_id, list);
    }

    const notesByOrder = new Map<string, TeamNote[]>();
    for (const note of teamNotes) {
      const list = notesByOrder.get(note.order_id) ?? [];
      list.push(note);
      notesByOrder.set(note.order_id, list);
    }
    const vendorByOrder = new Map(vendorAttempts.map((attempt) => [attempt.order_id, attempt]));

    const withHistory = orders.map((order) => ({
      ...applyWorkflow(order, order.id ? portals.get(order.id) : undefined),
      updates: order.id ? byOrder.get(order.id) ?? [] : [],
      events: order.id ? eventsByOrder.get(order.id) ?? [] : [],
      emails: order.id ? emailsByOrder.get(order.id) ?? [] : [],
      teamNotes: order.id ? notesByOrder.get(order.id) ?? [] : [],
      vendor: order.id ? vendorByOrder.get(order.id) ?? null : null,
    }));

    return buildDashboard(session.user, withHistory, artists, shippers, missing ? SETUP_MESSAGE : warning);
  } catch (err) {
    console.error("Admin dashboard error:", err);
    return null;
  }
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function createArtist(input: { name: string; email: string; password: string }) {
  const session = await getAdminSession();
  if (!session) return { ok: false as const, error: "Sign in again to continue." };

  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;
  if (!name) return { ok: false as const, error: "Enter the artist's name." };
  if (!isEmail(email)) return { ok: false as const, error: "Enter a valid artist email." };
  if (password.length < 8) return { ok: false as const, error: "Use a password of at least 8 characters." };

  const password_hash = await hashPassword(password);
  const created = await insertArtist({ name, email, password_hash });
  if (!created.ok) return created;
  return { ok: true as const };
}

export async function createShipper(input: { name: string; email: string; password: string }) {
  const session = await getAdminSession();
  if (!session) return { ok: false as const, error: "Sign in again to continue." };

  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;
  if (!name) return { ok: false as const, error: "Enter the person's name." };
  if (!isEmail(email)) return { ok: false as const, error: "Enter a valid email." };
  if (password.length < 8) return { ok: false as const, error: "Use a password of at least 8 characters." };

  const password_hash = await hashPassword(password);
  const created = await insertShipper({ name, email, password_hash });
  if (!created.ok) return created;
  return { ok: true as const };
}

async function loadOrder(orderId: string) {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("id, pet_name, customer_email, photo_url, created_at")
    .eq("id", orderId)
    .maybeSingle();
  if (error || !data) return { order: null, error: error?.message || "Order not found." };
  return { order: data, error: "" };
}

export async function assignOrderToArtist(orderId: string, artistId: string) {
  const session = await getAdminSession();
  if (!session) return { ok: false as const, error: "Sign in again to continue." };
  if (!orderId || !artistId) return { ok: false as const, error: "Choose an artist for this order." };

  const { order, error: orderError } = await loadOrder(orderId);
  const artist = await findArtistById(artistId);
  if (!order) return { ok: false as const, error: orderError };
  if (!order.photo_url) return { ok: false as const, error: "This order is still waiting for a pet photo, so the artwork clock has not started." };
  if (!artist?.email) return { ok: false as const, error: "Artist not found." };

  const workflow = await ensureWorkflow(order);
  if (!adminCanAssign(workflow.status)) {
    return { ok: false as const, error: "The artist can only be changed before the picture is approved." };
  }

  const nextStatus = workflow.status === "ready_for_artwork" ? "artwork_in_progress" : workflow.status;
  const saved = await saveWorkflow(orderId, workflow.status, {
    artist_id: artistId,
    status: nextStatus,
  });
  if (!saved) return { ok: false as const, error: "This order could not be assigned. Refresh and try again." };

  await recordEvent({
    order_id: orderId,
    actor: session.user,
    action: workflow.artist_id ? "artist_reassigned" : "artist_assigned",
    detail: `${artist.name} (${artist.email})`,
  });

  const origin = await portalOrigin();
  try {
    await notifyArtistAssigned({
      orderId,
      artistId,
      to: artist.email,
      artistName: artist.name || "",
      petName: order.pet_name || "",
      portalUrl: origin ? `${origin}/artist` : "",
    });
  } catch (err) {
    console.error("Assign email error:", err);
  }

  return { ok: true as const };
}

export async function extendArtworkDeadline(orderId: string, dueAt: string, reason: string) {
  const session = await getAdminSession();
  if (!session) return { ok: false as const, error: "Sign in again to continue." };
  const trimmed = reason.trim();
  if (!trimmed) return { ok: false as const, error: "Write the reason for the extension." };
  if (trimmed.length > 500) return { ok: false as const, error: "Keep the reason under 500 characters." };

  const nextDue = new Date(dueAt);
  if (Number.isNaN(nextDue.getTime())) return { ok: false as const, error: "Choose a valid deadline." };

  const { order, error } = await loadOrder(orderId);
  if (!order) return { ok: false as const, error };
  const workflow = await ensureWorkflow(order);
  if (!workflow.sla_started_at || !workflow.due_at) {
    return { ok: false as const, error: "The 48-hour clock has not started because the pet photo is not saved." };
  }
  if (!artworkIsOpen(workflow.status)) {
    return { ok: false as const, error: "The artwork deadline can only be extended while the picture is still being made." };
  }

  const cap = new Date(maximumDueAt(workflow.sla_started_at));
  const current = new Date(workflow.due_at);
  if (nextDue.getTime() <= current.getTime()) {
    return { ok: false as const, error: "The new deadline has to be later than the current one." };
  }
  if (nextDue.getTime() > cap.getTime()) {
    return { ok: false as const, error: "The deadline cannot go past 72 hours from when the photo and details were ready." };
  }

  const saved = await saveWorkflow(orderId, workflow.status, {
    due_at: nextDue.toISOString(),
    extension_reason: trimmed,
    extended_by: session.user,
    extended_at: new Date().toISOString(),
  });
  if (!saved) return { ok: false as const, error: "The deadline could not be extended. Refresh and try again." };

  await recordEvent({
    order_id: orderId,
    actor: session.user,
    action: "deadline_extended",
    detail: `${trimmed} New deadline: ${nextDue.toISOString()}`,
  });
  return { ok: true as const };
}

export async function holdOrder(orderId: string, reason: string) {
  const session = await getAdminSession();
  if (!session) return { ok: false as const, error: "Sign in again to continue." };
  const trimmed = reason.trim();
  if (!trimmed) return { ok: false as const, error: "Write why this order is on hold." };
  const { order, error } = await loadOrder(orderId);
  if (!order) return { ok: false as const, error };
  const workflow = await ensureWorkflow(order);
  if (!adminCanHold(workflow.status)) {
    return { ok: false as const, error: "This order cannot be put on hold from its current status." };
  }
  const saved = await saveWorkflow(orderId, workflow.status, {
    status: "on_hold",
    status_before_hold: workflow.status,
    hold_reason: trimmed,
  });
  if (!saved) return { ok: false as const, error: "This order could not be put on hold. Refresh and try again." };
  await recordEvent({ order_id: orderId, actor: session.user, action: "on_hold", detail: trimmed });
  return { ok: true as const };
}

export async function resumeOrder(orderId: string) {
  const session = await getAdminSession();
  if (!session) return { ok: false as const, error: "Sign in again to continue." };
  const workflow = await workflowFor(orderId);
  if (!workflow || workflow.status !== "on_hold" || !workflow.status_before_hold) {
    return { ok: false as const, error: "This order is not on hold." };
  }
  const saved = await saveWorkflow(orderId, "on_hold", {
    status: workflow.status_before_hold as OrderWorkflow["status"],
    hold_reason: null,
    status_before_hold: null,
  });
  if (!saved) return { ok: false as const, error: "This order could not be resumed. Refresh and try again." };
  await recordEvent({
    order_id: orderId,
    actor: session.user,
    action: "resumed",
    detail: `Returned to ${workflow.status_before_hold}.`,
  });
  return { ok: true as const };
}

export async function cancelOrder(orderId: string, reason: string) {
  const session = await getAdminSession();
  if (!session) return { ok: false as const, error: "Sign in again to continue." };
  const trimmed = reason.trim();
  if (!trimmed) return { ok: false as const, error: "Write why this order is cancelled." };
  const { order, error } = await loadOrder(orderId);
  if (!order) return { ok: false as const, error };
  const workflow = await ensureWorkflow(order);
  if (!adminCanCancel(workflow.status)) {
    return { ok: false as const, error: "A shipped or delivered order stays as it is." };
  }
  const saved = await saveWorkflow(orderId, workflow.status, {
    status: "cancelled",
    cancel_reason: trimmed,
    needs_decision: false,
  });
  if (!saved) return { ok: false as const, error: "This order could not be cancelled. Refresh and try again." };
  await recordEvent({ order_id: orderId, actor: session.user, action: "cancelled", detail: trimmed });
  return { ok: true as const };
}

export async function acceptLatestArtwork(orderId: string) {
  const session = await getAdminSession();
  if (!session) return { ok: false as const, error: "Sign in again to continue." };
  const result = await acceptLatestForShipment(orderId, session.user);
  if (!result.ok) return result;
  return { ok: true as const };
}

export async function retryLoggedEmail(eventKey: string) {
  const session = await getAdminSession();
  if (!session) return { ok: false as const, error: "Sign in again to continue." };
  if (!eventKey) return { ok: false as const, error: "Missing email." };
  const result = await retryEmail(eventKey);
  if (!result.ok) return result;
  return { ok: true as const };
}

export type ManualOrderInput = {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  petName: string;
  portraitStyle: "framed" | "canvas";
  size: string;
  numPets: string;
  background: string;
  font: string;
  memorialText: string;
  addon: string;
  giftWrap: boolean;
  photoUrl: string;
  shippingAddress: string;
  shippingLandmark: string;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  totalPrice: number;
  paymentMode: "prepaid" | "partial";
  advancePaid: number;
  orderDate: string;
  sendEmail: boolean;
};

export async function createManualOrder(input: ManualOrderInput) {
  const session = await getAdminSession();
  if (!session) return { ok: false as const, error: "Sign in again to continue." };

  const customerName = input.customerName.trim();
  const customerPhone = input.customerPhone.trim();
  const customerEmail = input.customerEmail.trim().toLowerCase();
  const shippingAddress = input.shippingAddress.trim();
  const total = Number(input.totalPrice);
  const advance = Number(input.advancePaid) || 0;

  if (!customerName) return { ok: false as const, error: "Enter the customer's name." };
  if (customerPhone.replace(/\D/g, "").length < 10) return { ok: false as const, error: "Enter a valid 10-digit phone number." };
  if (customerEmail && !isEmail(customerEmail)) return { ok: false as const, error: "Enter a valid email or leave it empty." };
  if (!shippingAddress) return { ok: false as const, error: "Enter the shipping address." };
  if (!Number.isFinite(total) || total <= 0) return { ok: false as const, error: "Enter the order amount." };
  if (input.paymentMode === "partial" && (advance < 0 || advance > total)) {
    return { ok: false as const, error: "Advance paid has to be between 0 and the order amount." };
  }

  const placedAt = new Date(input.orderDate);
  if (Number.isNaN(placedAt.getTime())) return { ok: false as const, error: "Choose the order date." };
  if (placedAt.getTime() > Date.now() + 5 * 60 * 1000) return { ok: false as const, error: "The order date cannot be in the future." };

  const supabaseHost = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "")
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
  const photoUrl = storedPetPhotoUrl(input.photoUrl, supabaseHost);
  if (input.photoUrl.trim() && !photoUrl) return { ok: false as const, error: "The pet photo was not saved. Upload it again." };

  const partial = input.paymentMode === "partial";
  const row = {
    customer_name: customerName,
    customer_phone: customerPhone,
    customer_email: customerEmail,
    pet_name: input.petName.trim() || "Offline order",
    portrait_style: input.portraitStyle,
    frame_style: input.portraitStyle,
    size: input.size.trim(),
    num_pets: input.numPets || "one",
    background: input.background.trim(),
    font: input.font.trim(),
    memorial_text: input.memorialText.trim(),
    addon: input.addon.trim(),
    gift_wrap: !!input.giftWrap,
    photo_url: photoUrl,
    shipping_address: shippingAddress,
    shipping_landmark: input.shippingLandmark.trim(),
    shipping_city: input.shippingCity.trim(),
    shipping_state: input.shippingState.trim(),
    shipping_pincode: input.shippingPincode.trim(),
    total_price: total,
    discount_amount: 0,
    prepaid_discount: 0,
    payment_mode: partial ? "partial" : "prepaid",
    online_paid: partial ? advance : total,
    cod_due: partial ? total - advance : 0,
    status: partial ? "partial_paid" : "paid",
    razorpay_order_id: `offline_${randomUUID()}`,
    created_at: placedAt.toISOString(),
  };

  const { data, error } = await supabaseAdmin.from("orders").insert([row]).select("*").single();
  if (error || !data?.id) {
    console.error("Manual order insert error:", error);
    return { ok: false as const, error: error?.message || "The order could not be saved." };
  }
  const orderId = String(data.id);

  try {
    // The artwork clock starts now, not on the back-dated order date, so old offline orders are not instantly overdue.
    await ensureWorkflow({ id: orderId, photo_url: photoUrl, created_at: new Date().toISOString() });
  } catch (err) {
    console.error("Manual order workflow error:", err);
  }

  await recordEvent({
    order_id: orderId,
    actor: session.user,
    action: "offline_order_added",
    detail: `Order date ${placedAt.toISOString()}`,
  });

  if (input.sendEmail && customerEmail) {
    try {
      await notifyOrderConfirmed(data);
    } catch (err) {
      console.error("Manual order email error:", err);
    }
  }

  return { ok: true as const, orderId };
}

export async function refreshAdminDashboard(): Promise<AdminDashboard | null> {
  return getAdminDashboard();
}
