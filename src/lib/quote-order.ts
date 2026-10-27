import { getSellableFixedOffer } from "@/lib/landing-products";
import { calculateOriginalAmount, calculateQuote, framedSaleProblem, type PricingInput } from "@/lib/pricing";
import { loadPriceCatalog, resolveCoupon } from "@/lib/store-config";

export async function quoteCheckout(input: PricingInput, customerEmail?: string) {
  const framed = framedSaleProblem(input);
  if (framed) throw new Error(framed);

  let priced = input;
  if (input.productType === "landing_offer") {
    const offer = await getSellableFixedOffer(String(input.offerId || ""));
    if (!offer || offer.price == null) throw new Error("This product is not available.");
    priced = { ...input, offerAmount: offer.price, productLabel: offer.name };
  }

  const { catalog } = await loadPriceCatalog();
  const clean: PricingInput = { ...priced, couponRule: null };
  const originalAmount = calculateOriginalAmount(clean, catalog);
  const resolved = await resolveCoupon(clean.couponCode, {
    orderAmount: originalAmount,
    customerEmail,
  });
  if (!resolved.ok) throw new Error(resolved.error);
  return calculateQuote({ ...clean, couponRule: resolved.rule, couponCode: resolved.rule?.code ?? null }, catalog);
}
