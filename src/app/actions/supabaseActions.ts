'use server';

import { supabase } from '@/lib/supabase';

export async function uploadPetPhoto(formData: FormData): Promise<string> {
  const file = formData.get('file') as File;
  if (!file) throw new Error('No file provided');

  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `orders/${Date.now()}-${fileName}`;

  const { error } = await supabase.storage.from('pet-photos').upload(filePath, file);
  if (error) {
    console.error('Supabase upload error:', error);
    throw error;
  }
  
  const { data: { publicUrl } } = supabase.storage.from('pet-photos').getPublicUrl(filePath);
  return publicUrl;
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

export async function listOrders(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  const isDev = process.env.NODE_ENV !== 'production';

  if (expected) {
    if (password !== expected) {
      throw new Error('Invalid password');
    }
  } else if (!isDev) {
    throw new Error('ADMIN_PASSWORD is not configured');
  }

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Supabase list orders error:', error);
    throw error;
  }

  return data ?? [];
}
