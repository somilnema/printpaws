import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendOrderEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Insert into Supabase 'orders' table
    const { data, error } = await supabase
      .from("orders")
      .insert([
        {
          size: body.size,
          frame_style: body.frameStyle,
          num_pets: body.numPets,
          background: body.background,
          font: body.font,
          addon: body.addon,
          pet_name: body.petName,
          gift_wrap: body.giftWrap,
          customer_email: body.customerEmail,
          total_price: body.totalPrice,
          photo_url: body.photoUrl,
          created_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase Error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // 2. Send Checkout Confirmation Email
    try {
      await sendOrderEmail(data);
    } catch (mailError) {
      console.error("Mail Error:", mailError);
      // We still return success since the order is in the DB
    }

    return NextResponse.json({ success: true, orderId: data.id });
  } catch (err: any) {
    console.error("Checkout Handler Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
