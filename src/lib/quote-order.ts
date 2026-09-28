import { calculateOriginalAmount, calculateQuote, type PricingInput } from "@/lib/pricing";
import { loadPriceCatalog, resolveCoupon } from "@/lib/store-config";

export async function quoteCheckout(input: PricingInput, customerEmail?: string) {
  const { catalog } = await loadPriceCatalog();
  const clean: PricingInput = { ...input, couponRule: null };
  const originalAmount = calculateOriginalAmount(clean, catalog);
  const resolved = await resolveCoupon(clean.couponCode, {
    orderAmount: originalAmount,
    customerEmail,
  });
  if (!resolved.ok) throw new Error(resolved.error);
  return calculateQuote({ ...clean, couponRule: resolved.rule, couponCode: resolved.rule?.code ?? null }, catalog);
}
