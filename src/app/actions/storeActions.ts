"use server";

import { getAdminSession } from "@/lib/admin-auth";
import {
  cloneCatalog,
  cloneOptionMeta,
  DEFAULT_CATALOG,
  firstAvailablePets,
  firstAvailableSize,
  firstAvailableStyle,
  FRAMED_SIZES,
  CANVAS_SIZES,
  isOptionSelectable,
  MAX_SIZE_INCHES,
  OPTION_STATUSES,
  parseSize,
  type OptionMeta,
  type OptionStatus,
  type PriceCatalog,
} from "@/lib/pricing";
import {
  deleteCoupon,
  listCoupons,
  loadPriceCatalog,
  saveCoupon,
  savePriceCatalog,
  type CouponInput,
  type CouponRecord,
} from "@/lib/store-config";

export type StoreAdmin = {
  catalog: PriceCatalog;
  ready: boolean;
  error?: string;
  coupons: CouponRecord[];
};

const MAX_SIZES_PER_STYLE = 12;

function whole(value: number, label: string) {
  if (!Number.isInteger(value) || value < 0) return `${label} must be a whole number, 0 or more.`;
  return "";
}

/** Cleans one style's sizes. Built-in sizes always stay (they can be hidden); added ones must be real sizes. */
function validateSizes(
  label: string,
  builtIn: readonly string[],
  defaults: Record<string, number>,
  prices: Record<string, number>,
  options: Record<string, OptionMeta>,
  checks: string[]
) {
  for (const size of builtIn) {
    if (prices[size] == null) prices[size] = defaults[size];
  }
  const sizes = Object.keys(prices);
  if (sizes.length > MAX_SIZES_PER_STYLE) checks.push(`${label} can have up to ${MAX_SIZES_PER_STYLE} sizes.`);

  const cleaned: Record<string, OptionMeta> = {};
  for (const size of sizes) {
    const parsed = parseSize(size);
    if (!parsed || parsed.w < 1 || parsed.h < 1 || parsed.w > MAX_SIZE_INCHES || parsed.h > MAX_SIZE_INCHES) {
      checks.push(`${label} size ${size} is not valid. Use whole inches from 1 to ${MAX_SIZE_INCHES}.`);
      continue;
    }
    prices[size] = Math.round(Number(prices[size]));
    checks.push(whole(prices[size], `${label} ${size}`));
    const status = (options[size]?.status || "available") as OptionStatus;
    if (!OPTION_STATUSES.includes(status)) checks.push(`${label} ${size} needs a valid shop status.`);
    cleaned[size] = cloneOptionMeta({ status, badge: String(options[size]?.badge || "").trim().slice(0, 40) });
  }
  return cleaned;
}

function validateCatalog(input: PriceCatalog): { ok: true; catalog: PriceCatalog } | { ok: false; error: string } {
  const catalog = cloneCatalog(input);
  const checks: string[] = [];

  catalog.options.framedSizes = validateSizes("Framed", FRAMED_SIZES, DEFAULT_CATALOG.framed, catalog.framed, catalog.options.framedSizes, checks);
  catalog.options.canvasSizes = validateSizes("Canvas", CANVAS_SIZES, DEFAULT_CATALOG.canvas, catalog.canvas, catalog.options.canvasSizes, checks);

  for (const key of ["two", "three", "four", "human"] as const) {
    catalog.pets[key] = Math.round(Number(catalog.pets[key]));
    checks.push(whole(catalog.pets[key], key === "human" ? "Human + pet" : `${key} pets`));
  }
  catalog.pets.one = 0;
  catalog.halo = Math.round(Number(catalog.halo));
  catalog.giftWrap = Math.round(Number(catalog.giftWrap));
  catalog.premiumBackground = Math.round(Number(catalog.premiumBackground));
  catalog.familyUpgrade = Math.round(Number(catalog.familyUpgrade));
  catalog.multiPetHalo = Math.round(Number(catalog.multiPetHalo));
  checks.push(whole(catalog.familyUpgrade, "You & Your Pet family upgrade"));
  checks.push(whole(catalog.multiPetHalo, "Multi-Pet halo"));
  checks.push(whole(catalog.halo, "Halo"));
  checks.push(whole(catalog.giftWrap, "Gift wrap"));
  checks.push(whole(catalog.premiumBackground, "Premium background"));

  catalog.mug.price = Math.round(Number(catalog.mug.price));
  catalog.mug.compareAt = Math.round(Number(catalog.mug.compareAt));
  catalog.magnet.price = Math.round(Number(catalog.magnet.price));
  catalog.magnet.compareAt = Math.round(Number(catalog.magnet.compareAt));
  catalog.digital.price = Math.round(Number(catalog.digital.price));
  catalog.digital.compareAt = Math.round(Number(catalog.digital.compareAt));
  for (const [label, item] of [
    ["Mug", catalog.mug],
    ["Magnet", catalog.magnet],
    ["Digital download", catalog.digital],
  ] as const) {
    checks.push(whole(item.price, `${label} price`));
    checks.push(whole(item.compareAt, `${label} crossed-out price`));
  }

  // Desk Portrait / Signature Gift Bundle: 0 is allowed (0 = not on sale; the shop and server refuse it).
  catalog.miniDesk = {
    price: Math.round(Number(catalog.miniDesk.price)),
    twoPets: Math.round(Number(catalog.miniDesk.twoPets)),
    threePets: Math.round(Number(catalog.miniDesk.threePets)),
  };
  catalog.giftBundle = {
    essential: Math.round(Number(catalog.giftBundle.essential)),
    signature: Math.round(Number(catalog.giftBundle.signature)),
    greetingCard: Math.round(Number(catalog.giftBundle.greetingCard)),
  };
  checks.push(whole(catalog.miniDesk.price, "Desk Portrait price"));
  checks.push(whole(catalog.miniDesk.twoPets, "Desk Portrait extra for 2 pets"));
  checks.push(whole(catalog.miniDesk.threePets, "Desk Portrait extra for 3 pets"));
  checks.push(whole(catalog.giftBundle.essential, "Essential Gift Bundle price"));
  checks.push(whole(catalog.giftBundle.signature, "Signature Gift Bundle price"));
  checks.push(whole(catalog.giftBundle.greetingCard, "Personalised Greeting Card price"));

  catalog.prepaidPercent = Math.round(Number(catalog.prepaidPercent));
  catalog.codAdvancePercent = Math.round(Number(catalog.codAdvancePercent));
  if (catalog.prepaidPercent < 0 || catalog.prepaidPercent > 100) {
    checks.push("Prepaid discount must be from 0 to 100.");
  }
  if (catalog.codAdvancePercent < 1 || catalog.codAdvancePercent > 99) {
    checks.push("Cash on delivery pay-now must be from 1 to 99. The rest is due on delivery.");
  }

  catalog.customPayments = catalog.customPayments.map((n) => Math.round(Number(n)));
  catalog.digitalDownloads = catalog.digitalDownloads.map((n) => Math.round(Number(n)));
  catalog.freshPayment = Math.round(Number(catalog.freshPayment));
  if (catalog.customPayments.length !== 2 || catalog.customPayments.some((n) => n < 1)) {
    checks.push("Custom payment needs two amounts of at least ₹1.");
  } else if (catalog.customPayments[0] === catalog.customPayments[1]) {
    checks.push("The two custom payment amounts must be different.");
  }
  if (catalog.freshPayment < 1) checks.push("Fresh payment must be at least ₹1.");
  if (catalog.digitalDownloads.length !== 2 || catalog.digitalDownloads.some((n) => n < 1)) {
    checks.push("Standalone digital download needs two amounts of at least ₹1.");
  } else if (catalog.digitalDownloads[0] === catalog.digitalDownloads[1]) {
    checks.push("The two digital download amounts must be different.");
  }

  const options = catalog.options;
  for (const style of ["canvas", "framed"] as const) {
    const status = options.styles[style].status;
    if (!OPTION_STATUSES.includes(status)) checks.push(`Portrait style (${style}) needs a valid shop status.`);
    options.styles[style] = cloneOptionMeta({
      status,
      badge: String(options.styles[style].badge || "").trim().slice(0, 40),
    });
  }
  for (const id of ["one", "two", "three", "four", "human"] as const) {
    const status = (options.pets[id]?.status || "available") as OptionStatus;
    if (!OPTION_STATUSES.includes(status)) checks.push(`Pet option (${id}) needs a valid shop status.`);
    options.pets[id] = cloneOptionMeta({
      status,
      badge: String(options.pets[id]?.badge || "").trim().slice(0, 40),
    });
  }

  if (!firstAvailableStyle(catalog)) {
    checks.push("At least one portrait style must be available with at least one size in stock.");
  } else {
    if (isOptionSelectable(options.styles.canvas) && !firstAvailableSize("canvas", catalog)) {
      checks.push("Canvas is available, so at least one canvas size must also be available.");
    }
    if (isOptionSelectable(options.styles.framed) && !firstAvailableSize("framed", catalog)) {
      checks.push("Framed is available, so at least one framed size must also be available.");
    }
  }
  if (!firstAvailablePets(catalog)) {
    checks.push("At least one pet option must be available.");
  }

  const error = checks.find(Boolean);
  if (error) return { ok: false, error };
  return { ok: true, catalog };
}

export async function getStoreAdmin(): Promise<StoreAdmin | null> {
  const session = await getAdminSession();
  if (!session) return null;
  const [prices, coupons] = await Promise.all([loadPriceCatalog(), listCoupons()]);
  return {
    catalog: prices.catalog,
    ready: prices.ready && coupons.ready,
    error: prices.error || coupons.error,
    coupons: coupons.coupons,
  };
}

export async function updatePrices(input: PriceCatalog) {
  const session = await getAdminSession();
  if (!session) return { ok: false as const, error: "Sign in again to continue." };
  const checked = validateCatalog(input);
  if (!checked.ok) return checked;
  return savePriceCatalog(checked.catalog);
}

export async function updateCoupon(input: CouponInput) {
  const session = await getAdminSession();
  if (!session) return { ok: false as const, error: "Sign in again to continue." };
  return saveCoupon(input);
}

export async function removeCoupon(id: string) {
  const session = await getAdminSession();
  if (!session) return { ok: false as const, error: "Sign in again to continue." };
  if (!id) return { ok: false as const, error: "Choose a coupon to delete." };
  return deleteCoupon(id);
}
