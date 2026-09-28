import { randomUUID } from "crypto";
import {
  hasPetPhoto,
  initialDueAt,
  isWorkflowStatus,
  type OrderUpdate,
  type UpdateKind,
  type WorkflowStatus,
} from "@/lib/fulfillment";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const SETUP_MESSAGE =
  "The order system tables are not in Supabase yet. Open the Supabase SQL editor, run supabase/order-system.sql, then refresh.";

export const OPERATIONS_MESSAGE =
  "Private notes, email templates, and the vendor API are not in Supabase yet. Open the SQL editor, run supabase/operations.sql, then refresh.";

export type PortalArtist = {
  id: string;
  name: string;
  email: string;
  created_at: string;
};

export type OrderWorkflow = {
  order_id: string;
  status: WorkflowStatus;
  artist_id: string | null;
  sla_started_at: string | null;
  due_at: string | null;
  extension_reason: string | null;
  extended_by: string | null;
  extended_at: string | null;
  tracking_url: string | null;
  tracking_saved_by: string | null;
  tracking_saved_at: string | null;
  approved_update_id: string | null;
  approved_at: string | null;
  approved_by: string | null;
  revision_count: number;
  hold_reason: string | null;
  cancel_reason: string | null;
  status_before_hold: string | null;
  delivered_at: string | null;
  delivered_by: string | null;
  needs_decision: boolean;
};

export type OrderEvent = {
  id: string;
  order_id: string;
  actor: string;
  action: string;
  detail: string | null;
  created_at: string;
};

export type EmailLogRow = {
  id: string;
  order_id: string | null;
  event_key: string;
  event_type: string;
  recipient: string;
  subject: string;
  status: "sent" | "failed";
  attempt_count: number;
  last_error: string | null;
  created_at: string;
  sent_at: string | null;
};

type ArtistWithPassword = PortalArtist & { password_hash: string };

type DbError = { code?: string; message?: string } | null;

const WORKFLOW_COLUMNS =
  "order_id, status, artist_id, sla_started_at, due_at, extension_reason, extended_by, extended_at, tracking_url, tracking_saved_by, tracking_saved_at, approved_update_id, approved_at, approved_by, revision_count, hold_reason, cancel_reason, status_before_hold, delivered_at, delivered_by, needs_decision";

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function tableMissing(error: DbError) {
  if (!error) return false;
  return error.code === "42P01" || error.code === "PGRST205" || /does not exist|schema cache/i.test(error.message || "");
}

function asWorkflow(row: Partial<OrderWorkflow> & { order_id: string }): OrderWorkflow {
  const status = isWorkflowStatus(row.status) ? row.status : "ready_for_artwork";
  return {
    order_id: row.order_id,
    status,
    artist_id: row.artist_id ?? null,
    sla_started_at: row.sla_started_at ?? null,
    due_at: row.due_at ?? null,
    extension_reason: row.extension_reason ?? null,
    extended_by: row.extended_by ?? null,
    extended_at: row.extended_at ?? null,
    tracking_url: row.tracking_url ?? null,
    tracking_saved_by: row.tracking_saved_by ?? null,
    tracking_saved_at: row.tracking_saved_at ?? null,
    approved_update_id: row.approved_update_id ?? null,
    approved_at: row.approved_at ?? null,
    approved_by: row.approved_by ?? null,
    revision_count: Number(row.revision_count || 0),
    hold_reason: row.hold_reason ?? null,
    cancel_reason: row.cancel_reason ?? null,
    status_before_hold: row.status_before_hold ?? null,
    delivered_at: row.delivered_at ?? null,
    delivered_by: row.delivered_by ?? null,
    needs_decision: Boolean(row.needs_decision),
  };
}

export function derivedWorkflow(order: { id: string; photo_url?: string | null; created_at?: string | null }): OrderWorkflow {
  const created = order.created_at || new Date().toISOString();
  if (!hasPetPhoto(order.photo_url)) {
    return asWorkflow({ order_id: order.id, status: "awaiting_images" });
  }
  return asWorkflow({
    order_id: order.id,
    status: "ready_for_artwork",
    sla_started_at: created,
    due_at: initialDueAt(created),
  });
}

async function chunked<T>(ids: string[], load: (slice: string[]) => Promise<T[]>) {
  const rows: T[] = [];
  for (let index = 0; index < ids.length; index += 100) {
    rows.push(...(await load(ids.slice(index, index + 100))));
  }
  return rows;
}

export async function listArtists(): Promise<PortalArtist[]> {
  const { data, error } = await supabaseAdmin
    .from("artists")
    .select("id, name, email, created_at")
    .order("name", { ascending: true });
  if (error) {
    if (tableMissing(error)) return [];
    throw error;
  }
  return (data ?? []) as PortalArtist[];
}

export async function findArtistByEmail(email: string): Promise<ArtistWithPassword | null> {
  const { data, error } = await supabaseAdmin
    .from("artists")
    .select("id, name, email, password_hash, created_at")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();
  if (error) {
    if (tableMissing(error)) return null;
    throw error;
  }
  return (data as ArtistWithPassword | null) ?? null;
}

export async function findArtistById(id: string): Promise<PortalArtist | null> {
  const { data, error } = await supabaseAdmin
    .from("artists")
    .select("id, name, email, created_at")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    if (tableMissing(error)) return null;
    throw error;
  }
  return (data as PortalArtist | null) ?? null;
}

export async function listShippers(): Promise<PortalArtist[]> {
  const { data, error } = await supabaseAdmin
    .from("shippers")
    .select("id, name, email, created_at")
    .order("name", { ascending: true });
  if (error) {
    if (tableMissing(error)) return [];
    throw error;
  }
  return (data ?? []) as PortalArtist[];
}

export async function findShipperByEmail(email: string): Promise<ArtistWithPassword | null> {
  const { data, error } = await supabaseAdmin
    .from("shippers")
    .select("id, name, email, password_hash, created_at")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();
  if (error) {
    if (tableMissing(error)) return null;
    throw error;
  }
  return (data as ArtistWithPassword | null) ?? null;
}

export async function findShipperById(id: string): Promise<PortalArtist | null> {
  const { data, error } = await supabaseAdmin
    .from("shippers")
    .select("id, name, email, created_at")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    if (tableMissing(error)) return null;
    throw error;
  }
  return (data as PortalArtist | null) ?? null;
}

export async function insertShipper(input: { name: string; email: string; password_hash: string }) {
  const { data, error } = await supabaseAdmin
    .from("shippers")
    .insert({
      name: input.name,
      email: input.email.trim().toLowerCase(),
      password_hash: input.password_hash,
    })
    .select("id")
    .single();
  if (error) {
    if (tableMissing(error)) {
      return {
        ok: false as const,
        error: "Shipment accounts are not in Supabase yet. Open the SQL editor, run supabase/shipment-accounts.sql, then refresh.",
      };
    }
    if (/duplicate|unique/i.test(error.message)) {
      return { ok: false as const, error: "A shipment account with this email already exists." };
    }
    return { ok: false as const, error: error.message };
  }
  return { ok: true as const, id: String(data.id) };
}

export async function insertArtist(input: { name: string; email: string; password_hash: string }) {
  const { data, error } = await supabaseAdmin
    .from("artists")
    .insert({
      name: input.name,
      email: input.email.trim().toLowerCase(),
      password_hash: input.password_hash,
    })
    .select("id")
    .single();
  if (error) {
    if (tableMissing(error)) return { ok: false as const, error: SETUP_MESSAGE };
    if (/duplicate|unique/i.test(error.message)) {
      return { ok: false as const, error: "An artist with this email already exists." };
    }
    return { ok: false as const, error: error.message };
  }
  return { ok: true as const, id: String(data.id) };
}

export async function workflowFor(orderId: string): Promise<OrderWorkflow | null> {
  const { data, error } = await supabaseAdmin
    .from("order_workflow")
    .select(WORKFLOW_COLUMNS)
    .eq("order_id", orderId)
    .maybeSingle();
  if (error) {
    if (tableMissing(error)) return null;
    throw error;
  }
  return data ? asWorkflow(data as OrderWorkflow) : null;
}

export async function workflowsFor(orderIds: string[]) {
  const map = new Map<string, OrderWorkflow>();
  if (!orderIds.length) return { map, missing: false };
  try {
    const rows = await chunked(orderIds, async (slice) => {
      const { data, error } = await supabaseAdmin.from("order_workflow").select(WORKFLOW_COLUMNS).in("order_id", slice);
      if (error) throw error;
      return (data ?? []) as OrderWorkflow[];
    });
    for (const row of rows) map.set(row.order_id, asWorkflow(row));
    return { map, missing: false };
  } catch (error) {
    if (tableMissing(error as DbError)) return { map, missing: true };
    throw error;
  }
}

export async function workflowsInStatus(statuses: string[]) {
  if (!statuses.length) return { rows: [] as OrderWorkflow[], missing: false };
  const { data, error } = await supabaseAdmin.from("order_workflow").select(WORKFLOW_COLUMNS).in("status", statuses);
  if (error) {
    if (tableMissing(error)) return { rows: [] as OrderWorkflow[], missing: true };
    throw error;
  }
  return { rows: ((data ?? []) as OrderWorkflow[]).map(asWorkflow), missing: false };
}

export async function ordersForArtist(artistId: string) {
  const { data, error } = await supabaseAdmin
    .from("order_workflow")
    .select(WORKFLOW_COLUMNS)
    .eq("artist_id", artistId);
  if (error) {
    if (tableMissing(error)) return { rows: [] as OrderWorkflow[], missing: true };
    throw error;
  }
  return { rows: ((data ?? []) as OrderWorkflow[]).map(asWorkflow), missing: false };
}

export async function ensureWorkflow(order: { id: string; photo_url?: string | null; created_at?: string | null }) {
  const existing = await workflowFor(order.id);
  if (existing) return existing;
  const derived = derivedWorkflow(order);
  const { error } = await supabaseAdmin.from("order_workflow").insert({
    ...derived,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    if (tableMissing(error)) throw new Error(SETUP_MESSAGE);
    if (!/duplicate|unique/i.test(error.message)) throw error;
  }
  return (await workflowFor(order.id)) ?? derived;
}

export async function saveWorkflow(orderId: string, currentStatus: string, patch: Partial<OrderWorkflow>) {
  const next = {
    ...patch,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabaseAdmin
    .from("order_workflow")
    .update(next)
    .eq("order_id", orderId)
    .eq("status", currentStatus)
    .select("order_id")
    .maybeSingle();
  if (error) {
    if (tableMissing(error)) throw new Error(SETUP_MESSAGE);
    throw error;
  }
  return Boolean(data);
}

export async function updatesFor(orderIds: string[]): Promise<OrderUpdate[]> {
  if (!orderIds.length) return [];
  return chunked(orderIds, async (slice) => {
    const { data, error } = await supabaseAdmin
      .from("artwork_versions")
      .select("id, order_id, kind, image_url, note, created_by, created_at")
      .in("order_id", slice)
      .order("created_at", { ascending: true });
    if (error) {
      if (tableMissing(error)) return [];
      throw error;
    }
    return (data ?? []) as OrderUpdate[];
  });
}

export async function insertUpdate(input: {
  id?: string;
  order_id: string;
  kind: UpdateKind;
  image_url?: string | null;
  note?: string | null;
  created_by?: string | null;
}) {
  const id = input.id || randomUUID();
  const { error } = await supabaseAdmin.from("artwork_versions").insert({
    id,
    order_id: input.order_id,
    kind: input.kind,
    image_url: input.image_url ?? null,
    note: input.note ?? null,
    created_by: input.created_by ?? null,
  });
  if (error) {
    if (tableMissing(error)) throw new Error(SETUP_MESSAGE);
    throw error;
  }
  return id;
}

export async function deleteUpdate(id: string) {
  const { error } = await supabaseAdmin.from("artwork_versions").delete().eq("id", id).neq("kind", "approved");
  if (error && !tableMissing(error)) throw error;
}

export async function recordEvent(input: { order_id: string; actor: string; action: string; detail?: string | null }) {
  const { error } = await supabaseAdmin.from("order_events").insert({
    order_id: input.order_id,
    actor: input.actor,
    action: input.action,
    detail: input.detail ?? null,
  });
  if (error && !tableMissing(error)) console.error("Audit event error:", error);
}

export async function eventsFor(orderIds: string[]): Promise<OrderEvent[]> {
  if (!orderIds.length) return [];
  return chunked(orderIds, async (slice) => {
    const { data, error } = await supabaseAdmin
      .from("order_events")
      .select("id, order_id, actor, action, detail, created_at")
      .in("order_id", slice)
      .order("created_at", { ascending: true });
    if (error) {
      if (tableMissing(error)) return [];
      throw error;
    }
    return (data ?? []) as OrderEvent[];
  });
}

export async function emailLogFor(orderIds: string[]): Promise<EmailLogRow[]> {
  if (!orderIds.length) return [];
  return chunked(orderIds, async (slice) => {
    const { data, error } = await supabaseAdmin
      .from("email_log")
      .select("id, order_id, event_key, event_type, recipient, subject, status, attempt_count, last_error, created_at, sent_at")
      .in("order_id", slice)
      .order("created_at", { ascending: true });
    if (error) {
      if (tableMissing(error)) return [];
      throw error;
    }
    return (data ?? []) as EmailLogRow[];
  });
}

export async function emailByKey(eventKey: string): Promise<EmailLogRow | null> {
  const { data, error } = await supabaseAdmin.from("email_log").select("*").eq("event_key", eventKey).maybeSingle();
  if (error) {
    if (tableMissing(error)) return null;
    throw error;
  }
  return (data as EmailLogRow | null) ?? null;
}

export type TeamNote = {
  id: string;
  order_id: string;
  author: string;
  body: string;
  created_at: string;
};

export type VendorAttempt = {
  id: string;
  order_id: string;
  status: "sent" | "failed";
  tracking_url: string | null;
  error: string | null;
  attempted_by: string;
  attempted_at: string;
};

export async function notesFor(orderIds: string[]): Promise<TeamNote[]> {
  if (!orderIds.length) return [];
  return chunked(orderIds, async (slice) => {
    const { data, error } = await supabaseAdmin
      .from("team_notes")
      .select("id, order_id, author, body, created_at")
      .in("order_id", slice)
      .order("created_at", { ascending: true });
    if (error) {
      if (tableMissing(error)) return [];
      throw error;
    }
    return (data ?? []) as TeamNote[];
  });
}

export async function insertTeamNote(input: { order_id: string; author: string; body: string }) {
  const { error } = await supabaseAdmin.from("team_notes").insert({
    order_id: input.order_id,
    author: input.author,
    body: input.body,
  });
  if (error) {
    if (tableMissing(error)) return { ok: false as const, error: OPERATIONS_MESSAGE };
    return { ok: false as const, error: error.message };
  }
  return { ok: true as const };
}

export async function latestVendorAttempts(orderIds: string[]): Promise<VendorAttempt[]> {
  if (!orderIds.length) return [];
  const rows = await chunked(orderIds, async (slice) => {
    const { data, error } = await supabaseAdmin
      .from("vendor_attempts")
      .select("id, order_id, status, tracking_url, error, attempted_by, attempted_at")
      .in("order_id", slice)
      .order("attempted_at", { ascending: false });
    if (error) {
      if (tableMissing(error)) return [];
      throw error;
    }
    return (data ?? []) as VendorAttempt[];
  });
  const seen = new Set<string>();
  return rows.filter((row) => {
    if (seen.has(row.order_id)) return false;
    seen.add(row.order_id);
    return true;
  });
}

export async function saveEmailLog(input: {
  order_id?: string | null;
  event_key: string;
  event_type: string;
  recipient: string;
  subject: string;
  status: "sent" | "failed";
  attempt_count: number;
  last_error?: string | null;
  sent_at?: string | null;
}) {
  const row = {
    order_id: input.order_id && isUuid(input.order_id) ? input.order_id : null,
    event_key: input.event_key,
    event_type: input.event_type,
    recipient: input.recipient,
    subject: input.subject,
    status: input.status,
    attempt_count: input.attempt_count,
    last_error: input.last_error ?? null,
    sent_at: input.sent_at ?? null,
  };
  const { error } = await supabaseAdmin.from("email_log").upsert(row, { onConflict: "event_key" });
  if (error && !tableMissing(error)) console.error("Email log error:", error);
}
