import { ensureWorkflow, isUuid, recordEvent } from "@/lib/portal-db";
import { notifyOrderConfirmed } from "@/lib/notifications";
import { limitedBackgroundIds } from "@/lib/everyday-content";
import { petPhotoIsReachable, storedPetPhotoUrl } from "@/lib/pet-photo";
import { pricedAddonTokens, type Quote } from "@/lib/pricing";
import { buildOrderDetails, isFlowProduct, orderDetailsSummary, type BuiltOrderDetails } from "@/lib/product-order";
import { paymentAlreadyRecorded, verifyRazorpaySignature } from "@/lib/razorpay";
import { loadProductContent } from "@/lib/site-content";
import { loadPriceCatalog } from "@/lib/store-config";
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
  if ((productType === "portrait" || productType === "landing_offer") && !shippingAddress) {
    return "Please enter your full address to continue.";
  }
  if (productType === "landing_offer") {
    if (!text(body, "shippingCity")) return "Please enter your city to continue.";
    if (!text(body, "shippingState")) return "Please enter your state to continue.";
    if (text(body, "shippingPincode").replace(/\D/g, "").length < 6) return "Please enter a valid PIN code to continue.";
  }
  return "";
}

function supabaseHostName() {
  return (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "")
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
}

/** Multi-Pet / You & Your Pet: the structured order record built from the checkout body. Null for other products. */
async function flowOrderDetails(body: CheckoutBody, productType: string): Promise<BuiltOrderDetails | null> {
  if (productType !== "portrait" || !isFlowProduct(body.configurator)) return null;
  const [content, { catalog }] = await Promise.all([loadProductContent(body.configurator), loadPriceCatalog()]);
  catalog.limitedBackgrounds = limitedBackgroundIds(content);
  return buildOrderDetails(body, body.configurator, content, catalog, supabaseHostName());
}

export async function photoProblem(body: CheckoutBody, productType: string) {
  // Configurator products: every photo the chosen method needs must be saved and readable.
  const flow = await flowOrderDetails(body, productType);
  if (flow) {
    if (!flow.ok) return flow.error;
    const reachable = await Promise.all(flow.photoUrls.map((url) => petPhotoIsReachable(url)));
    if (reachable.some((ok) => !ok)) return "One of your photos was not saved. Please upload it again before paying.";
    return "";
  }

  const supabaseHost = supabaseHostName();
  const rawPhotoUrl = text(body, "photoUrl");
  const photoUrl = storedPetPhotoUrl(rawPhotoUrl, supabaseHost);
  const photoRequired = productType === "portrait" || productType === "digital_download" || productType === "landing_offer";
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

/** "Aurora (bg7)": the name the shop showed, plus the id staff and older orders use. */
function backgroundColumn(id: string, label: string) {
  const name = label.trim().slice(0, 60);
  if (!name || name === id) return id || name;
  return id ? `${name} (${id.slice(0, 40)})` : name;
}

function orderFields(body: CheckoutBody, quote: Quote, razorpayOrderId: string, flow: BuiltOrderDetails | null = null) {
  const supabaseHost = supabaseHostName();
  const configured = flow && flow.ok ? flow : null;
  // Built from what was priced, never copied from the browser: staff and the print vendor act on this list.
  const pricedAddons = [
    ...pricedAddonTokens(text(body, "addon")),
    body.priorityPreview === true ? "priority_preview" : "",
    configured?.details.halo_enabled ? "halo_tribute" : "",
    body.addMug === true ? "custom_mug" : "",
    body.addMagnet === true ? "fridge_magnet" : "",
    body.addDigitalDownload === true ? "digital_download" : "",
    body.addDesk === true ? "desk_portrait" : "",
  ].filter(Boolean);
  const paymentMode = quote.paymentMethod === "cod" ? "partial" : "prepaid";
  const fixedOffer = quote.productType === "landing_offer";
  return {
    size: fixedOffer ? quote.productLabel : text(body, "size") || quote.productLabel,
    frame_style: fixedOffer ? "fixed" : text(body, "frameStyle") || quote.productType,
    num_pets: text(body, "numPets") || "one",
    // The name the shop showed, so artists see "Sage" even when the pricing id differs.
    background: backgroundColumn(text(body, "background"), configured?.details.background_label || text(body, "backgroundLabel")),
    font: text(body, "font"),
    addon: fixedOffer
      ? text(body, "offerId")
      : quote.productType === "portrait"
        ? pricedAddons.join(", ") || "none"
        : text(body, "addon") || quote.productType,
    pet_name: configured?.namesText || text(body, "petName") || quote.productLabel,
    gift_wrap: !!body.giftWrap,
    customer_email: text(body, "customerEmail"),
    customer_name: text(body, "customerName"),
    customer_phone: text(body, "customerPhone"),
    // Configurator orders: the checked subtitle (length-capped), never raw browser text.
    memorial_text: configured ? configured.details.subtitle || "" : text(body, "memorialText"),
    portrait_style: text(body, "portraitStyle") || quote.productType,
    total_price: quote.afterCouponAmount,
    photo_url: configured?.primaryPhotoUrl || storedPetPhotoUrl(text(body, "photoUrl"), supabaseHost),
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
    // Pet-to-photo mapping, halo target, artist note… (supabase/configurator-orders.sql adds this column).
    ...(configured ? { order_details: configured.details } : {}),
  };
}

function missingDetailsColumn(error: { message?: string; code?: string } | null) {
  if (!error) return false;
  return /order_details/i.test(error.message || "") && /PGRST204|42703|column|schema cache/i.test(`${error.code || ""} ${error.message || ""}`);
}

type OrderRow = ReturnType<typeof orderFields> & Record<string, unknown>;

/**
 * Inserts the order. Without the order_details column a configurator order is refused before payment
 * (`allowFallback` false), so production never gets one without its photo mapping. After payment it is
 * still saved, with the details written to its timeline.
 */
async function insertOrderRow(row: OrderRow, columns: string, allowFallback: boolean) {
  const first = await supabaseAdmin.from("orders").insert([row]).select(columns).single();
  if (!first.error || !("order_details" in row) || !missingDetailsColumn(first.error)) return first;

  console.error("orders.order_details is missing. Run supabase/configurator-orders.sql in the Supabase SQL editor.");
  if (!allowFallback) return first;
  const { order_details: details, ...rest } = row as OrderRow & { order_details?: unknown };
  const second = await supabaseAdmin.from("orders").insert([rest]).select(columns).single();
  const id = (second.data as { id?: string } | null)?.id;
  if (!second.error && id && details) {
    await recordEvent({
      order_id: String(id),
      actor: "shop",
      action: "configurator_details",
      detail: orderDetailsSummary(details as Parameters<typeof orderDetailsSummary>[0]).slice(0, 4000),
    });
  }
  return second;
}

export async function insertPendingOrder(body: CheckoutBody, quote: Quote, razorpayOrderId: string) {
  const flow = await flowOrderDetails(body, quote.productType);
  if (flow && !flow.ok) return { ok: false as const, error: flow.error };
  const row = {
    ...orderFields(body, quote, razorpayOrderId, flow),
    status: "pending",
    created_at: new Date().toISOString(),
  };
  const { data, error } = await insertOrderRow(row, "id", false);
  const id = (data as { id?: string } | null)?.id;
  if (error || !id) {
    return { ok: false as const, error: error?.message || "The order could not be saved." };
  }
  return { ok: true as const, orderId: String(id) };
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
  // The payment is already verified: a configurator problem is logged, never a reason to drop the order.
  const flow = await flowOrderDetails(body, quote.productType).catch(() => null);
  if (flow && !flow.ok) console.error(`Paid order ${razorpayPaymentId} saved without configurator details: ${flow.error}`);
  const row = {
    ...orderFields(body, quote, razorpayOrderId, flow),
    status,
    razorpay_payment_id: razorpayPaymentId,
    created_at: new Date().toISOString(),
  };
  const { data, error } = await insertOrderRow(row, "*", true);
  const saved = data as { id?: string; photo_url?: string | null; created_at?: string | null; customer_email?: string } | null;
  if (error || !saved?.id) {
    return { ok: false as const, status: 500, error: error?.message || "The order could not be saved." };
  }
  await confirmSideEffects(saved);
  return { ok: true as const, orderId: String(saved.id), already: false };
}
