"use server";

import { getAdminSession } from "@/lib/admin-auth";
import { isConfiguratorProduct, type ConfiguratorProduct } from "@/lib/everyday-content";
import {
  describeProductContent,
  resetProductContent,
  saveProductContent,
  type EverydayContentAdmin,
} from "@/lib/site-content";

export type { EverydayContentAdmin } from "@/lib/site-content";

function productOrEveryday(product: unknown): ConfiguratorProduct {
  return isConfiguratorProduct(product) ? product : "everyday";
}

export async function getEverydayContentAdmin(product: ConfiguratorProduct = "everyday"): Promise<EverydayContentAdmin | null> {
  const session = await getAdminSession();
  if (!session) return null;
  return describeProductContent(productOrEveryday(product));
}

export async function updateEverydayContent(input: unknown, product: ConfiguratorProduct = "everyday") {
  const session = await getAdminSession();
  if (!session) return { ok: false as const, error: "Sign in again to continue." };
  return saveProductContent(productOrEveryday(product), input);
}

export async function restoreEverydayContent(product: ConfiguratorProduct = "everyday") {
  const session = await getAdminSession();
  if (!session) return { ok: false as const, error: "Sign in again to continue." };
  return resetProductContent(productOrEveryday(product));
}
