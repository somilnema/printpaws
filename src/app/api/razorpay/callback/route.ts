import { NextResponse } from "next/server";
import { verifyAndMarkPaid } from "@/lib/record-order";

export const dynamic = "force-dynamic";

function originOf(req: Request) {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "www.peternity.in";
  const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

function field(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function finish(req: Request, form: FormData) {
  const origin = originOf(req);
  const reason = field(form, "error[description]") || field(form, "error[reason]");
  const razorpayPaymentId = field(form, "razorpay_payment_id");
  const razorpayOrderId = field(form, "razorpay_order_id");
  const razorpaySignature = field(form, "razorpay_signature");

  if (reason || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
    const failed = new URL("/checkout/failed", origin);
    failed.searchParams.set("reason", reason || "The payment was not completed.");
    return NextResponse.redirect(failed, 303);
  }

  const paid = await verifyAndMarkPaid({ razorpayOrderId, razorpayPaymentId, razorpaySignature });
  if (!paid.ok) {
    const failed = new URL("/checkout/failed", origin);
    failed.searchParams.set(
      "reason",
      paid.status === 400
        ? paid.error
        : `Payment reference ${razorpayPaymentId} was received, but the order could not be confirmed. Please contact Peternity with this reference.`
    );
    return NextResponse.redirect(failed, 303);
  }

  const success = new URL("/checkout/success", origin);
  success.searchParams.set("orderId", paid.orderId);
  return NextResponse.redirect(success, 303);
}

export async function POST(req: Request) {
  const form = await req.formData();
  return finish(req, form);
}
