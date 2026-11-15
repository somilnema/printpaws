import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ConfiguratorWorkspace } from "@/components/admin/ConfiguratorWorkspace";
import { getAdminSession } from "@/lib/admin-auth";
import { sizesForStyle } from "@/lib/pricing";
import { describeProductContent } from "@/lib/site-content";
import { loadPriceCatalog } from "@/lib/store-config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Configurator | Peternity Admin",
  robots: { index: false, follow: false },
};

/** Admin → Configurator: text, switches and photos for the three configurator products. */
export default async function ConfiguratorPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin?next=/admin/configurator");

  const [everyday, multiPet, youPet, { catalog }] = await Promise.all([
    describeProductContent("everyday"),
    describeProductContent("multi_pet"),
    describeProductContent("you_and_your_pet"),
    loadPriceCatalog(),
  ]);

  return (
    <ConfiguratorWorkspace
      initial={{ everyday, multi_pet: multiPet, you_and_your_pet: youPet }}
      sizes={{ framed: sizesForStyle("framed", catalog), canvas: sizesForStyle("canvas", catalog) }}
    />
  );
}
