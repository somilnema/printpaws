import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
) {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(signature || "");
  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

export async function paymentAlreadyRecorded(paymentId: string) {
  if (!paymentId) return false;
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("id")
    .eq("razorpay_payment_id", paymentId)
    .limit(1);

  if (error) {
    console.warn("Duplicate payment lookup failed:", error.message);
    return false;
  }
  return !!(data && data.length > 0);
}
