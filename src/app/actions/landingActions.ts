"use server";

import { getAdminSession } from "@/lib/admin-auth";
import {
  listLandingProductsAdmin,
  removeLandingProduct,
  saveLandingProduct,
  type LandingKind,
  type LandingPets,
} from "@/lib/landing-products";

export async function getLandingProductsAdmin() {
  const session = await getAdminSession();
  if (!session) return null;
  return listLandingProductsAdmin();
}

function flag(value: FormDataEntryValue | null) {
  return value === "true" || value === "on";
}

export async function saveLandingProductAction(formData: FormData) {
  const session = await getAdminSession();
  if (!session) return { ok: false as const, error: "Sign in again to continue." };

  const kind = formData.get("kind") === "fixed" ? "fixed" : "portrait";
  const petsRaw = String(formData.get("pets") || "");
  const pets: LandingPets | null = petsRaw === "one" || petsRaw === "two" || petsRaw === "human" ? petsRaw : null;
  const priceRaw = String(formData.get("price") || "").trim();
  const price = priceRaw === "" ? null : Number(priceRaw);
  const file = formData.get("file");
  const image = file instanceof File && file.size > 0 ? Buffer.from(await file.arrayBuffer()) : undefined;
  const id = String(formData.get("id") || "").trim();

  return saveLandingProduct(
    {
      id: id || undefined,
      slug: String(formData.get("slug") || ""),
      name: String(formData.get("name") || ""),
      description: String(formData.get("description") || ""),
      sortOrder: Number(formData.get("sortOrder") || 0),
      active: flag(formData.get("active")),
      kind: kind as LandingKind,
      pets,
      price,
      forSale: flag(formData.get("forSale")),
    },
    image
  );
}

export async function deleteLandingProductAction(id: string) {
  const session = await getAdminSession();
  if (!session) return { ok: false as const, error: "Sign in again to continue." };
  return removeLandingProduct(id);
}
