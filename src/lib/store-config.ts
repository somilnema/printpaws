import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  cloneCatalog,
  COUPON_SCOPES,
  DEFAULT_CATALOG,
  getCoupon,
  normalizeCouponCode,
  type CouponRule,
  type CouponScope,
  type PriceCatalog,
} from "@/lib/pricing";

export type CatalogLoad = {
  catalog: PriceCatalog;
  ready: boolean;
  error?: string;
};

export type CouponRecord = {
  id: string;
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  active: boolean;
  startsAt: string | null;
  endsAt: string | null;
  minOrderAmount: number | null;
  usageLimit: number | null;
  oncePerCustomer: boolean;
  appliesTo: CouponScope[];
  usageCount: number;
  createdAt: string;
};

const SETUP_HINT = "Run printpaws/supabase/store-pricing.sql in the Supabase SQL editor, then refresh.";

type PriceRow = { key: string; amount: number; compare_at: number | null };

const SIZE_KEYS: Record<string, { style: "framed" | "canvas"; size: string }> = {
  framed_8x10: { style: "framed", size: '8"x10"' },
  framed_12x16: { style: "framed", size: '12"x16"' },
  framed_18x24: { style: "framed", size: '18"x24"' },
  canvas_8x12: { style: "canvas", size: '8"x12"' },
  canvas_16x20: { style: "canvas", size: '16"x20"' },
  canvas_20x30: { style: "canvas", size: '20"x30"' },
};

export function isMissingTable(error: { message?: string; code?: string } | null) {
  if (!error) return false;
  return /PGRST205|42P01|does not exist|schema cache/i.test(`${error.code || ""} ${error.message || ""}`);
}

export function catalogFromRows(rows: PriceRow[]): PriceCatalog {
  const catalog = cloneCatalog();
  const byKey = new Map(rows.map((row) => [row.key, row]));

  for (const [key, meta] of Object.entries(SIZE_KEYS)) {
    const row = byKey.get(key);
    if (row) catalog[meta.style][meta.size] = row.amount;
  }

  const petsTwo = byKey.get("pets_two");
  const petsThree = byKey.get("pets_three");
  const petsFour = byKey.get("pets_four");
  if (petsTwo) catalog.pets.two = petsTwo.amount;
  if (petsThree) catalog.pets.three = petsThree.amount;
  if (petsFour) catalog.pets.four = petsFour.amount;

  const halo = byKey.get("addon_halo");
  const wrap = byKey.get("addon_gift_wrap");
  const bg = byKey.get("addon_premium_bg");
  if (halo) catalog.halo = halo.amount;
  if (wrap) catalog.giftWrap = wrap.amount;
  if (bg) catalog.premiumBackground = bg.amount;

  const mug = byKey.get("extra_mug");
  const magnet = byKey.get("extra_magnet");
  const digital = byKey.get("extra_digital");
  if (mug) catalog.mug = { price: mug.amount, compareAt: mug.compare_at ?? 0 };
  if (magnet) catalog.magnet = { price: magnet.amount, compareAt: magnet.compare_at ?? 0 };
  if (digital) catalog.digital = { price: digital.amount, compareAt: digital.compare_at ?? 0 };

  const prepaid = byKey.get("rule_prepaid_percent");
  const cod = byKey.get("rule_cod_advance_percent");
  if (prepaid) catalog.prepaidPercent = prepaid.amount;
  if (cod) catalog.codAdvancePercent = cod.amount;

  const customA = byKey.get("pay_custom_a");
  const customB = byKey.get("pay_custom_b");
  const fresh = byKey.get("pay_fresh");
  const digitalA = byKey.get("pay_digital_a");
  const digitalB = byKey.get("pay_digital_b");
  if (customA && customB) catalog.customPayments = [customA.amount, customB.amount];
  if (fresh) catalog.freshPayment = fresh.amount;
  if (digitalA && digitalB) catalog.digitalDownloads = [digitalA.amount, digitalB.amount];

  return catalog;
}

export function rowsFromCatalog(catalog: PriceCatalog): PriceRow[] {
  return [
    { key: "framed_8x10", amount: catalog.framed['8"x10"'], compare_at: null },
    { key: "framed_12x16", amount: catalog.framed['12"x16"'], compare_at: null },
    { key: "framed_18x24", amount: catalog.framed['18"x24"'], compare_at: null },
    { key: "canvas_8x12", amount: catalog.canvas['8"x12"'], compare_at: null },
    { key: "canvas_16x20", amount: catalog.canvas['16"x20"'], compare_at: null },
    { key: "canvas_20x30", amount: catalog.canvas['20"x30"'], compare_at: null },
    { key: "pets_two", amount: catalog.pets.two, compare_at: null },
    { key: "pets_three", amount: catalog.pets.three, compare_at: null },
    { key: "pets_four", amount: catalog.pets.four, compare_at: null },
    { key: "addon_halo", amount: catalog.halo, compare_at: null },
    { key: "addon_gift_wrap", amount: catalog.giftWrap, compare_at: null },
    { key: "addon_premium_bg", amount: catalog.premiumBackground, compare_at: null },
    { key: "extra_mug", amount: catalog.mug.price, compare_at: catalog.mug.compareAt },
    { key: "extra_magnet", amount: catalog.magnet.price, compare_at: catalog.magnet.compareAt },
    { key: "extra_digital", amount: catalog.digital.price, compare_at: catalog.digital.compareAt },
    { key: "rule_prepaid_percent", amount: catalog.prepaidPercent, compare_at: null },
    { key: "rule_cod_advance_percent", amount: catalog.codAdvancePercent, compare_at: null },
    { key: "pay_custom_a", amount: catalog.customPayments[0], compare_at: null },
    { key: "pay_custom_b", amount: catalog.customPayments[1], compare_at: null },
    { key: "pay_fresh", amount: catalog.freshPayment, compare_at: null },
    { key: "pay_digital_a", amount: catalog.digitalDownloads[0], compare_at: null },
    { key: "pay_digital_b", amount: catalog.digitalDownloads[1], compare_at: null },
  ];
}

export async function loadPriceCatalog(): Promise<CatalogLoad> {
  const { data, error } = await supabaseAdmin.from("price_items").select("key, amount, compare_at");
  if (error) {
    if (isMissingTable(error)) {
      return { catalog: cloneCatalog(DEFAULT_CATALOG), ready: false, error: SETUP_HINT };
    }
    return { catalog: cloneCatalog(DEFAULT_CATALOG), ready: false, error: error.message };
  }
  return { catalog: catalogFromRows((data || []) as PriceRow[]), ready: true };
}

export async function savePriceCatalog(catalog: PriceCatalog) {
  const rows = rowsFromCatalog(catalog).map((row) => ({
    ...row,
    updated_at: new Date().toISOString(),
  }));
  const { error } = await supabaseAdmin.from("price_items").upsert(rows, { onConflict: "key" });
  if (error) {
    if (isMissingTable(error)) return { ok: false as const, error: SETUP_HINT };
    return { ok: false as const, error: error.message };
  }
  return { ok: true as const };
}

function asScopes(value: unknown): CouponScope[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const scopes = value.filter((item): item is CouponScope => COUPON_SCOPES.includes(item as CouponScope));
  if (scopes.length !== value.length) return null;
  return scopes.includes("all") ? ["all"] : scopes;
}

function toCoupon(row: Record<string, unknown>, usageCount: number): CouponRecord | null {
  const appliesTo = asScopes(row.applies_to);
  const discountType = row.discount_type === "fixed" ? "fixed" : row.discount_type === "percent" ? "percent" : null;
  if (!appliesTo || !discountType || typeof row.id !== "string" || typeof row.code !== "string") return null;
  return {
    id: row.id,
    code: row.code,
    discountType,
    discountValue: Number(row.discount_value),
    active: Boolean(row.active),
    startsAt: (row.starts_at as string | null) ?? null,
    endsAt: (row.ends_at as string | null) ?? null,
    minOrderAmount: row.min_order_amount == null ? null : Number(row.min_order_amount),
    usageLimit: row.usage_limit == null ? null : Number(row.usage_limit),
    oncePerCustomer: Boolean(row.once_per_customer),
    appliesTo,
    usageCount,
    createdAt: String(row.created_at || ""),
  };
}

async function usageCounts() {
  const { data, error } = await supabaseAdmin.from("orders").select("coupon_code").not("coupon_code", "is", null);
  const counts = new Map<string, number>();
  if (error || !data) return counts;
  for (const row of data) {
    const code = normalizeCouponCode(row.coupon_code as string);
    if (!code) continue;
    counts.set(code, (counts.get(code) || 0) + 1);
  }
  return counts;
}

export async function listCoupons(): Promise<{ coupons: CouponRecord[]; ready: boolean; error?: string }> {
  const { data, error } = await supabaseAdmin.from("coupons").select("*").order("created_at", { ascending: false });
  if (error) {
    if (isMissingTable(error)) return { coupons: [], ready: false, error: SETUP_HINT };
    return { coupons: [], ready: false, error: error.message };
  }
  const counts = await usageCounts();
  const coupons = (data || [])
    .map((row) => toCoupon(row as Record<string, unknown>, counts.get(normalizeCouponCode(String(row.code))) || 0))
    .filter((row): row is CouponRecord => !!row);
  return { coupons, ready: true };
}

export type CouponInput = {
  id?: string;
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  active: boolean;
  startsAt: string | null;
  endsAt: string | null;
  minOrderAmount: number | null;
  usageLimit: number | null;
  oncePerCustomer: boolean;
  appliesTo: CouponScope[];
};

export function validateCouponInput(input: CouponInput): { ok: true; value: CouponInput } | { ok: false; error: string } {
  const code = normalizeCouponCode(input.code);
  if (!/^[A-Z0-9][A-Z0-9_-]{1,31}$/.test(code)) {
    return { ok: false, error: "Use 2–32 letters, numbers, hyphens, or underscores." };
  }
  const discountValue = Math.round(Number(input.discountValue));
  if (!Number.isFinite(discountValue) || discountValue < 1) {
    return { ok: false, error: "Enter a discount greater than zero." };
  }
  if (input.discountType === "percent" && discountValue > 100) {
    return { ok: false, error: "A percentage discount cannot be more than 100." };
  }
  if (input.discountType !== "percent" && input.discountType !== "fixed") {
    return { ok: false, error: "Choose percentage off or a fixed rupee amount." };
  }
  const appliesTo = asScopes(input.appliesTo);
  if (!appliesTo) return { ok: false, error: "Choose at least one product this coupon applies to." };

  const startsAt = input.startsAt ? new Date(input.startsAt) : null;
  const endsAt = input.endsAt ? new Date(input.endsAt) : null;
  if (input.startsAt && Number.isNaN(startsAt?.getTime())) return { ok: false, error: "The start date is not valid." };
  if (input.endsAt && Number.isNaN(endsAt?.getTime())) return { ok: false, error: "The end date is not valid." };
  if (startsAt && endsAt && endsAt.getTime() <= startsAt.getTime()) {
    return { ok: false, error: "The end date must be after the start date." };
  }

  let minOrderAmount: number | null = null;
  if (input.minOrderAmount != null && String(input.minOrderAmount) !== "") {
    minOrderAmount = Math.round(Number(input.minOrderAmount));
    if (!Number.isFinite(minOrderAmount) || minOrderAmount < 0) {
      return { ok: false, error: "Minimum order amount cannot be negative." };
    }
  }

  let usageLimit: number | null = null;
  if (input.usageLimit != null && String(input.usageLimit) !== "") {
    usageLimit = Math.round(Number(input.usageLimit));
    if (!Number.isFinite(usageLimit) || usageLimit < 1) {
      return { ok: false, error: "Usage limit must be at least 1, or left empty for no limit." };
    }
  }

  return {
    ok: true,
    value: {
      id: input.id,
      code,
      discountType: input.discountType,
      discountValue,
      active: Boolean(input.active),
      startsAt: startsAt ? startsAt.toISOString() : null,
      endsAt: endsAt ? endsAt.toISOString() : null,
      minOrderAmount,
      usageLimit,
      oncePerCustomer: Boolean(input.oncePerCustomer),
      appliesTo,
    },
  };
}

export async function saveCoupon(input: CouponInput) {
  const checked = validateCouponInput(input);
  if (!checked.ok) return checked;
  const value = checked.value;
  const row = {
    code: value.code,
    discount_type: value.discountType,
    discount_value: value.discountValue,
    active: value.active,
    starts_at: value.startsAt,
    ends_at: value.endsAt,
    min_order_amount: value.minOrderAmount,
    usage_limit: value.usageLimit,
    once_per_customer: value.oncePerCustomer,
    applies_to: value.appliesTo,
    updated_at: new Date().toISOString(),
  };

  const query = value.id
    ? supabaseAdmin.from("coupons").update(row).eq("id", value.id)
    : supabaseAdmin.from("coupons").insert(row);
  const { error } = await query;
  if (error) {
    if (isMissingTable(error)) return { ok: false as const, error: SETUP_HINT };
    if (/duplicate|unique/i.test(error.message)) return { ok: false as const, error: "That coupon code already exists." };
    return { ok: false as const, error: error.message };
  }
  return { ok: true as const };
}

export async function deleteCoupon(id: string) {
  const { error } = await supabaseAdmin.from("coupons").delete().eq("id", id);
  if (error) {
    if (isMissingTable(error)) return { ok: false as const, error: SETUP_HINT };
    return { ok: false as const, error: error.message };
  }
  return { ok: true as const };
}

function checkMin(rule: CouponRule, orderAmount: number) {
  if (rule.minOrderAmount != null && orderAmount < rule.minOrderAmount) {
    return {
      ok: false as const,
      error: `This coupon needs an order of at least ₹${Math.round(rule.minOrderAmount).toLocaleString("en-IN")}.`,
    };
  }
  return { ok: true as const, rule };
}

export async function resolveCoupon(
  code: string | null | undefined,
  ctx: { orderAmount: number; customerEmail?: string }
): Promise<{ ok: true; rule: CouponRule | null } | { ok: false; error: string }> {
  const normalized = normalizeCouponCode(code);
  if (!normalized) return { ok: true, rule: null };

  const { data, error } = await supabaseAdmin.from("coupons").select("*").eq("code", normalized).maybeSingle();

  if (error && isMissingTable(error)) {
    const legacy = getCoupon(normalized);
    if (!legacy.ok) return legacy;
    if (!legacy.coupon || !legacy.code) return { ok: true, rule: null };
    return checkMin(
      {
        code: legacy.code,
        discountType: "percent",
        discountValue: legacy.coupon.percent,
        appliesTo: ["all"],
        minOrderAmount: null,
      },
      ctx.orderAmount
    );
  }

  if (error) return { ok: false, error: "Could not check this coupon. Please try again." };
  if (!data) return { ok: false, error: "This coupon code is invalid." };
  if (!data.active) return { ok: false, error: "This coupon has expired or is no longer active." };

  const now = Date.now();
  if (data.starts_at && new Date(data.starts_at).getTime() > now) {
    return { ok: false, error: "This coupon is not active yet." };
  }
  if (data.ends_at && new Date(data.ends_at).getTime() < now) {
    return { ok: false, error: "This coupon has expired." };
  }

  const appliesTo = asScopes(data.applies_to);
  const discountType = data.discount_type === "fixed" || data.discount_type === "percent" ? data.discount_type : null;
  const discountValue = Number(data.discount_value);
  if (!appliesTo || !discountType || !Number.isFinite(discountValue) || discountValue < 1) {
    return { ok: false, error: "This coupon is not configured correctly." };
  }
  if (discountType === "percent" && discountValue > 100) {
    return { ok: false, error: "This coupon is not configured correctly." };
  }

  if (data.usage_limit != null) {
    const { count, error: countError } = await supabaseAdmin
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("coupon_code", normalized);
    if (countError) return { ok: false, error: "Could not check this coupon. Please try again." };
    if ((count ?? 0) >= Number(data.usage_limit)) {
      return { ok: false, error: "This coupon has reached its usage limit." };
    }
  }

  const email = (ctx.customerEmail || "").trim();
  if (data.once_per_customer && email) {
    const { data: prior, error: priorError } = await supabaseAdmin
      .from("orders")
      .select("id")
      .eq("coupon_code", normalized)
      .ilike("customer_email", email)
      .limit(1);
    if (priorError) return { ok: false, error: "Could not check this coupon. Please try again." };
    if (prior && prior.length > 0) {
      return { ok: false, error: "This coupon has already been used with this email." };
    }
  }

  return checkMin(
    {
      code: normalized,
      discountType,
      discountValue,
      appliesTo,
      minOrderAmount: data.min_order_amount == null ? null : Number(data.min_order_amount),
    },
    ctx.orderAmount
  );
}
