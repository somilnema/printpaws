import "server-only";

import { readOrderDetails, type AnyOrderDetails } from "@/lib/product-order";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * Structured details per order: Multi-Pet / You & Your Pet (OrderDetails), Desk Portrait (DeskOrderDetails) or
 * Signature Gift Bundle (BundleOrderDetails); narrow with isFlowOrderDetails / isDeskOrderDetails / isBundleOrderDetails.
 * Empty until supabase/configurator-orders.sql has been run.
 */
export async function orderDetailsFor(ids: string[]): Promise<Map<string, AnyOrderDetails>> {
  const out = new Map<string, AnyOrderDetails>();
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
