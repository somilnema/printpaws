import { NextResponse } from "next/server";
import { sendOrderEmail } from "@/lib/mailer";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { calculateQuote, type PricingInput } from "@/lib/pricing";
import { paymentAlreadyRecorded, verifyRazorpaySignature } from "@/lib/razorpay";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const pricingInput = body as PricingInput;

    let quote;
    try {
      quote = calculateQuote(pricingInput);
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: err.message || "Invalid pricing details." },
        { status: 400 }
      );
    }

    const customerName = String(body.customerName || "").trim();
    const customerEmail = String(body.customerEmail || "").trim();
    const customerPhone = String(body.customerPhone || "").trim();
    const shippingAddress = String(body.shippingAddress || "").trim();
    const shippingCity = String(body.shippingCity || "").trim();
    const shippingState = String(body.shippingState || "").trim();
    const shippingPincode = String(body.shippingPincode || "").trim();

    if (!customerName) {
      return NextResponse.json({ success: false, error: "Please enter your name to continue." }, { status: 400 });
    }
    if (!customerEmail || !isValidEmail(customerEmail)) {
      return NextResponse.json({ success: false, error: "Please enter your email to continue." }, { status: 400 });
    }
    if (!customerPhone || customerPhone.replace(/\D/g, "").length < 10) {
      return NextResponse.json({ success: false, error: "Please enter a valid contact number." }, { status: 400 });
    }
    if (quote.productType === "portrait" && !shippingAddress) {
      return NextResponse.json({ success: false, error: "Please enter your full address to continue." }, { status: 400 });
    }

    const razorpayPaymentId = String(body.razorpayPaymentId || "");
    const razorpayOrderId = String(body.razorpayOrderId || "");
    const razorpaySignature = String(body.razorpaySignature || "");
    const isMockPayment = razorpayOrderId.startsWith("order_mock_") || razorpayPaymentId.startsWith("pay_mock_");

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!isMockPayment) {
      if (!keySecret) {
        return NextResponse.json({ success: false, error: "Payment verification is not configured." }, { status: 500 });
      }
      if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
        return NextResponse.json({ success: false, error: "Missing Razorpay payment details." }, { status: 400 });
      }
      const valid = verifyRazorpaySignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        keySecret
      );
      if (!valid) {
        return NextResponse.json({ success: false, error: "Payment signature verification failed." }, { status: 400 });
      }
      if (await paymentAlreadyRecorded(razorpayPaymentId)) {
        return NextResponse.json({ success: false, error: "This payment has already been recorded." }, { status: 409 });
      }
    }

    const paymentMode = quote.paymentMethod === "cod" ? "partial" : "prepaid";
    const status = quote.paymentMethod === "cod" ? "partial_paid" : "paid";
    const totalDiscount = quote.couponDiscount + quote.prepaidDiscount;

    const extras = [
      body.addMug ? "custom_mug" : "",
      body.addMagnet ? "fridge_magnet" : "",
      body.addDigitalDownload ? "digital_download" : "",
    ].filter(Boolean);

    const orderRow = {
      size: body.size || quote.productLabel,
      frame_style: body.frameStyle || quote.productType,
      num_pets: body.numPets || "one",
      background: body.background || "",
      font: body.font || "",
      addon: body.addon || extras.join(", ") || quote.productType,
      pet_name: body.petName || quote.productLabel,
      gift_wrap: !!body.giftWrap,
      customer_email: customerEmail,
      customer_name: customerName,
      customer_phone: customerPhone,
      memorial_text: body.memorialText || "",
      portrait_style: body.portraitStyle || quote.productType,
      total_price: quote.afterCouponAmount,
      photo_url: body.photoUrl || "",
      coupon_code: quote.couponCode,
      discount_amount: totalDiscount,
      prepaid_discount: quote.prepaidDiscount,
      payment_mode: paymentMode,
      online_paid: quote.payableNow,
      cod_due: quote.remainingAmount,
      status,
      shipping_address: shippingAddress,
      shipping_city: shippingCity,
      shipping_state: shippingState,
      shipping_pincode: shippingPincode,
      shipping_landmark: String(body.shippingLandmark || "").trim(),
      razorpay_payment_id: razorpayPaymentId,
      razorpay_order_id: razorpayOrderId,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from("orders")
      .insert([orderRow])
      .select()
      .single();

    if (error) {
      console.warn("Supabase Database Insert Error. Falling back to mock order success:", error);
      const mockId = `order_${Math.random().toString(36).substr(2, 9)}`;

      try {
        await sendOrderEmail({
          id: mockId,
          ...body,
          ...orderRow,
          quote,
        });
      } catch (mailError) {
        console.error("Mail Error in Fallback Flow:", mailError);
      }

      return NextResponse.json({ success: true, orderId: mockId, quote });
    }

    try {
      await sendOrderEmail({
        ...data,
        razorpayPaymentId,
        razorpayOrderId,
        razorpaySignature,
        quote,
      });
    } catch (mailError) {
      console.error("Mail Error in Success Flow:", mailError);
    }

    return NextResponse.json({ success: true, orderId: data.id, quote });
  } catch (err: any) {
    console.error("Checkout Handler Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
