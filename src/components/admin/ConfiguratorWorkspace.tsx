"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { EverydayContentAdmin } from "@/app/actions/contentActions";
import { getSiteMediaAdmin, type SiteMediaAdmin } from "@/app/actions/mediaActions";
import { ConfiguratorPanel } from "@/components/admin/ConfiguratorPanel";
import { sectionTabClass } from "@/components/admin/DeskSwitch";
import { MediaPanel, type MediaChecklist } from "@/components/admin/MediaPanel";
import { DeskLogo, ghostButtonClass } from "@/components/admin/ui";
import { backgroundTileSlot } from "@/lib/backgrounds";
import {
  CONFIGURATOR_MEDIA,
  CONFIGURATOR_NAMES,
  CONFIGURATOR_PRODUCTS,
  type ConfiguratorProduct,
  type EverydayContent,
} from "@/lib/everyday-content";

type View = "text" | "photos";

/** What the Photos tab asks the admin to check for one product, from its saved text and switches. */
function photoChecklist(product: ConfiguratorProduct, content: EverydayContent): MediaChecklist[] {
  const prefix = CONFIGURATOR_MEDIA[product].prefix;
  const sharedPlaces = {
    title: "Places still showing the shared (single-pet) photo",
    note: "Until this product has its own photo there, customers see the Everyday / shared one.",
    items: [
      ...Array.from({ length: content.gallery.photoCount }, (_, i) => ({ slotId: `${prefix}-gallery-${i + 1}`, label: `Gallery ${i + 1}` })),
      ...[1, 2, 3, 4].map((n) => ({ slotId: `${prefix}-guide-${n}`, label: `Photo guide ${n}` })),
    ],
  };
  if (product === "mini_desk") {
    // Desk Portrait: no style cards or background tiles, only the Step 1 pet-count cards.
    const desk = content.desk;
    const counts = [1, 2, 3].filter((n) => n === 1 || (n === 2 ? desk?.showTwoPets !== false : desk?.showThreePets !== false));
    return [
      {
        title: "Step 1 pet-count cards on show",
        note: "A card without its own photo shows the shared example photo.",
        items: counts.map((n) => ({ slotId: `${prefix}-pets-${n}`, label: n === 1 ? "1 pet card" : `${n} pets card` })),
      },
      sharedPlaces,
    ];
  }
  if (product === "gift_bundle") {
    const bundle = content.bundle;
    const tiers = (["essential", "signature"] as const).filter((tier) =>
      tier === "essential" ? bundle?.essentialVisible !== false : bundle?.signatureVisible !== false
    );
    const limitedOn = !content.flow || content.flow.showLimited;
    return [
      {
        title: "Step 1 bundle cards on show",
        note: "A bundle card without its own photo shows a plain gift tile.",
        items: tiers.map((tier) => ({
          slotId: `${prefix}-tier-${tier}`,
          label: tier === "essential" ? bundle?.essentialTitle || "Essential" : bundle?.signatureTitle || "Signature",
        })),
      },
      {
        title: "Step 2 background tiles on show",
        note: "A tile without its own photo shows the plain background colour.",
        items: content.backgrounds
          .filter((bg) => bg.visible && (limitedOn || !bg.limited))
          .map((bg) => ({ slotId: backgroundTileSlot(bg.id, prefix), label: bg.label })),
      },
      {
        ...sharedPlaces,
        items: [
          ...sharedPlaces.items,
          { slotId: `${prefix}-style-framed`, label: "Framed card" },
          { slotId: `${prefix}-style-canvas`, label: "Canvas card" },
          { slotId: `${prefix}-style-infographic`, label: "Preview infographic" },
        ],
      },
    ];
  }
  // Limited Edition tiles only show on Multi-Pet / You & Your Pet once switched on (Product options).
  const limitedOn = !content.flow || content.flow.showLimited;
  const tiles = content.backgrounds.filter((bg) => bg.visible && (limitedOn || !bg.limited));
  const lists: MediaChecklist[] = [
    {
      title: "Step 2 background tiles on show",
      note: "A tile without its own photo shows the plain background colour (Limited Edition: its pattern).",
      items: tiles.map((bg) => ({ slotId: backgroundTileSlot(bg.id, prefix), label: bg.label })),
    },
  ];
  if (product !== "everyday") {
    lists.push({
      title: "Places still showing the shared (single-pet) photo",
      note: "Until this product has its own photo there, customers see the Everyday / shared one.",
      items: [
        ...Array.from({ length: content.gallery.photoCount }, (_, i) => ({ slotId: `${prefix}-gallery-${i + 1}`, label: `Gallery ${i + 1}` })),
        { slotId: `${prefix}-style-framed`, label: "Framed card" },
        { slotId: `${prefix}-style-canvas`, label: "Canvas card" },
        { slotId: `${prefix}-style-infographic`, label: "Preview infographic" },
        ...[1, 2, 3, 4].map((n) => ({ slotId: `${prefix}-guide-${n}`, label: `Photo guide ${n}` })),
      ],
    });
  }
  return lists;
}

export function ConfiguratorWorkspace({
  initial,
  sizes,
}: {
  initial: Record<ConfiguratorProduct, EverydayContentAdmin>;
  sizes: { framed: string[]; canvas: string[] };
}) {
  const router = useRouter();
  const [product, setProduct] = useState<ConfiguratorProduct>("everyday");
  const [view, setView] = useState<View>("text");
  const [media, setMedia] = useState<SiteMediaAdmin | null>(null);
  const [mediaState, setMediaState] = useState<"idle" | "loading" | "ready" | "signed-out">("idle");

  async function loadMedia() {
    setMediaState("loading");
    const data = await getSiteMediaAdmin();
    if (!data) {
      setMediaState("signed-out");
      return;
    }
    setMedia(data);
    setMediaState("ready");
  }

  function openView(next: View) {
    setView(next);
    if (next === "photos" && mediaState === "idle") void loadMedia();
  }

  return (
    <div className="peternity-admin min-h-screen bg-[#F9F9F9] text-[#1a1a1b]">
      <header className="border-b border-[#eeeeee] bg-white">
        <div className="flex items-center gap-3 px-4 py-3 md:px-6">
          <DeskLogo />
          <nav className="flex flex-1 gap-1.5 overflow-x-auto md:justify-center" aria-label="Configurator products">
            {CONFIGURATOR_PRODUCTS.map((id) => (
              <button key={id} type="button" onClick={() => setProduct(id)} className={sectionTabClass(product === id)}>
                {CONFIGURATOR_NAMES[id]}
              </button>
            ))}
          </nav>
          <Link href="/admin" className={`${ghostButtonClass} shrink-0`}>
            Back to admin
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-5 px-4 py-6 md:px-6">
        <div className="flex flex-wrap gap-1.5">
          <button type="button" onClick={() => openView("text")} className={sectionTabClass(view === "text")}>
            Text &amp; switches
          </button>
          <button type="button" onClick={() => openView("photos")} className={sectionTabClass(view === "photos")}>
            Photos
          </button>
        </div>

        {view === "text" ? (
          <ConfiguratorPanel
            key={product}
            product={product}
            initial={initial[product]}
            sizes={sizes}
            onSaved={() => router.refresh()}
          />
        ) : mediaState === "signed-out" ? (
          <p className="text-sm text-[#6b7280]">Sign in again to change photos.</p>
        ) : mediaState !== "ready" || !media ? (
          <p className="text-sm text-[#6b7280]">Loading…</p>
        ) : (
          <MediaPanel
            key={product}
            initial={media}
            onChanged={loadMedia}
            onlyGroups={[CONFIGURATOR_MEDIA[product].group]}
            checklist={photoChecklist(product, initial[product].content)}
          />
        )}
      </main>
    </div>
  );
}
