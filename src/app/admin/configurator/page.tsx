import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { EverydayContentAdmin } from "@/app/actions/contentActions";
import { ConfiguratorWorkspace } from "@/components/admin/ConfiguratorWorkspace";
import { getAdminSession } from "@/lib/admin-auth";
import { CONFIGURATOR_PRODUCTS, type ConfiguratorProduct } from "@/lib/everyday-content";
import { sizesForStyle } from "@/lib/pricing";
import { describeProductContent } from "@/lib/site-content";
import { loadPriceCatalog } from "@/lib/store-config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Configurator | Peternity Admin",
  robots: { index: false, follow: false },
};

/** Admin → Configurator: text, switches and photos for every configurator product (one tab each). */
export default async function ConfiguratorPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin?next=/admin/configurator");

  const [contents, { catalog }] = await Promise.all([
    Promise.all(CONFIGURATOR_PRODUCTS.map((product) => describeProductContent(product))),
    loadPriceCatalog(),
  ]);
  const initial = Object.fromEntries(CONFIGURATOR_PRODUCTS.map((product, index) => [product, contents[index]])) as Record<
    ConfiguratorProduct,
    EverydayContentAdmin
  >;

  return (
    <ConfiguratorWorkspace
      initial={initial}
      sizes={{ framed: sizesForStyle("framed", catalog), canvas: sizesForStyle("canvas", catalog) }}
    />
  );
}
