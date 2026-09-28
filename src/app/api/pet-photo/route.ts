import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { storedPetPhotoUrl } from "@/lib/pet-photo";
import { supabaseAdmin } from "@/lib/supabase-admin";

const MAX_BYTES = 2_000_000;

function imageType(bytes: Buffer, declared: string) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { ext: "jpg", contentType: "image/jpeg" };
  }
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return { ext: "png", contentType: "image/png" };
  }
  if (
    bytes.length >= 12 &&
    bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
    bytes.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return { ext: "webp", contentType: "image/webp" };
  }
  if (declared === "image/png") return { ext: "png", contentType: "image/png" };
  if (declared === "image/webp") return { ext: "webp", contentType: "image/webp" };
  if (declared === "image/jpeg" || declared === "image/jpg") return { ext: "jpg", contentType: "image/jpeg" };
  return null;
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ success: false, error: "Choose a pet photo to continue." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { success: false, error: "This photo is too large. Please choose a smaller JPG or PNG." },
        { status: 400 }
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const image = imageType(bytes, file.type || "");
    if (!image) {
      return NextResponse.json(
        { success: false, error: "This photo format isn't supported. Please upload a JPG or PNG." },
        { status: 400 }
      );
    }

    const path = `orders/${Date.now()}-${randomUUID()}.${image.ext}`;
    const uploaded = await supabaseAdmin.storage.from("pet-photos").upload(path, bytes, {
      contentType: image.contentType,
      upsert: false,
    });
    if (uploaded.error) {
      console.error("Pet photo upload error:", uploaded.error);
      return NextResponse.json(
        { success: false, error: "We couldn't save the pet photo. Please try again." },
        { status: 500 }
      );
    }

    const { data } = supabaseAdmin.storage.from("pet-photos").getPublicUrl(path);
    const url = storedPetPhotoUrl(data.publicUrl);
    if (!url) {
      await supabaseAdmin.storage.from("pet-photos").remove([path]);
      return NextResponse.json(
        { success: false, error: "We couldn't save the pet photo. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, url });
  } catch (err) {
    console.error("Pet photo route error:", err);
    return NextResponse.json(
      { success: false, error: "We couldn't save the pet photo. Please try again." },
      { status: 500 }
    );
  }
}
