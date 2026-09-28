import { NextResponse } from "next/server";
import { ARTIST_COOKIE } from "@/lib/artist-auth";

export const runtime = "nodejs";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ARTIST_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
