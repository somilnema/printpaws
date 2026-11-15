import "server-only";

import { readOrderDetails, type OrderDetails } from "@/lib/product-order";
import { supabaseAdmin } from "@/lib/supabase-admin";

/** Multi-Pet / You & Your Pet details per order. Empty until supabase/configurator-orders.sql has been run. */
export async function orderDetailsFor(ids: string[]): Promise<Map<string, OrderDetails>> {
  const out = new Map<string, OrderDetails>();
  const unique = [...new Set(ids.filter(Boolean))];
  if (!unique.length) return out;
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("id, order_details")
    .in("id", unique)
    .not("order_details", "is", null);
  if (error || !data) return out;
  for (const row of data as { id: string; order_details: unknown }[]) {
    const details = readOrderDetails(row.order_details);
    if (details) out.set(String(row.id), details);
  }
  return out;
}
