import { getAdminSession } from "@/lib/admin-auth";
import { downloadOriginalArtwork } from "@/lib/artwork-files";
import { getArtistSession } from "@/lib/artist-auth";
import { workflowFor } from "@/lib/portal-db";
import { getShipmentSession } from "@/lib/shipment-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

const VERSION_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(request: Request) {
  const versionId = new URL(request.url).searchParams.get("version") || "";
  if (!VERSION_ID.test(versionId)) {
    return new Response("Missing artwork.", { status: 400 });
  }

  const [admin, shipment, artist] = await Promise.all([getAdminSession(), getShipmentSession(), getArtistSession()]);
  if (!admin && !shipment && !artist) {
    return new Response("Sign in to download this file.", { status: 401 });
  }

  const { data: version, error } = await supabaseAdmin
    .from("artwork_versions")
    .select("id, order_id, kind")
    .eq("id", versionId)
    .maybeSingle();
  if (error || !version?.order_id) {
    return new Response("Artwork not found.", { status: 404 });
  }

  const workflow = await workflowFor(version.order_id);
  if (artist && !admin && !shipment && workflow?.artist_id !== artist.id) {
    return new Response("This order is not assigned to you.", { status: 403 });
  }
  if (shipment && !admin && workflow?.approved_update_id !== version.id) {
    return new Response("The print file is available after the customer approves the preview.", { status: 403 });
  }

  const file = await downloadOriginalArtwork(version.order_id, version.id);
  if (!file) {
    return new Response("The original file is not stored for this preview.", { status: 404 });
  }

  const shortId = String(version.order_id).replace(/-/g, "").slice(0, 8);
  return new Response(new Uint8Array(file.bytes), {
    headers: {
      "Content-Type": file.contentType,
      "Content-Disposition": `attachment; filename="peternity-${shortId}-original.${file.ext}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
