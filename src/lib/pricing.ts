export type ProductType =
  | "portrait"
  | "custom_payment"
  | "fresh_payment"
  | "digital_download";

export type PaymentMethod = "prepaid" | "cod";

export type PortraitStyle = "framed" | "canvas";

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
  paymentMethod?: PaymentMethod;
};

export type Quote = {
  productType: ProductType;
  productLabel: string;
  originalAmount: number;
  couponCode: string | null;
  couponPercent: number;
  couponDiscount: number;
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

export const PREPAID_DISCOUNT_PERCENT = 4;
export const COD_ADVANCE_PERCENT = 40;
export const COD_REMAINING_PERCENT = 60;

export const FRAMED_SIZE_PRICES: Record<string, number> = {
  '8"x10"': 1499,
  '12"x16"': 1999,
  '18"x24"': 2499,
};

export const CANVAS_SIZE_PRICES: Record<string, number> = {
  '8"x12"': 1699,
  '16"x20"': 2499,
  '20"x30"': 3499,
};

export const PET_UPGRADES: Record<string, number> = {
  one: 0,
  two: 300,
  three: 600,
  four: 1500,
};

export const ADDON_PRICES: Record<string, number> = {
  halo_effect: 200,
  none: 0,
};

export const GIFT_WRAP_PRICE = 99;
export const PREMIUM_BACKGROUND_PRICE = 199;

export const EXTRA_PRODUCTS = {
  mug: {
    id: "mug" as const,
    label: "Custom Pet Mug",
    description: "Create a custom mug using your pet's image.",
    price: 600,
    compareAt: 799,
    image: "/extras/mug.jpg",
  },
  magnet: {
    id: "magnet" as const,
    label: "Custom Pet Fridge Magnet",
    description: "A custom fridge magnet of your pet.",
    price: 200,
    compareAt: 299,
    image: "/extras/magnet.jpg",
  },
  digital: {
    id: "digital" as const,
    label: "Digital Download",
    description: "Digital file suitable for wallpapers and other digital uses.",
    price: 300,
    compareAt: 399,
    image: "/extras/digital-download.jpg",
  },
} as const;

export const MUG_PRICE = EXTRA_PRODUCTS.mug.price;
export const MAGNET_PRICE = EXTRA_PRODUCTS.magnet.price;
export const DIGITAL_DOWNLOAD_ADDON_PRICE = EXTRA_PRODUCTS.digital.price;
export const GIFT_OPTION_PRICE = DIGITAL_DOWNLOAD_ADDON_PRICE;

export function extraProductLines(input: Pick<PricingInput, "addMug" | "addMagnet" | "addDigitalDownload">) {
  const lines: { id: string; label: string; price: number }[] = [];
  if (input.addMug) lines.push({ id: "mug", label: EXTRA_PRODUCTS.mug.label, price: MUG_PRICE });
  if (input.addMagnet) lines.push({ id: "magnet", label: EXTRA_PRODUCTS.magnet.label, price: MAGNET_PRICE });
  if (input.addDigitalDownload) {
    lines.push({
      id: "digital",
      label: EXTRA_PRODUCTS.digital.label,
      price: DIGITAL_DOWNLOAD_ADDON_PRICE,
    });
  }
  return lines;
}

export function extrasTotal(input: Pick<PricingInput, "addMug" | "addMagnet" | "addDigitalDownload">) {
  return extraProductLines(input).reduce((sum, line) => sum + line.price, 0);
}

export type PriceLine = { id: string; label: string; price: number };

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

export function frameColorLabel(frame: string, style: PortraitStyle) {
  if (style === "canvas") return "Canvas wrap";
  if (frame === "white") return "White Frame";
  return "Black Frame";
}

export function getPortraitBreakdown(input: PricingInput) {
  const style: PortraitStyle = input.portraitStyle === "canvas" ? "canvas" : "framed";
  const size = input.size || (style === "canvas" ? '8"x12"' : '8"x10"');
  const sizePrice =
    style === "framed" ? (FRAMED_SIZE_PRICES[size] ?? 1499) : (CANVAS_SIZE_PRICES[size] ?? 1699);
  const petUpgrade = PET_UPGRADES[input.numPets || "one"] ?? 0;
  const halo = input.addon === "halo_effect" ? ADDON_PRICES.halo_effect : 0;
  const wrap = input.giftWrap ? GIFT_WRAP_PRICE : 0;
  const premiumBg = ["bg7", "bg8", "bg9"].includes(input.background || "")
    ? PREMIUM_BACKGROUND_PRICE
    : 0;
  const qty = Math.max(1, input.cartQty || 1);
  const extras = extraProductLines(input);

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
  if (halo > 0) {
    portraitLines.push({ id: "halo", label: "Halo Effect", price: halo * qty });
  }
  if (wrap > 0) {
    portraitLines.push({ id: "wrap", label: "Gift Wrap", price: wrap * qty });
  }
  if (premiumBg > 0) {
    portraitLines.push({ id: "bg", label: "Premium background", price: premiumBg * qty });
  }

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

export const CUSTOM_PAYMENT_AMOUNTS = [500, 600] as const;
export const FRESH_PAYMENT_AMOUNT = 200;
export const DIGITAL_DOWNLOAD_AMOUNTS = [300, 500] as const;

export const COUPONS: Record<
  string,
  { percent: number; active: boolean; label: string }
> = {
  WELCOME10: {
    percent: 10,
    active: true,
    label: "10% off",
  },
};

export const PRODUCT_LABELS: Record<ProductType, string> = {
  portrait: "Custom Pet Portrait",
  custom_payment: "Custom Payment",
  fresh_payment: "Fresh Payment",
  digital_download: "Digital Download",
};

function rupees(value: number) {
  return Math.round(value);
}

export function normalizeCouponCode(code?: string | null) {
  return (code || "").trim().toUpperCase();
}

export function getCoupon(code?: string | null) {
  const normalized = normalizeCouponCode(code);
  if (!normalized) return { ok: true as const, coupon: null, code: null };
  const coupon = COUPONS[normalized];
  if (!coupon) {
    return { ok: false as const, error: "This coupon code is invalid." };
  }
  if (!coupon.active) {
    return { ok: false as const, error: "This coupon has expired or is no longer active." };
  }
  return { ok: true as const, coupon, code: normalized };
}

export function calculatePortraitBasePrice(input: PricingInput) {
  const style: PortraitStyle = input.portraitStyle === "canvas" ? "canvas" : "framed";
  const size = input.size || (style === "canvas" ? '8"x12"' : '8"x10"');
  let price =
    style === "framed"
      ? (FRAMED_SIZE_PRICES[size] ?? 1499)
      : (CANVAS_SIZE_PRICES[size] ?? 1699);

  price += PET_UPGRADES[input.numPets || "one"] ?? 0;

  if (["bg7", "bg8", "bg9"].includes(input.background || "")) {
    price += PREMIUM_BACKGROUND_PRICE;
  }

  const addon = input.addon || "none";
  if (addon === "halo_effect") price += ADDON_PRICES.halo_effect;
  else if (addon !== "none") price += 100;

  if (input.giftWrap) price += GIFT_WRAP_PRICE;

  const qty = Math.max(1, input.cartQty || 1);
  price *= qty;

  if (input.addMagnet) price += MAGNET_PRICE;
  if (input.addMug) price += MUG_PRICE;
  if (input.addDigitalDownload) price += DIGITAL_DOWNLOAD_ADDON_PRICE;

  return price;
}

export function calculateOriginalAmount(input: PricingInput) {
  switch (input.productType) {
    case "custom_payment": {
      const amount = Number(input.customPaymentAmount);
      if (CUSTOM_PAYMENT_AMOUNTS.includes(amount as 500 | 600)) return amount;
      throw new Error("Select a valid Custom Payment amount.");
    }
    case "fresh_payment":
      return FRESH_PAYMENT_AMOUNT;
    case "digital_download": {
      const amount = Number(input.digitalDownloadAmount);
      if (DIGITAL_DOWNLOAD_AMOUNTS.includes(amount as 300 | 500)) return amount;
      throw new Error("Select a valid Digital Download amount.");
    }
    default:
      return calculatePortraitBasePrice(input);
  }
}

export function productAllowsCod(productType: ProductType) {
  return productType === "portrait";
}

/**
 * Coupon applies first. Prepaid 4% then applies to the coupon-discounted amount.
 * COD does not receive the prepaid 4% discount; 40/60 is calculated after coupon.
 */
export function calculateQuote(input: PricingInput): Quote {
  const productType = input.productType || "portrait";
  const paymentMethod: PaymentMethod =
    input.paymentMethod === "cod" && productAllowsCod(productType)
      ? "cod"
      : "prepaid";

  const originalAmount = calculateOriginalAmount(input);
  const couponResult = getCoupon(input.couponCode);
  if (!couponResult.ok) {
    throw new Error(couponResult.error);
  }

  const couponPercent = couponResult.coupon?.percent ?? 0;
  const couponDiscount = rupees(originalAmount * (couponPercent / 100));
  const afterCouponAmount = originalAmount - couponDiscount;

  const allowsCod = productAllowsCod(productType);
  const prepaidPercent = paymentMethod === "prepaid" ? PREPAID_DISCOUNT_PERCENT : 0;
  const prepaidDiscount = rupees(afterCouponAmount * (prepaidPercent / 100));

  if (paymentMethod === "cod") {
    const advanceAmount = rupees(afterCouponAmount * (COD_ADVANCE_PERCENT / 100));
    const remainingAmount = afterCouponAmount - advanceAmount;
    return {
      productType,
      productLabel: PRODUCT_LABELS[productType],
      originalAmount,
      couponCode: couponResult.code,
      couponPercent,
      couponDiscount,
      afterCouponAmount,
      prepaidDiscount: 0,
      prepaidPercent: 0,
      advancePercent: COD_ADVANCE_PERCENT,
      remainingPercent: COD_REMAINING_PERCENT,
      advanceAmount,
      remainingAmount,
      payableNow: advanceAmount,
      paymentMethod,
      allowsCod,
    };
  }

  const payableNow = afterCouponAmount - prepaidDiscount;
  return {
    productType,
    productLabel: PRODUCT_LABELS[productType],
    originalAmount,
    couponCode: couponResult.code,
    couponPercent,
    couponDiscount,
    afterCouponAmount,
    prepaidDiscount,
    prepaidPercent,
    advancePercent: 100,
    remainingPercent: 0,
    advanceAmount: payableNow,
    remainingAmount: 0,
    payableNow,
    paymentMethod,
    allowsCod,
  };
}

export function formatRupee(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

export function formatRs(value: number) {
  return `Rs. ${Math.round(value).toLocaleString("en-IN")}`;
}
