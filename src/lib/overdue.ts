import { headers } from "next/headers";
import { notifyOverdue } from "@/lib/notifications";
import { listArtists, tableMissing } from "@/lib/portal-db";
import { supabaseAdmin } from "@/lib/supabase-admin";

const OPEN = ["ready_for_artwork", "artwork_in_progress", "artwork_review", "revision_requested", "revision_in_progress"];

function formatDue(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
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

export async function sendOverdueReminders() {
  const { data, error } = await supabaseAdmin
    .from("order_workflow")
    .select("order_id, artist_id, due_at, status")
    .in("status", OPEN)
    .lt("due_at", new Date().toISOString());
  if (error) {
    if (tableMissing(error)) return { sent: 0 };
    console.error("Overdue lookup error:", error);
    return { sent: 0 };
  }
  const rows = (data ?? []).filter((row) => row.due_at && row.order_id);
  if (!rows.length) return { sent: 0 };

  const ids = rows.map((row) => String(row.order_id));
  const [{ data: orders }, artists] = await Promise.all([
    supabaseAdmin.from("orders").select("id, pet_name").in("id", ids),
    listArtists().catch(() => []),
  ]);
  const petById = new Map((orders ?? []).map((order) => [String(order.id), String(order.pet_name || "")]));
  const artistById = new Map(artists.map((artist) => [artist.id, artist]));
  const adminEmail = (process.env.ADMIN_EMAIL || process.env.EMAIL_USER || "").trim();
  const origin = await portalOrigin();
  let sent = 0;

  for (const row of rows) {
    const orderId = String(row.order_id);
    const dueAt = String(row.due_at);
    const petName = petById.get(orderId) || "a portrait";
    const artist = row.artist_id ? artistById.get(String(row.artist_id)) : undefined;
    const dueLabel = formatDue(dueAt);

    if (artist?.email) {
      const result = await notifyOverdue({
        orderId,
        dueAt,
        audience: "artist",
        to: artist.email,
        artistName: artist.name || "",
        petName,
        dueLabel,
        portalUrl: origin ? `${origin}/artist` : "",
      });
      if (result.ok && !result.alreadySent) sent += 1;
    }

    if (adminEmail) {
      const result = await notifyOverdue({
        orderId,
        dueAt,
        audience: "admin",
        to: adminEmail,
        artistName: artist?.name || "Unassigned",
        petName,
        dueLabel,
        portalUrl: origin ? `${origin}/admin` : "",
      });
      if (result.ok && !result.alreadySent) sent += 1;
    }
  }

  return { sent };
}
