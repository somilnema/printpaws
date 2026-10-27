import "server-only";

import { revalidatePath } from "next/cache";
import sharp from "sharp";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { IMAGE_UPLOAD_LIMIT } from "@/lib/site-media-catalog";
import { isMissingTable } from "@/lib/store-config";

const BUCKET = "site-media";
const SETUP_HINT = "Run printpaws/supabase/landing-products.sql in the Supabase SQL editor, then refresh.";

export type LandingKind = "portrait" | "fixed";
export type LandingPets = "one" | "two" | "human";

export type LandingProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  sortOrder: number;
  active: boolean;
  kind: LandingKind;
  pets: LandingPets | null;
  price: number | null;
  forSale: boolean;
};

export type LandingProductInput = {
  id?: string;
  slug: string;
  name: string;
  description: string;
  sortOrder: number;
  active: boolean;
  kind: LandingKind;
  pets: LandingPets | null;
  price: number | null;
  forSale: boolean;
};

type Row = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image_url: string | null;
  sort_order: number;
  active: boolean;
  kind: string;
  pets: string | null;
  price: number | null;
  for_sale: boolean;
};

function rowToProduct(row: Row): LandingProduct | null {
  if (row.kind !== "portrait" && row.kind !== "fixed") return null;
  const pets = row.pets === "one" || row.pets === "two" || row.pets === "human" ? row.pets : null;
  if (row.kind === "portrait" && !pets) return null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    imageUrl: row.image_url || "",
    sortOrder: row.sort_order,
    active: row.active,
    kind: row.kind,
    pets,
    price: row.price == null ? null : Number(row.price),
    forSale: row.for_sale,
  };
}

export function landingSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function productIsPurchasable(product: LandingProduct) {
  if (!product.active) return false;
  if (product.kind === "portrait") return Boolean(product.pets);
  return product.forSale && product.price != null && product.price > 0;
}

function validate(input: LandingProductInput): { ok: true; value: LandingProductInput } | { ok: false; error: string } {
  const slug = landingSlug(input.slug || input.name);
  const name = input.name.trim();
  const description = input.description.trim();
  if (!slug) return { ok: false, error: "Add a name for the link." };
  if (!name) return { ok: false, error: "Add the product name." };
  if (!description) return { ok: false, error: "Add the short description." };
  const sortOrder = Math.round(Number(input.sortOrder));
  if (!Number.isInteger(sortOrder)) return { ok: false, error: "Order must be a whole number." };

  if (input.kind === "portrait") {
    if (input.pets !== "one" && input.pets !== "two" && input.pets !== "human") {
      return { ok: false, error: "Choose which customizer this portrait opens." };
    }
    return {
      ok: true,
      value: {
        ...input,
        slug,
        name,
        description,
        sortOrder,
        pets: input.pets,
        price: null,
        forSale: true,
      },
    };
  }

  const price = input.price == null || input.price === ("" as unknown as number) ? null : Math.round(Number(input.price));
  if (price != null && (!Number.isInteger(price) || price < 0)) {
    return { ok: false, error: "Price must be a whole number of rupees." };
  }
  if (input.forSale && (price == null || price < 1)) {
    return { ok: false, error: "Enter a price above zero before this can be sold." };
  }
  return {
    ok: true,
    value: {
      ...input,
      slug,
      name,
      description,
      sortOrder,
      kind: "fixed",
      pets: null,
      price,
      forSale: Boolean(input.forSale),
    },
  };
}

async function readAll(): Promise<{ ok: true; products: LandingProduct[] } | { ok: false; missing: boolean; error: string }> {
  const { data, error } = await supabaseAdmin
    .from("landing_products")
    .select("id, slug, name, description, image_url, sort_order, active, kind, pets, price, for_sale")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) {
    if (isMissingTable(error)) return { ok: false, missing: true, error: SETUP_HINT };
    return { ok: false, missing: false, error: error.message };
  }
  return { ok: true, products: ((data || []) as Row[]).map(rowToProduct).filter((item): item is LandingProduct => Boolean(item)) };
}

/** Active cards for the landing page. Null means the table has not been created yet. */
export async function listPublicLandingProducts() {
  const read = await readAll();
  if (!read.ok) return read.missing ? null : [];
  return read.products.filter((product) => product.active);
}

export async function listLandingProductsAdmin() {
  const read = await readAll();
  if (!read.ok) return { ready: false as const, error: read.error, products: [] as LandingProduct[] };
  return { ready: true as const, products: read.products };
}

export async function getLandingProduct(slug: string) {
  const read = await readAll();
  if (!read.ok) return null;
  return read.products.find((product) => product.slug === slug) || null;
}

export async function getSellableFixedOffer(id: string) {
  const read = await readAll();
  if (!read.ok) return null;
  const product = read.products.find((item) => item.id === id);
  if (!product || !productIsPurchasable(product) || product.kind !== "fixed" || product.price == null) return null;
  return product;
}

function isJpeg(bytes: Buffer) {
  return bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

function isPng(bytes: Buffer) {
  return bytes.length > 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
}

function isWebp(bytes: Buffer) {
  return bytes.length > 12 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
}

async function storeImage(id: string, bytes: Buffer) {
  if (!bytes.length) return { ok: false as const, error: "Choose a photo first." };
  if (bytes.length > IMAGE_UPLOAD_LIMIT) return { ok: false as const, error: "That photo is too large. Keep it under 15 MB." };
  if (!isJpeg(bytes) && !isPng(bytes) && !isWebp(bytes)) return { ok: false as const, error: "Use a JPG, PNG, or WebP photo." };
  let body: Buffer;
  try {
    body = await sharp(bytes, { failOn: "none", limitInputPixels: 40_000_000, animated: false })
      .rotate()
      .resize({ width: 1400, height: 1400, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80, effort: 2, smartSubsample: true })
      .toBuffer();
  } catch {
    return { ok: false as const, error: "That photo could not be prepared. Try a JPG, PNG, or WebP." };
  }
  const path = `landing-offers/${id}/${crypto.randomUUID()}.webp`;
  const { error } = await supabaseAdmin.storage.from(BUCKET).upload(path, body, {
    contentType: "image/webp",
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) return { ok: false as const, error: "The photo could not be saved. Try again." };
  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
  return { ok: true as const, url: data.publicUrl };
}

function publish(slug: string) {
  revalidatePath("/landing");
  revalidatePath(`/portraits/${slug}`);
}

export async function saveLandingProduct(input: LandingProductInput, image?: Buffer) {
  const parsed = validate(input);
  if (!parsed.ok) return parsed;
  const value = parsed.value;

  const { data: clash, error: clashError } = await supabaseAdmin
    .from("landing_products")
    .select("id")
    .eq("slug", value.slug)
    .maybeSingle();
  if (clashError) {
    if (isMissingTable(clashError)) return { ok: false as const, error: SETUP_HINT };
    return { ok: false as const, error: clashError.message };
  }
  if (clash?.id && clash.id !== value.id) return { ok: false as const, error: "Another product already uses that link." };

  let imageUrl: string | undefined;
  const id = value.id || crypto.randomUUID();
  if (image) {
    const stored = await storeImage(id, image);
    if (!stored.ok) return stored;
    imageUrl = stored.url;
  }

  const row = {
    id,
    slug: value.slug,
    name: value.name,
    description: value.description,
    sort_order: value.sortOrder,
    active: value.active,
    kind: value.kind,
    pets: value.pets,
    price: value.price,
    for_sale: value.forSale,
    updated_at: new Date().toISOString(),
    ...(imageUrl ? { image_url: imageUrl } : {}),
  };

  const { error } = await supabaseAdmin.from("landing_products").upsert(row, { onConflict: "id" });
  if (error) {
    if (isMissingTable(error)) return { ok: false as const, error: SETUP_HINT };
    return { ok: false as const, error: error.message };
  }
  publish(value.slug);
  return { ok: true as const };
}

export async function removeLandingProduct(id: string) {
  const { data, error } = await supabaseAdmin.from("landing_products").delete().eq("id", id).select("slug").maybeSingle();
  if (error) {
    if (isMissingTable(error)) return { ok: false as const, error: SETUP_HINT };
    return { ok: false as const, error: error.message };
  }
  publish(String(data?.slug || ""));
  return { ok: true as const };
}
