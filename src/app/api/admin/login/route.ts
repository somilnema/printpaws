import { NextResponse } from "next/server";
import { applyAdminCookie, verifyAdminCredentials } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email || "");
    const password = String(body.password || "");
    const result = verifyAdminCredentials(email, password);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }
    return applyAdminCookie(NextResponse.json({ ok: true }), email);
  } catch (err: any) {
    console.error("Admin login error:", err);
    return NextResponse.json({ error: "Could not sign in. Please try again." }, { status: 500 });
  }
}
