import { NextResponse } from "next/server";
import crypto from "crypto";
import { markOrderPaid } from "@/lib/record-order";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

function signed(raw: string, header: string, secret: string) {
  const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(header || "");
  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "Webhook secret is not configured." }, { status: 503 });
  }

  const raw = await req.text();
  const header = req.headers.get("x-razorpay-signature") || "";
  if (!signed(raw, header, secret)) {
    return NextResponse.json({ ok: false, error: "Invalid webhook signature." }, { status: 400 });
  }

  const event = JSON.parse(raw) as {
    event?: string;
    payload?: {
      payment?: { entity?: { id?: string; order_id?: string; status?: string } };
      order?: { entity?: { id?: string } };
    };
  };

  const payment = event.payload?.payment?.entity;
  const razorpayOrderId = payment?.order_id || event.payload?.order?.entity?.id || "";
  const razorpayPaymentId = payment?.id || "";
  const name = event.event || "";

  if ((name === "payment.captured" || name === "order.paid") && razorpayOrderId && razorpayPaymentId) {
    const paid = await markOrderPaid(razorpayOrderId, razorpayPaymentId);
    if (!paid.ok && paid.status !== 404) {
      return NextResponse.json({ ok: false, error: paid.error }, { status: paid.status });
    }
    return NextResponse.json({ ok: true });
  }

  if (name === "payment.failed" && razorpayOrderId) {
    await supabaseAdmin
      .from("orders")
      .update({ status: "failed" })
      .eq("razorpay_order_id", razorpayOrderId)
      .eq("status", "pending");
  }

  return NextResponse.json({ ok: true });
}
