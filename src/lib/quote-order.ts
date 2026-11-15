import { getSellableFixedOffer } from "@/lib/landing-products";
import { limitedBackgroundIds } from "@/lib/everyday-content";
import { calculateOriginalAmount, calculateQuote, portraitOptionProblem, type PriceCatalog, type PricingInput } from "@/lib/pricing";
import { configuratorPricingProblem, isFlowProduct } from "@/lib/product-order";
import { loadProductContent } from "@/lib/site-content";
import { loadPriceCatalog, resolveCoupon } from "@/lib/store-config";

/**
 * Every portrait order: a real pet choice, a size, whole copies, and no configurator-only options without
 * that configurator. Shop pages always send these, so only hand-made requests are refused.
 */
function portraitInputProblem(input: PricingInput, catalog: PriceCatalog) {
  if (catalog.pets[input.numPets || "one"] == null) return "That pet option is not available.";
  if (!input.size) return "Please choose a size.";
  const copies = Number(input.cartQty ?? 1);
  if (!Number.isInteger(copies) || copies < 1 || copies > 99) return "Please choose a quantity between 1 and 99.";
  if (!isFlowProduct(input.configurator) && (input.tribute || input.composition)) return "This portrait option is not available.";
  return null;
}

export async function quoteCheckout(input: PricingInput, customerEmail?: string) {
  let priced = input;
  if (input.productType === "landing_offer") {
    const offer = await getSellableFixedOffer(String(input.offerId || ""));
    if (!offer || offer.price == null) throw new Error("This product is not available.");
    priced = { ...input, offerAmount: offer.price, productLabel: offer.name };
  }

  const { catalog } = await loadPriceCatalog();
  const unavailable = portraitOptionProblem(priced, catalog);
  if (unavailable) throw new Error(unavailable);

  if ((priced.productType || "portrait") === "portrait") {
    const problem = portraitInputProblem(priced, catalog);
    if (problem) throw new Error(problem);
  }

  // Multi-Pet / You & Your Pet: their own admin switches decide what may be sold (handoffs: backend is the source of truth).
  if ((priced.productType || "portrait") === "portrait" && isFlowProduct(priced.configurator)) {
    const content = await loadProductContent(priced.configurator);
    catalog.limitedBackgrounds = limitedBackgroundIds(content);
    const problem = configuratorPricingProblem(priced, priced.configurator, content);
    if (problem) throw new Error(problem);
  }

  const clean: PricingInput = { ...priced, couponRule: null };
  const originalAmount = calculateOriginalAmount(clean, catalog);
  const resolved = await resolveCoupon(clean.couponCode, {
    orderAmount: originalAmount,
    customerEmail,
  });
  if (!resolved.ok) throw new Error(resolved.error);
  return calculateQuote({ ...clean, couponRule: resolved.rule, couponCode: resolved.rule?.code ?? null }, catalog);
}
