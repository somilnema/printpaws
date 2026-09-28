import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/passwords";
import { findShipperByEmail } from "@/lib/portal-db";
import { applyShipmentAccountCookie, applyShipmentCookie, verifyShipmentCredentials } from "@/lib/shipment-auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email || body.username || "").trim().toLowerCase();
    const password = String(body.password || "");
    if (!email || !password) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const account = await findShipperByEmail(email);
    if (account?.password_hash && (await verifyPassword(password, account.password_hash))) {
      return applyShipmentAccountCookie(NextResponse.json({ ok: true }), {
        id: account.id,
        email: account.email,
      });
    }

    const shared = verifyShipmentCredentials(email, password);
    if (shared.ok) {
      return applyShipmentCookie(NextResponse.json({ ok: true }), email);
    }

    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  } catch (err) {
    console.error("Shipment login error:", err);
    return NextResponse.json({ error: "Could not sign in. Please try again." }, { status: 500 });
  }
}
