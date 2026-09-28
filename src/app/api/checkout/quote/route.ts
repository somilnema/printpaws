import { NextResponse } from "next/server";
import { quoteCheckout } from "@/lib/quote-order";
import type { PricingInput } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PricingInput & { customerEmail?: string };
    const quote = await quoteCheckout(body, body.customerEmail);
    return NextResponse.json({ success: true, quote });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Could not calculate payment amount." },
      { status: 400 }
    );
  }
}
