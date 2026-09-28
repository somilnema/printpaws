export type ProductType =
  | "portrait"
  | "custom_payment"
  | "fresh_payment"
  | "digital_download";

export type PaymentMethod = "prepaid" | "cod";

export type PortraitStyle = "framed" | "canvas";

export type CouponScope = "all" | "portrait" | "mug" | "magnet" | "digital";

export const COUPON_SCOPES: CouponScope[] = ["all", "portrait", "mug", "magnet", "digital"];

/** Rules the server has already accepted. Checkout never trusts this from the browser. */
export type CouponRule = {
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  appliesTo: CouponScope[];
  minOrderAmount: number | null;
};

export type PriceCatalog = {
  framed: Record<string, number>;
  canvas: Record<string, number>;
  pets: Record<string, number>;
  halo: number;
  giftWrap: number;
  premiumBackground: number;
  mug: { price: number; compareAt: number };
  magnet: { price: number; compareAt: number };
  digital: { price: number; compareAt: number };
  prepaidPercent: number;
  codAdvancePercent: number;
  customPayments: number[];
  freshPayment: number;
  digitalDownloads: number[];
};

export type PricingInput = {
  productType: ProductType;
  portraitStyle?: PortraitStyle;
  size?: string;
  numPets?: string;
  background?: string;
  addon?: string;
  giftWrap?: boolean;
  cartQty?: number;
  addDigitalDownload?: boolean;
  addMagnet?: boolean;
  addMug?: boolean;
  customPaymentAmount?: number;
  digitalDownloadAmount?: number;
  couponCode?: string | null;
  couponRule?: CouponRule | null;
  paymentMethod?: PaymentMethod;
};

export type Quote = {
  productType: ProductType;
  productLabel: string;
  originalAmount: number;
  couponCode: string | null;
  couponType: "percent" | "fixed" | null;
  couponValue: number;
  couponPercent: number;
  couponDiscount: number;
  couponRule: CouponRule | null;
  afterCouponAmount: number;
  prepaidDiscount: number;
  prepaidPercent: number;
  advancePercent: number;
  remainingPercent: number;
  advanceAmount: number;
  remainingAmount: number;
  payableNow: number;
  paymentMethod: PaymentMethod;
  allowsCod: boolean;
};

export const DEFAULT_CATALOG: PriceCatalog = {
  framed: {
    '8"x10"': 1499,
    '12"x16"': 1999,
    '18"x24"': 2499,
  },
  canvas: {
    '8"x12"': 1699,
    '16"x20"': 2499,
    '20"x30"': 3499,
  },
  pets: {
    one: 0,
    two: 300,
    three: 600,
    four: 1500,
  },
  halo: 200,
  giftWrap: 99,
  premiumBackground: 199,
  mug: { price: 600, compareAt: 799 },
  magnet: { price: 200, compareAt: 299 },
  digital: { price: 300, compareAt: 399 },
  prepaidPercent: 4,
  codAdvancePercent: 40,
  customPayments: [500, 600],
  freshPayment: 200,
  digitalDownloads: [300, 500],
};

export const FRAMED_SIZES = ['8"x10"', '12"x16"', '18"x24"'] as const;
export const CANVAS_SIZES = ['8"x12"', '16"x20"', '20"x30"'] as const;

export const PREPAID_DISCOUNT_PERCENT = DEFAULT_CATALOG.prepaidPercent;
export const COD_ADVANCE_PERCENT = DEFAULT_CATALOG.codAdvancePercent;
export const COD_REMAINING_PERCENT = 100 - DEFAULT_CATALOG.codAdvancePercent;

export const FRAMED_SIZE_PRICES = DEFAULT_CATALOG.framed;
export const CANVAS_SIZE_PRICES = DEFAULT_CATALOG.canvas;
export const PET_UPGRADES = DEFAULT_CATALOG.pets;
export const ADDON_PRICES: Record<string, number> = {
  halo_effect: DEFAULT_CATALOG.halo,
  none: 0,
};
export const GIFT_WRAP_PRICE = DEFAULT_CATALOG.giftWrap;
export const PREMIUM_BACKGROUND_PRICE = DEFAULT_CATALOG.premiumBackground;

export const EXTRA_PRODUCTS = {
  mug: {
    id: "mug" as const,
    label: "Custom Pet Mug",
    description: "Create a custom mug using your pet's image.",
    price: DEFAULT_CATALOG.mug.price,
    compareAt: DEFAULT_CATALOG.mug.compareAt,
    image: "/extras/mug.jpg",
  },
  magnet: {
    id: "magnet" as const,
    label: "Custom Pet Fridge Magnet",
    description: "A custom fridge magnet of your pet.",
    price: DEFAULT_CATALOG.magnet.price,
    compareAt: DEFAULT_CATALOG.magnet.compareAt,
    image: "/extras/magnet.jpg",
  },
  digital: {
    id: "digital" as const,
    label: "Digital Download",
    description: "Digital file suitable for wallpapers and other digital uses.",
    price: DEFAULT_CATALOG.digital.price,
    compareAt: DEFAULT_CATALOG.digital.compareAt,
    image: "/extras/digital-download.jpg",
  },
} as const;

export const MUG_PRICE = EXTRA_PRODUCTS.mug.price;
export const MAGNET_PRICE = EXTRA_PRODUCTS.magnet.price;
export const DIGITAL_DOWNLOAD_ADDON_PRICE = EXTRA_PRODUCTS.digital.price;
export const GIFT_OPTION_PRICE = DIGITAL_DOWNLOAD_ADDON_PRICE;

export const CUSTOM_PAYMENT_AMOUNTS = DEFAULT_CATALOG.customPayments;
export const FRESH_PAYMENT_AMOUNT = DEFAULT_CATALOG.freshPayment;
export const DIGITAL_DOWNLOAD_AMOUNTS = DEFAULT_CATALOG.digitalDownloads;

export const COUPONS: Record<string, { percent: number; active: boolean; label: string }> = {
  WELCOME10: { percent: 10, active: true, label: "10% off" },
};

export const PRODUCT_LABELS: Record<ProductType, string> = {
  portrait: "Custom Pet Portrait",
  custom_payment: "Custom Payment",
  fresh_payment: "Fresh Payment",
  digital_download: "Digital Download",
};

export const PORTRAIT_STYLE_LABELS: Record<PortraitStyle, string> = {
  framed: "Framed Portrait",
  canvas: "Canvas Portrait",
};

export const PET_COUNT_LABELS: Record<string, string> = {
  one: "1 Pet",
  two: "2 Pets",
  three: "3 Pets",
  four: "4 Pets",
};

export type PriceLine = { id: string; label: string; price: number };

function rupees(value: number) {
  return Math.round(value);
}

export function cloneCatalog(catalog: PriceCatalog = DEFAULT_CATALOG): PriceCatalog {
  return {
    framed: { ...catalog.framed },
    canvas: { ...catalog.canvas },
    pets: { ...catalog.pets },
    halo: catalog.halo,
    giftWrap: catalog.giftWrap,
    premiumBackground: catalog.premiumBackground,
    mug: { ...catalog.mug },
    magnet: { ...catalog.magnet },
    digital: { ...catalog.digital },
    prepaidPercent: catalog.prepaidPercent,
    codAdvancePercent: catalog.codAdvancePercent,
    customPayments: [...catalog.customPayments],
    freshPayment: catalog.freshPayment,
    digitalDownloads: [...catalog.digitalDownloads],
  };
}

export function extraCatalog(catalog: PriceCatalog, id: "mug" | "magnet" | "digital") {
  const meta = EXTRA_PRODUCTS[id];
  const money = catalog[id];
  return {
    ...meta,
    price: money.price,
    compareAt: money.compareAt,
  };
}

export function extraProductLines(
  input: Pick<PricingInput, "addMug" | "addMagnet" | "addDigitalDownload">,
  catalog: PriceCatalog = DEFAULT_CATALOG
) {
  const lines: { id: string; label: string; price: number }[] = [];
  if (input.addMug) lines.push({ id: "mug", label: EXTRA_PRODUCTS.mug.label, price: catalog.mug.price });
  if (input.addMagnet) lines.push({ id: "magnet", label: EXTRA_PRODUCTS.magnet.label, price: catalog.magnet.price });
  if (input.addDigitalDownload) {
    lines.push({ id: "digital", label: EXTRA_PRODUCTS.digital.label, price: catalog.digital.price });
  }
  return lines;
}

export function extrasTotal(
  input: Pick<PricingInput, "addMug" | "addMagnet" | "addDigitalDownload">,
  catalog: PriceCatalog = DEFAULT_CATALOG
) {
  return extraProductLines(input, catalog).reduce((sum, line) => sum + line.price, 0);
}

export function frameColorLabel(frame: string, style: PortraitStyle) {
  if (style === "canvas") return "Canvas wrap";
  if (frame === "white") return "White Frame";
  return "Black Frame";
}

export function getPortraitBreakdown(input: PricingInput, catalog: PriceCatalog = DEFAULT_CATALOG) {
  const style: PortraitStyle = input.portraitStyle === "canvas" ? "canvas" : "framed";
  const size = input.size || (style === "canvas" ? '8"x12"' : '8"x10"');
  const sizePrice =
    style === "framed"
      ? (catalog.framed[size] ?? catalog.framed['8"x10"'] ?? 0)
      : (catalog.canvas[size] ?? catalog.canvas['8"x12"'] ?? 0);
  const petUpgrade = catalog.pets[input.numPets || "one"] ?? 0;
  const halo = input.addon === "halo_effect" ? catalog.halo : 0;
  const wrap = input.giftWrap ? catalog.giftWrap : 0;
  const premiumBg = ["bg7", "bg8", "bg9"].includes(input.background || "") ? catalog.premiumBackground : 0;
  const qty = Math.max(1, input.cartQty || 1);
  const extras = extraProductLines(input, catalog);

  const portraitLines: PriceLine[] = [
    { id: "size", label: `${PORTRAIT_STYLE_LABELS[style]} · ${size}`, price: sizePrice * qty },
  ];
  if (petUpgrade > 0) {
    portraitLines.push({
      id: "pets",
      label: `${PET_COUNT_LABELS[input.numPets || "one"] || "Pets"} upgrade`,
      price: petUpgrade * qty,
    });
  }
  if (halo > 0) portraitLines.push({ id: "halo", label: "Halo Effect", price: halo * qty });
  if (wrap > 0) portraitLines.push({ id: "wrap", label: "Gift Wrap", price: wrap * qty });
  if (premiumBg > 0) portraitLines.push({ id: "bg", label: "Premium background", price: premiumBg * qty });

  const portraitSubtotal = (sizePrice + petUpgrade + halo + wrap + premiumBg) * qty;
  return {
    style,
    size,
    sizePrice: sizePrice * qty,
    petUpgrade: petUpgrade * qty,
    halo: halo * qty,
    wrap: wrap * qty,
    premiumBg: premiumBg * qty,
    extras,
    extrasAmount: extras.reduce((sum, line) => sum + line.price, 0),
    portraitLines,
    portraitSubtotal,
  };
}

export function normalizeCouponCode(code?: string | null) {
  return (code || "").trim().toUpperCase();
}

export function getCoupon(code?: string | null) {
  const normalized = normalizeCouponCode(code);
  if (!normalized) return { ok: true as const, coupon: null, code: null };
  const coupon = COUPONS[normalized];
  if (!coupon) return { ok: false as const, error: "This coupon code is invalid." };
  if (!coupon.active) return { ok: false as const, error: "This coupon has expired or is no longer active." };
  return { ok: true as const, coupon, code: normalized };
}

export function calculatePortraitBasePrice(input: PricingInput, catalog: PriceCatalog = DEFAULT_CATALOG) {
  const style: PortraitStyle = input.portraitStyle === "canvas" ? "canvas" : "framed";
  const size = input.size || (style === "canvas" ? '8"x12"' : '8"x10"');
  let price =
    style === "framed"
      ? (catalog.framed[size] ?? catalog.framed['8"x10"'] ?? 0)
      : (catalog.canvas[size] ?? catalog.canvas['8"x12"'] ?? 0);

  price += catalog.pets[input.numPets || "one"] ?? 0;

  if (["bg7", "bg8", "bg9"].includes(input.background || "")) {
    price += catalog.premiumBackground;
  }

  const addon = input.addon || "none";
  if (addon === "halo_effect") price += catalog.halo;
  else if (addon !== "none") price += 100;

  if (input.giftWrap) price += catalog.giftWrap;

  const qty = Math.max(1, input.cartQty || 1);
  price *= qty;

  if (input.addMagnet) price += catalog.magnet.price;
  if (input.addMug) price += catalog.mug.price;
  if (input.addDigitalDownload) price += catalog.digital.price;

  return price;
}

export function calculateOriginalAmount(input: PricingInput, catalog: PriceCatalog = DEFAULT_CATALOG) {
  switch (input.productType) {
    case "custom_payment": {
      const amount = Number(input.customPaymentAmount);
      if (catalog.customPayments.includes(amount)) return amount;
      throw new Error("Select a valid Custom Payment amount.");
    }
    case "fresh_payment":
      return catalog.freshPayment;
    case "digital_download": {
      const amount = Number(input.digitalDownloadAmount);
      if (catalog.digitalDownloads.includes(amount)) return amount;
      throw new Error("Select a valid Digital Download amount.");
    }
    default:
      return calculatePortraitBasePrice(input, catalog);
  }
}

function couponEligibleAmount(input: PricingInput, catalog: PriceCatalog, appliesTo: CouponScope[]) {
  const scopes = appliesTo.includes("all") ? (["all"] as CouponScope[]) : appliesTo;
  if (scopes.includes("all")) return calculateOriginalAmount(input, catalog);

  if (input.productType === "digital_download") {
    return scopes.includes("digital") ? calculateOriginalAmount(input, catalog) : 0;
  }
  if (input.productType !== "portrait") return 0;

  const breakdown = getPortraitBreakdown(input, catalog);
  let sum = 0;
  if (scopes.includes("portrait")) sum += breakdown.portraitSubtotal;
  for (const line of breakdown.extras) {
    if (line.id === "mug" && scopes.includes("mug")) sum += line.price;
    if (line.id === "magnet" && scopes.includes("magnet")) sum += line.price;
    if (line.id === "digital" && scopes.includes("digital")) sum += line.price;
  }
  return sum;
}

function ruleFromLegacy(code: string): CouponRule | null {
  const legacy = getCoupon(code);
  if (!legacy.ok) throw new Error(legacy.error);
  if (!legacy.coupon || !legacy.code) return null;
  return {
    code: legacy.code,
    discountType: "percent",
    discountValue: legacy.coupon.percent,
    appliesTo: ["all"],
    minOrderAmount: null,
  };
}

export function productAllowsCod(productType: ProductType) {
  return productType === "portrait";
}

/**
 * Coupon applies first, only to the products it is allowed to cover.
 * Prepaid percent then applies to the full amount after that coupon.
 * Cash on delivery does not get the prepaid discount. Pay-now is the advance percent of the amount after coupon.
 */
export function calculateQuote(input: PricingInput, catalog: PriceCatalog = DEFAULT_CATALOG): Quote {
  const productType = input.productType || "portrait";
  const paymentMethod: PaymentMethod =
    input.paymentMethod === "cod" && productAllowsCod(productType) ? "cod" : "prepaid";

  const originalAmount = calculateOriginalAmount(input, catalog);
  const rule = input.couponRule ? input.couponRule : input.couponCode ? ruleFromLegacy(input.couponCode) : null;

  let couponDiscount = 0;
  if (rule) {
    if (rule.minOrderAmount != null && originalAmount < rule.minOrderAmount) {
      throw new Error(`This coupon needs an order of at least ${formatRupee(rule.minOrderAmount)}.`);
    }
    const eligible = couponEligibleAmount(input, catalog, rule.appliesTo);
    if (eligible <= 0) {
      throw new Error("This coupon does not apply to the products in this order.");
    }
    couponDiscount =
      rule.discountType === "fixed"
        ? Math.min(rule.discountValue, eligible)
        : rupees(eligible * (rule.discountValue / 100));
  }

  const afterCouponAmount = originalAmount - couponDiscount;
  const allowsCod = productAllowsCod(productType);
  const prepaidPercent = paymentMethod === "prepaid" ? catalog.prepaidPercent : 0;
  const prepaidDiscount = rupees(afterCouponAmount * (prepaidPercent / 100));
  const advancePercent = catalog.codAdvancePercent;
  const remainingPercent = 100 - advancePercent;

  const shared = {
    productType,
    productLabel: PRODUCT_LABELS[productType],
    originalAmount,
    couponCode: rule?.code ?? null,
    couponType: rule?.discountType ?? null,
    couponValue: rule?.discountValue ?? 0,
    couponPercent: rule?.discountType === "percent" ? rule.discountValue : 0,
    couponDiscount,
    couponRule: rule,
    afterCouponAmount,
    allowsCod,
  };

  if (paymentMethod === "cod") {
    const advanceAmount = rupees(afterCouponAmount * (advancePercent / 100));
    const remainingAmount = afterCouponAmount - advanceAmount;
    return {
      ...shared,
      prepaidDiscount: 0,
      prepaidPercent: 0,
      advancePercent,
      remainingPercent,
      advanceAmount,
      remainingAmount,
      payableNow: advanceAmount,
      paymentMethod,
    };
  }

  const payableNow = afterCouponAmount - prepaidDiscount;
  return {
    ...shared,
    prepaidDiscount,
    prepaidPercent,
    advancePercent: 100,
    remainingPercent: 0,
    advanceAmount: payableNow,
    remainingAmount: 0,
    payableNow,
    paymentMethod,
  };
}

export function formatRupee(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

export function formatRs(value: number) {
  return `Rs. ${Math.round(value).toLocaleString("en-IN")}`;
}

export function couponOffLabel(quote: Pick<Quote, "couponType" | "couponValue" | "couponPercent">) {
  if (quote.couponType === "fixed") return formatRupee(quote.couponValue);
  return `${quote.couponPercent}%`;
}
