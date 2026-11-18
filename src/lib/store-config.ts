import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { saveOfferRule } from "@/lib/save-offer";
import { limitedBackgroundIds } from "@/lib/everyday-content";
import { loadEverydayContent } from "@/lib/site-content";
import {
  cloneCatalog,
  cloneOptionConfig,
  COUPON_SCOPES,
  DEFAULT_CATALOG,
  DEFAULT_OPTION_CONFIG,
  getCoupon,
  makeSize,
  normalizeCouponCode,
  OPTION_STATUSES,
  parseSize,
  sizesForStyle,
  type CouponRule,
  type CouponScope,
  type OptionConfig,
  type OptionMeta,
  type OptionStatus,
  type PortraitStyle,
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
const OPTION_SETUP_HINT =
  "Run printpaws/supabase/option-meta.sql in the Supabase SQL editor (or re-run store-pricing.sql), then refresh.";

type PriceRow = { key: string; amount: number; compare_at: number | null };
type OptionRow = { key: string; status: string; badge: string | null };

/** Sizes are stored as framed_12x16 / canvas_16x20, so Pricing can add new ones without a schema change. */
const SIZE_KEY = /^(framed|canvas)_(\d{1,3})x(\d{1,3})$/;

function sizeFromKey(key: string): { style: PortraitStyle; size: string } | null {
  const match = SIZE_KEY.exec(key);
  if (!match) return null;
  return { style: match[1] as PortraitStyle, size: makeSize(Number(match[2]), Number(match[3])) };
}

function keyForSize(style: PortraitStyle, size: string) {
  const parsed = parseSize(size);
  return parsed ? `${style}_${parsed.w}x${parsed.h}` : null;
}

const OPTION_KEYS = {
  style_canvas: { kind: "style" as const, id: "canvas" as const },
  style_framed: { kind: "style" as const, id: "framed" as const },
  pets_one: { kind: "pets" as const, id: "one" },
  pets_two: { kind: "pets" as const, id: "two" },
  pets_three: { kind: "pets" as const, id: "three" },
  pets_four: { kind: "pets" as const, id: "four" },
  pets_human: { kind: "pets" as const, id: "human" },
};

function asStatus(value: string | null | undefined): OptionStatus | null {
  return OPTION_STATUSES.includes(value as OptionStatus) ? (value as OptionStatus) : null;
}

export function optionConfigFromRows(rows: OptionRow[]): OptionConfig {
  const options = cloneOptionConfig(DEFAULT_OPTION_CONFIG);
  for (const row of rows) {
    const status = asStatus(row.status);
    if (!status) continue;
    const meta: OptionMeta = { status, badge: (row.badge || "").trim() };
    const sized = sizeFromKey(row.key);
    if (sized) {
      (sized.style === "framed" ? options.framedSizes : options.canvasSizes)[sized.size] = meta;
      continue;
    }
    const map = OPTION_KEYS[row.key as keyof typeof OPTION_KEYS];
    if (!map) continue;
    if (map.kind === "style") options.styles[map.id] = meta;
    else options.pets[map.id] = meta;
  }
  return options;
}

function sizeOptionRows(style: PortraitStyle, sizes: Record<string, OptionMeta>): OptionRow[] {
  return Object.entries(sizes).flatMap(([size, meta]) => {
    const key = keyForSize(style, size);
    return key ? [{ key, status: meta?.status || "available", badge: meta?.badge || "" }] : [];
  });
}

export function rowsFromOptionConfig(options: OptionConfig): OptionRow[] {
  return [
    { key: "style_canvas", status: options.styles.canvas.status, badge: options.styles.canvas.badge },
    { key: "style_framed", status: options.styles.framed.status, badge: options.styles.framed.badge },
    ...sizeOptionRows("framed", options.framedSizes),
    ...sizeOptionRows("canvas", options.canvasSizes),
    ...(["one", "two", "three", "four", "human"] as const).map((id) => ({
      key: `pets_${id}`,
      status: options.pets[id]?.status || "available",
      badge: options.pets[id]?.badge || "",
    })),
  ];
}

export function isMissingTable(error: { message?: string; code?: string } | null) {
  if (!error) return false;
  return /PGRST205|42P01|does not exist|schema cache/i.test(`${error.code || ""} ${error.message || ""}`);
}

export function catalogFromRows(rows: PriceRow[]): PriceCatalog {
  const catalog = cloneCatalog();
  const byKey = new Map(rows.map((row) => [row.key, row]));

  for (const row of rows) {
    const sized = sizeFromKey(row.key);
    if (sized) catalog[sized.style][sized.size] = row.amount;
  }

  const petsTwo = byKey.get("pets_two");
  const petsThree = byKey.get("pets_three");
  const petsFour = byKey.get("pets_four");
  if (petsTwo) catalog.pets.two = petsTwo.amount;
  if (petsThree) catalog.pets.three = petsThree.amount;
  if (petsFour) catalog.pets.four = petsFour.amount;
  const petsHuman = byKey.get("pets_human");
  if (petsHuman) catalog.pets.human = petsHuman.amount;

  const halo = byKey.get("addon_halo");
  const wrap = byKey.get("addon_gift_wrap");
  const bg = byKey.get("addon_premium_bg");
  const priority = byKey.get("addon_priority_preview");
  if (halo) catalog.halo = halo.amount;
  if (wrap) catalog.giftWrap = wrap.amount;
  if (bg) catalog.premiumBackground = bg.amount;
  if (priority) catalog.priorityPreview = priority.amount;
  const family = byKey.get("yyp_family_upgrade");
  const tribute = byKey.get("mp_halo");
  if (family) catalog.familyUpgrade = family.amount;
  if (tribute) catalog.multiPetHalo = tribute.amount;

  const mug = byKey.get("extra_mug");
  const magnet = byKey.get("extra_magnet");
  const digital = byKey.get("extra_digital");
  const desk = byKey.get("extra_desk");
  if (mug) catalog.mug = { price: mug.amount, compareAt: mug.compare_at ?? 0 };
  if (magnet) catalog.magnet = { price: magnet.amount, compareAt: magnet.compare_at ?? 0 };
  if (digital) catalog.digital = { price: digital.amount, compareAt: digital.compare_at ?? 0 };
  if (desk) catalog.desk = { price: desk.amount, compareAt: desk.compare_at ?? 0 };

  // Desk Portrait and Signature Gift Bundle (own keys; none matches the framed_/canvas_ size pattern).
  const deskBase = byKey.get("deskp_base");
  const deskTwo = byKey.get("deskp_pets_two");
  const deskThree = byKey.get("deskp_pets_three");
  if (deskBase) catalog.miniDesk.price = deskBase.amount;
  if (deskTwo) catalog.miniDesk.twoPets = deskTwo.amount;
  if (deskThree) catalog.miniDesk.threePets = deskThree.amount;
  const bundleEssential = byKey.get("bundle_essential");
  const bundleSignature = byKey.get("bundle_signature");
  const bundleGreeting = byKey.get("bundle_greeting_card");
  if (bundleEssential) catalog.giftBundle.essential = bundleEssential.amount;
  if (bundleSignature) catalog.giftBundle.signature = bundleSignature.amount;
  if (bundleGreeting) catalog.giftBundle.greetingCard = bundleGreeting.amount;

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

function sizePriceRows(style: PortraitStyle, catalog: PriceCatalog): PriceRow[] {
  return sizesForStyle(style, catalog).flatMap((size) => {
    const key = keyForSize(style, size);
    return key ? [{ key, amount: catalog[style][size], compare_at: null }] : [];
  });
}

export function rowsFromCatalog(catalog: PriceCatalog): PriceRow[] {
  return [
    ...sizePriceRows("framed", catalog),
    ...sizePriceRows("canvas", catalog),
    { key: "pets_two", amount: catalog.pets.two, compare_at: null },
    { key: "pets_three", amount: catalog.pets.three, compare_at: null },
    { key: "pets_four", amount: catalog.pets.four, compare_at: null },
    { key: "pets_human", amount: catalog.pets.human, compare_at: null },
    { key: "addon_halo", amount: catalog.halo, compare_at: null },
    { key: "addon_gift_wrap", amount: catalog.giftWrap, compare_at: null },
    { key: "addon_premium_bg", amount: catalog.premiumBackground, compare_at: null },
    { key: "addon_priority_preview", amount: catalog.priorityPreview, compare_at: null },
    { key: "yyp_family_upgrade", amount: catalog.familyUpgrade, compare_at: null },
    { key: "mp_halo", amount: catalog.multiPetHalo, compare_at: null },
    { key: "extra_mug", amount: catalog.mug.price, compare_at: catalog.mug.compareAt },
    { key: "extra_magnet", amount: catalog.magnet.price, compare_at: catalog.magnet.compareAt },
    { key: "extra_digital", amount: catalog.digital.price, compare_at: catalog.digital.compareAt },
    { key: "extra_desk", amount: catalog.desk.price, compare_at: catalog.desk.compareAt },
    { key: "deskp_base", amount: catalog.miniDesk.price, compare_at: null },
    { key: "deskp_pets_two", amount: catalog.miniDesk.twoPets, compare_at: null },
    { key: "deskp_pets_three", amount: catalog.miniDesk.threePets, compare_at: null },
    { key: "bundle_essential", amount: catalog.giftBundle.essential, compare_at: null },
    { key: "bundle_signature", amount: catalog.giftBundle.signature, compare_at: null },
    { key: "bundle_greeting_card", amount: catalog.giftBundle.greetingCard, compare_at: null },
    { key: "rule_prepaid_percent", amount: catalog.prepaidPercent, compare_at: null },
    { key: "rule_cod_advance_percent", amount: catalog.codAdvancePercent, compare_at: null },
    { key: "pay_custom_a", amount: catalog.customPayments[0], compare_at: null },
    { key: "pay_custom_b", amount: catalog.customPayments[1], compare_at: null },
    { key: "pay_fresh", amount: catalog.freshPayment, compare_at: null },
    { key: "pay_digital_a", amount: catalog.digitalDownloads[0], compare_at: null },
    { key: "pay_digital_b", amount: catalog.digitalDownloads[1], compare_at: null },
  ];
}

/** Live catalog, including which backgrounds the configurator marks as Limited Edition. */
export async function loadPriceCatalog(): Promise<CatalogLoad> {
  const [loaded, content] = await Promise.all([readPriceTables(), loadEverydayContent()]);
  loaded.catalog.limitedBackgrounds = limitedBackgroundIds(content);
  return loaded;
}

/** Catalog for the first paint of a shop page. Null lets the browser fetch it instead of waiting. */
export async function loadShopCatalog(): Promise<PriceCatalog | null> {
  const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 8000));
  try {
    return await Promise.race([loadPriceCatalog().then((loaded) => loaded.catalog), timeout]);
  } catch {
    return null;
  }
}

async function readPriceTables(): Promise<CatalogLoad> {
  const { data, error } = await supabaseAdmin.from("price_items").select("key, amount, compare_at");
  if (error) {
    if (isMissingTable(error)) {
      return { catalog: cloneCatalog(DEFAULT_CATALOG), ready: false, error: SETUP_HINT };
    }
    return { catalog: cloneCatalog(DEFAULT_CATALOG), ready: false, error: error.message };
  }

  const catalog = catalogFromRows((data || []) as PriceRow[]);
  const { data: optionData, error: optionError } = await supabaseAdmin
    .from("option_meta")
    .select("key, status, badge");

  if (optionError) {
    if (isMissingTable(optionError)) {
      // Prices work; option visibility still uses the built-in defaults until SQL is run.
      return { catalog, ready: true, error: OPTION_SETUP_HINT };
    }
    return { catalog, ready: true, error: optionError.message };
  }

  catalog.options = optionConfigFromRows((optionData || []) as OptionRow[]);
  return { catalog, ready: true };
}

/** Drops size rows Pricing no longer lists. Nothing but sizes is ever removed here. */
async function removeDeletedSizes(table: "price_items" | "option_meta", keep: string[]) {
  const { data, error } = await supabaseAdmin.from(table).select("key");
  if (error) return error.message;
  const kept = new Set(keep);
  const stale = (data || []).map((row) => String(row.key)).filter((key) => sizeFromKey(key) && !kept.has(key));
  if (!stale.length) return "";
  const { error: deleteError } = await supabaseAdmin.from(table).delete().in("key", stale);
  return deleteError ? deleteError.message : "";
}

export async function savePriceCatalog(catalog: PriceCatalog) {
  const priceRows = rowsFromCatalog(catalog);
  const rows = priceRows.map((row) => ({
    ...row,
    updated_at: new Date().toISOString(),
  }));
  const { error } = await supabaseAdmin.from("price_items").upsert(rows, { onConflict: "key" });
  if (error) {
    if (isMissingTable(error)) return { ok: false as const, error: SETUP_HINT };
    return { ok: false as const, error: error.message };
  }

  const options = rowsFromOptionConfig(catalog.options || DEFAULT_OPTION_CONFIG);
  const optionRows = options.map((row) => ({
    ...row,
    updated_at: new Date().toISOString(),
  }));
  const { error: optionError } = await supabaseAdmin.from("option_meta").upsert(optionRows, { onConflict: "key" });
  if (optionError) {
    if (isMissingTable(optionError)) return { ok: false as const, error: OPTION_SETUP_HINT };
    return { ok: false as const, error: optionError.message };
  }

  const removeProblem =
    (await removeDeletedSizes("price_items", priceRows.map((row) => row.key))) ||
    (await removeDeletedSizes("option_meta", options.map((row) => row.key)));
  if (removeProblem) return { ok: false as const, error: removeProblem };

  // Shop pages paint with these prices before the browser asks for fresh ones.
  revalidatePath("/");
  revalidatePath("/portraits/[slug]", "page");
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
    const offer = saveOfferRule(normalized);
    if (offer) return checkMin(offer, ctx.orderAmount);
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
  if (!data) {
    const offer = saveOfferRule(normalized);
    if (offer) return checkMin(offer, ctx.orderAmount);
    return { ok: false, error: "This coupon code is invalid." };
  }
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
