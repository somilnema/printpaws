import { NextResponse } from "next/server";
import { quoteCheckout } from "@/lib/quote-order";
import type { PricingInput } from "@/lib/pricing";
import {
  customerProblems,
  insertPaidOrder,
  photoProblem,
  verifyAndMarkPaid,
} from "@/lib/record-order";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PricingInput & Record<string, unknown>;
    const razorpayPaymentId = String(body.razorpayPaymentId || "");
    const razorpayOrderId = String(body.razorpayOrderId || "");
    const razorpaySignature = String(body.razorpaySignature || "");

    const paid = await verifyAndMarkPaid({ razorpayOrderId, razorpayPaymentId, razorpaySignature });
    if (paid.ok) {
      return NextResponse.json({ success: true, orderId: paid.orderId });
    }
    if (paid.status !== 404) {
      return NextResponse.json({ success: false, error: paid.error }, { status: paid.status });
    }

    let quote;
    try {
      quote = await quoteCheckout(body, String(body.customerEmail || ""));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid pricing details.";
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }

    // The payment is already verified here, so a bad photo or form field must not drop the order.
    const problem = customerProblems(body, quote.productType) || (await photoProblem(body, quote.productType));
    if (problem) console.error(`Saving paid order ${razorpayPaymentId} despite: ${problem}`);

    const created = await insertPaidOrder(body, quote, razorpayOrderId, razorpayPaymentId);
    if (!created.ok) {
      return NextResponse.json({ success: false, error: created.error }, { status: created.status });
    }
    return NextResponse.json({ success: true, orderId: created.orderId, quote });
  } catch (err: unknown) {
    console.error("Checkout Handler Error:", err);
    const message = err instanceof Error ? err.message : "Checkout failed.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
