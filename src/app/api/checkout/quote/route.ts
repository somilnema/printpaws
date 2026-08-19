import { NextResponse } from "next/server";
import { calculateQuote, getCoupon, type PricingInput } from "@/lib/pricing";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PricingInput & { couponCode?: string };

    if (body.couponCode) {
      const coupon = getCoupon(body.couponCode);
      if (!coupon.ok) {
        return NextResponse.json(
          { success: false, error: coupon.error },
          { status: 400 }
        );
      }
    }

    const quote = calculateQuote(body);
    return NextResponse.json({ success: true, quote });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Could not calculate payment amount." },
      { status: 400 }
    );
  }
}
