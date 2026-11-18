import { draftMode } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { launchProductForSlug } from "@/lib/landing-products";

/**
 * Admin only: opens a Desk Portrait / Gift Bundle page before it is launched.
 * Product pages are cached (static), so they cannot read the admin cookie themselves; Next.js draft mode renders
 * them fresh for this browser instead. `?off=1` ends the preview.
 */
export async function GET(req: NextRequest) {
  const draft = await draftMode();
  if (req.nextUrl.searchParams.get("off")) {
    draft.disable();
    return NextResponse.redirect(new URL("/admin/configurator", req.url));
  }
  const slug = req.nextUrl.searchParams.get("slug") || "";
  if (!launchProductForSlug(slug)) return NextResponse.json({ error: "Unknown product." }, { status: 404 });
  if (!(await getAdminSession())) return NextResponse.redirect(new URL("/admin", req.url));
  draft.enable();
  return NextResponse.redirect(new URL(`/portraits/${slug}`, req.url));
}
