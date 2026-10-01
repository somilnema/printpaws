"use server";

import { getAdminSession } from "@/lib/admin-auth";
import { getArtistSession } from "@/lib/artist-auth";
import { deleteTeamNote, findTeamNote, insertTeamNote, workflowFor } from "@/lib/portal-db";
import { getShipmentSession } from "@/lib/shipment-auth";
import { sendOrderToVendor } from "@/lib/vendor";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function addTeamNote(orderId: string, body: string) {
  const text = body.trim();
  if (!orderId) return { ok: false as const, error: "Missing order." };
  if (!text) return { ok: false as const, error: "Write a note." };
  if (text.length > 2000) return { ok: false as const, error: "Keep the note under 2000 characters." };

  const admin = await getAdminSession();
  const artist = admin ? null : await getArtistSession();
  const shipment = admin || artist ? null : await getShipmentSession();
  if (!admin && !artist && !shipment) return { ok: false as const, error: "Sign in again to continue." };

  const { data: order, error } = await supabaseAdmin.from("orders").select("id").eq("id", orderId).maybeSingle();
  if (error || !order) return { ok: false as const, error: "Order not found." };

  if (artist) {
    const workflow = await workflowFor(orderId);
    if (workflow?.artist_id !== artist.id) return { ok: false as const, error: "This order is not assigned to you." };
  }

  const author = admin?.user || artist?.email || shipment?.user || "team";
  const saved = await insertTeamNote({ order_id: orderId, author, body: text });
  if (!saved.ok) return saved;
  return { ok: true as const };
}

export async function removeTeamNote(noteId: string) {
  if (!noteId) return { ok: false as const, error: "Missing note." };

  const admin = await getAdminSession();
  const artist = admin ? null : await getArtistSession();
  const shipment = admin || artist ? null : await getShipmentSession();
  if (!admin && !artist && !shipment) return { ok: false as const, error: "Sign in again to continue." };

  const note = await findTeamNote(noteId);
  if (!note) return { ok: true as const };

  const author = artist?.email || shipment?.user || "";
  if (!admin && note.author !== author) return { ok: false as const, error: "You can only delete notes you wrote." };

  return deleteTeamNote(noteId);
}

export async function sendToVendor(orderId: string) {
  if (!orderId) return { ok: false as const, error: "Missing order." };
  const admin = await getAdminSession();
  const shipment = admin ? null : await getShipmentSession();
  if (!admin && !shipment) return { ok: false as const, error: "Sign in again to continue." };
  const actor = admin?.user || shipment?.user || "team";
  return sendOrderToVendor({ orderId, actor });
}
