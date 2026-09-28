"use server";

import { getAdminSession } from "@/lib/admin-auth";
import {
  cloneCatalog,
  FRAMED_SIZES,
  CANVAS_SIZES,
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

function whole(value: number, label: string) {
  if (!Number.isInteger(value) || value < 0) return `${label} must be a whole number, 0 or more.`;
  return "";
}

function validateCatalog(input: PriceCatalog): { ok: true; catalog: PriceCatalog } | { ok: false; error: string } {
  const catalog = cloneCatalog(input);
  const checks: string[] = [];

  for (const size of FRAMED_SIZES) {
    catalog.framed[size] = Math.round(Number(catalog.framed[size]));
    checks.push(whole(catalog.framed[size], `Framed ${size}`));
  }
  for (const size of CANVAS_SIZES) {
    catalog.canvas[size] = Math.round(Number(catalog.canvas[size]));
    checks.push(whole(catalog.canvas[size], `Canvas ${size}`));
  }
  for (const key of ["two", "three", "four"] as const) {
    catalog.pets[key] = Math.round(Number(catalog.pets[key]));
    checks.push(whole(catalog.pets[key], `${key} pets`));
  }
  catalog.pets.one = 0;
  catalog.halo = Math.round(Number(catalog.halo));
  catalog.giftWrap = Math.round(Number(catalog.giftWrap));
  catalog.premiumBackground = Math.round(Number(catalog.premiumBackground));
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
