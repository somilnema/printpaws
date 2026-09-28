import { NextResponse } from "next/server";
import { loadPriceCatalog } from "@/lib/store-config";

export const dynamic = "force-dynamic";

export async function GET() {
  const loaded = await loadPriceCatalog();
  return NextResponse.json({ catalog: loaded.catalog });
}
