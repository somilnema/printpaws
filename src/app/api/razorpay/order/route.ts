import { NextResponse } from "next/server";
import { quoteCheckout } from "@/lib/quote-order";
import type { PricingInput } from "@/lib/pricing";
import { customerProblems, insertPendingOrder, photoProblem } from "@/lib/record-order";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PricingInput & { customerEmail?: string };

    let quote;
    try {
      quote = await quoteCheckout(body, body.customerEmail);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid order details.";
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }

    const problem = customerProblems(body, quote.productType);
    if (problem) return NextResponse.json({ success: false, error: problem }, { status: 400 });

    const photo = await photoProblem(body, quote.productType);
    if (photo) return NextResponse.json({ success: false, error: photo }, { status: 400 });

    const amount = quote.payableNow;
    if (!amount || amount < 1) {
      return NextResponse.json({ success: false, error: "Payable amount is invalid." }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    let razorpayOrderId = "";
    let isMock = false;
    let currency = "INR";
    let publicKey = keyId || "";

    if (!keyId || !keySecret) {
      console.warn("Razorpay keys are not configured. Using the local payment simulator.");
      razorpayOrderId = `order_mock_${Math.random().toString(36).slice(2, 11).toUpperCase()}`;
      isMock = true;
      publicKey = "rzp_test_mockKey123";
    } else {
      const authString = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
      const response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          Authorization: `Basic ${authString}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100),
          currency: "INR",
          receipt: `receipt_peternity_${Date.now()}`,
          notes: {
            productType: quote.productType,
            paymentMethod: quote.paymentMethod,
            coupon: quote.couponCode || "",
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Razorpay order creation failed:", errorData);
        const description =
          typeof errorData === "object" && errorData && "error" in errorData
            ? (errorData as { error?: { description?: string } }).error?.description
            : "";
        return NextResponse.json(
          { success: false, error: description || "Failed to create Razorpay order" },
          { status: 400 }
        );
      }

      const order = await response.json();
      razorpayOrderId = String(order.id || "");
      currency = String(order.currency || "INR");
    }

    const pending = await insertPendingOrder(body, quote, razorpayOrderId);
    if (!pending.ok) {
      console.error("Pending order insert failed:", pending.error);
      return NextResponse.json(
        { success: false, error: "We couldn't start this order. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      isMock,
      orderId: razorpayOrderId,
      internalOrderId: pending.orderId,
      amount: quote.payableNow,
      currency,
      keyId: publicKey,
      quote,
    });
  } catch (error: unknown) {
    console.error("Razorpay order API handler error:", error);
    const message = error instanceof Error ? error.message : "Failed to start payment.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
