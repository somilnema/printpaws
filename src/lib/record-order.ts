import { ensureWorkflow, isUuid } from "@/lib/portal-db";
import { notifyOrderConfirmed } from "@/lib/notifications";
import { petPhotoIsReachable, storedPetPhotoUrl } from "@/lib/pet-photo";
import type { Quote } from "@/lib/pricing";
import { paymentAlreadyRecorded, verifyRazorpaySignature } from "@/lib/razorpay";
import { supabaseAdmin } from "@/lib/supabase-admin";

const PAID = new Set(["paid", "partial_paid"]);

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isMockRazorpayId(value: string) {
  return value.startsWith("order_mock_") || value.startsWith("pay_mock_");
}

type CheckoutBody = Record<string, unknown>;

function text(body: CheckoutBody, key: string) {
  return String(body[key] ?? "").trim();
}

export function customerProblems(body: CheckoutBody, productType: string) {
  const customerName = text(body, "customerName");
  const customerEmail = text(body, "customerEmail");
  const customerPhone = text(body, "customerPhone");
  const shippingAddress = text(body, "shippingAddress");
  if (!customerName) return "Please enter your name to continue.";
  if (!customerEmail || !isValidEmail(customerEmail)) return "Please enter your email to continue.";
  if (!customerPhone || customerPhone.replace(/\D/g, "").length < 10) return "Please enter a valid contact number.";
  if (productType === "portrait" && !shippingAddress) return "Please enter your full address to continue.";
  return "";
}

export async function photoProblem(body: CheckoutBody, productType: string) {
  const supabaseHost = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "")
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
  const rawPhotoUrl = text(body, "photoUrl");
  const photoUrl = storedPetPhotoUrl(rawPhotoUrl, supabaseHost);
  const photoRequired = productType === "portrait" || productType === "digital_download";
  if (rawPhotoUrl.startsWith("blob:")) {
    return "The pet photo was not saved. Please upload it again before paying.";
  }
  if ((rawPhotoUrl && !photoUrl) || (photoRequired && !photoUrl)) {
    return "The pet photo was not saved. Please upload it again before paying.";
  }
  if (photoUrl && !(await petPhotoIsReachable(photoUrl))) {
    return "The pet photo was not saved. Please upload it again before paying.";
  }
  return "";
}

function orderFields(body: CheckoutBody, quote: Quote, razorpayOrderId: string) {
  const supabaseHost = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "")
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
  const extras = [
    body.addMug ? "custom_mug" : "",
    body.addMagnet ? "fridge_magnet" : "",
    body.addDigitalDownload ? "digital_download" : "",
  ].filter(Boolean);
  const paymentMode = quote.paymentMethod === "cod" ? "partial" : "prepaid";
  return {
    size: text(body, "size") || quote.productLabel,
    frame_style: text(body, "frameStyle") || quote.productType,
    num_pets: text(body, "numPets") || "one",
    background: text(body, "background"),
    font: text(body, "font"),
    addon: text(body, "addon") || extras.join(", ") || quote.productType,
    pet_name: text(body, "petName") || quote.productLabel,
    gift_wrap: !!body.giftWrap,
    customer_email: text(body, "customerEmail"),
    customer_name: text(body, "customerName"),
    customer_phone: text(body, "customerPhone"),
    memorial_text: text(body, "memorialText"),
    portrait_style: text(body, "portraitStyle") || quote.productType,
    total_price: quote.afterCouponAmount,
    photo_url: storedPetPhotoUrl(text(body, "photoUrl"), supabaseHost),
    coupon_code: quote.couponCode,
    discount_amount: quote.couponDiscount + quote.prepaidDiscount,
    prepaid_discount: quote.prepaidDiscount,
    payment_mode: paymentMode,
    online_paid: quote.payableNow,
    cod_due: quote.remainingAmount,
    shipping_address: text(body, "shippingAddress"),
    shipping_city: text(body, "shippingCity"),
    shipping_state: text(body, "shippingState"),
    shipping_pincode: text(body, "shippingPincode"),
    shipping_landmark: text(body, "shippingLandmark"),
    razorpay_order_id: razorpayOrderId,
  };
}

export async function insertPendingOrder(body: CheckoutBody, quote: Quote, razorpayOrderId: string) {
  const row = {
    ...orderFields(body, quote, razorpayOrderId),
    status: "pending",
    created_at: new Date().toISOString(),
  };
  const { data, error } = await supabaseAdmin.from("orders").insert([row]).select("id").single();
  if (error || !data?.id) {
    return { ok: false as const, error: error?.message || "The order could not be saved." };
  }
  return { ok: true as const, orderId: String(data.id) };
}

async function confirmSideEffects(order: { id?: string; photo_url?: string | null; created_at?: string | null; customer_email?: string }) {
  if (!order.id || !isUuid(String(order.id))) return;
  try {
    await ensureWorkflow({
      id: String(order.id),
      photo_url: order.photo_url,
      created_at: order.created_at,
    });
  } catch (error) {
    console.error("Workflow setup error:", error);
  }
  try {
    await notifyOrderConfirmed(order);
  } catch (error) {
    console.error("Order confirmation email error:", error);
  }
}

export async function markOrderPaid(razorpayOrderId: string, razorpayPaymentId: string) {
  const { data: existing, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("razorpay_order_id", razorpayOrderId)
    .maybeSingle();

  if (error) return { ok: false as const, status: 500, error: error.message };
  if (!existing?.id) return { ok: false as const, status: 404, error: "Order not found for this payment." };

  if (existing.razorpay_payment_id && existing.razorpay_payment_id !== razorpayPaymentId && PAID.has(String(existing.status))) {
    return { ok: false as const, status: 409, error: "This payment has already been recorded." };
  }

  if (PAID.has(String(existing.status)) && existing.razorpay_payment_id === razorpayPaymentId) {
    return { ok: true as const, orderId: String(existing.id), already: true };
  }

  const status = existing.payment_mode === "partial" ? "partial_paid" : "paid";
  const { data, error: updateError } = await supabaseAdmin
    .from("orders")
    .update({ status, razorpay_payment_id: razorpayPaymentId })
    .eq("id", existing.id)
    .select("*")
    .single();

  if (updateError || !data?.id) {
    return { ok: false as const, status: 500, error: updateError?.message || "The paid order could not be saved." };
  }

  await confirmSideEffects(data);
  return { ok: true as const, orderId: String(data.id), already: false };
}

export async function verifyAndMarkPaid(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const razorpayOrderId = input.razorpayOrderId.trim();
  const razorpayPaymentId = input.razorpayPaymentId.trim();
  const razorpaySignature = input.razorpaySignature.trim();
  const mock = isMockRazorpayId(razorpayOrderId) || isMockRazorpayId(razorpayPaymentId);
  const keysConfigured = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
  if (mock && keysConfigured) {
    return { ok: false as const, status: 400, error: "Invalid payment." };
  }

  if (!mock) {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) return { ok: false as const, status: 500, error: "Payment verification is not configured." };
    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return { ok: false as const, status: 400, error: "Missing Razorpay payment details." };
    }
    const valid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature, keySecret);
    if (!valid) return { ok: false as const, status: 400, error: "Payment signature verification failed." };
    if (await paymentAlreadyRecorded(razorpayPaymentId)) {
      const paid = await markOrderPaid(razorpayOrderId, razorpayPaymentId);
      if (paid.ok) return paid;
      return { ok: false as const, status: 409, error: "This payment has already been recorded." };
    }
  }

  return markOrderPaid(razorpayOrderId, razorpayPaymentId);
}

export async function insertPaidOrder(body: CheckoutBody, quote: Quote, razorpayOrderId: string, razorpayPaymentId: string) {
  const status = quote.paymentMethod === "cod" ? "partial_paid" : "paid";
  const row = {
    ...orderFields(body, quote, razorpayOrderId),
    status,
    razorpay_payment_id: razorpayPaymentId,
    created_at: new Date().toISOString(),
  };
  const { data, error } = await supabaseAdmin.from("orders").insert([row]).select("*").single();
  if (error || !data?.id) {
    return { ok: false as const, status: 500, error: error?.message || "The order could not be saved." };
  }
  await confirmSideEffects(data);
  return { ok: true as const, orderId: String(data.id), already: false };
}
