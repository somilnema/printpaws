'use server';

import { storedPetPhotoUrl } from '@/lib/pet-photo';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function uploadPetPhoto(formData: FormData): Promise<string> {
  const file = formData.get('file') as File;
  if (!file) throw new Error('No file provided');

  const type = file.type || "image/jpeg";
  const ext = type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";
  const filePath = `orders/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const { error } = await supabaseAdmin.storage.from("pet-photos").upload(filePath, file, {
    contentType: type,
    upsert: false,
  });
  if (error) {
    console.error("Supabase upload error:", error);
    throw new Error(error.message || "Photo upload failed");
  }

  const { data: { publicUrl } } = supabaseAdmin.storage.from('pet-photos').getPublicUrl(filePath);
  const stored = storedPetPhotoUrl(publicUrl);
  if (!stored) throw new Error("The photo was uploaded but the saved link was invalid.");
  return stored;
}

export async function getOrderDetails(orderId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .maybeSingle();
    
  if (error) {
    console.error('Supabase fetch order error:', error);
    throw error;
  }
  return data;
}

