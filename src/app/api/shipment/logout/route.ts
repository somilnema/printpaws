import { NextResponse } from "next/server";
import { SHIPMENT_COOKIE } from "@/lib/shipment-auth";

export const runtime = "nodejs";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SHIPMENT_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
