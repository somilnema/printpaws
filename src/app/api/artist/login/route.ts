import { NextResponse } from "next/server";
import { applyArtistCookie } from "@/lib/artist-auth";
import { verifyPassword } from "@/lib/passwords";
import { findArtistByEmail } from "@/lib/portal-db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    if (!email || !password) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const data = await findArtistByEmail(email);
    if (!data?.password_hash || !(await verifyPassword(password, data.password_hash))) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    return applyArtistCookie(NextResponse.json({ ok: true }), {
      id: data.id,
      email: data.email,
    });
  } catch (err) {
    console.error("Artist login error:", err);
    return NextResponse.json({ error: "Could not sign in. Please try again." }, { status: 500 });
  }
}
