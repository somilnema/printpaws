import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.warn("⚠️ [RAZORPAY] API keys are not configured in environment. Using Developer Sandbox fallback.");
      const mockOrderId = `order_mock_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      return NextResponse.json({
        success: true,
        isMock: true,
        orderId: mockOrderId,
        amount: amount,
        currency: "INR",
        keyId: "rzp_test_mockKey123"
      });
    }

    // Call Razorpay REST API directly to avoid package dependency conflicts
    const authString = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${authString}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // convert rupees to paise
        currency: "INR",
        receipt: `receipt_paws_${Date.now()}`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ [RAZORPAY] Order creation failed:", errorData);
      return NextResponse.json(
        { success: false, error: errorData.error?.description || "Failed to create Razorpay order" },
        { status: 400 }
      );
    }

    const order = await response.json();
    return NextResponse.json({
      success: true,
      isMock: false,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: keyId,
    });
  } catch (error: any) {
    console.error("❌ [RAZORPAY] Order API handler error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
