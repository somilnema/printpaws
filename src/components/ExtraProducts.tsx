"use client";

import { useMedia } from "@/components/SiteMedia";
import { extraCatalog, DEFAULT_CATALOG, type PriceCatalog } from "@/lib/pricing";

type ExtraId = "mug" | "magnet" | "digital" | "desk";

type ExtraProductsProps = {
  addMug: boolean;
  addMagnet: boolean;
  addGift: boolean;
  addDesk?: boolean;
  onToggleMug: () => void;
  onToggleMagnet: () => void;
  onToggleGift: () => void;
  onToggleDesk?: () => void;
  /** When true, shows Desk Portrait as the fourth add-on (Everyday Pet Portrait cart). */
  showDesk?: boolean;
  title?: string;
  catalog?: PriceCatalog;
};

function ExtraCard({
  product,
  selected,
  onToggle,
}: {
  product: ReturnType<typeof extraCatalog>;
  selected: boolean;
  onToggle: () => void;
}) {
  const media = useMedia();
  const hasDiscount = product.compareAt > product.price;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={`w-full overflow-hidden rounded-[10px] bg-white p-3.5 flex items-center gap-3 text-left text-[#2D2D2D] border-2 transition-colors duration-200 active:scale-[0.99] min-h-[72px] ${
        selected ? "border-[#A97659]" : "border-[#EBD6C8]"
      }`}
    >
      <div className="w-14 h-14 rounded-[8px] overflow-hidden bg-[#F1E7DC] flex-shrink-0">
        <img
          src={media(product.image)}
          alt={product.label}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <h5 className="font-bold text-sm leading-tight text-[#2D2D2D]">{product.label}</h5>
        <p className="text-[11px] text-[#6B5E53] mt-0.5 leading-snug">{product.description}</p>
        <p className="text-[12px] mt-1 leading-none">
          {hasDiscount ? (
            <span className="text-[#6B5E53] line-through mr-1.5">Rs. {product.compareAt}</span>
          ) : null}
          <span className="font-bold text-[#A97659]">Rs. {product.price}</span>
        </p>
      </div>
      <span className="flex-shrink-0 flex items-center pl-2" aria-hidden>
        <span
          className={`relative block h-6 w-11 rounded-full overflow-hidden ${
            selected ? "bg-[#A97659]" : "bg-[#D9CDB8]"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out ${
              selected ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </span>
      </span>
    </button>
  );
}

export function ExtraProducts({
  addMug,
  addMagnet,
  addGift,
  addDesk = false,
  onToggleMug,
  onToggleMagnet,
  onToggleGift,
  onToggleDesk,
  showDesk = false,
  title = "Additional Products",
  catalog = DEFAULT_CATALOG,
}: ExtraProductsProps) {
  const items: { id: ExtraId; selected: boolean; onToggle: () => void }[] = [
    { id: "mug", selected: addMug, onToggle: onToggleMug },
    { id: "magnet", selected: addMagnet, onToggle: onToggleMagnet },
    { id: "digital", selected: addGift, onToggle: onToggleGift },
  ];
  if (showDesk && onToggleDesk) {
    items.push({ id: "desk", selected: addDesk, onToggle: onToggleDesk });
  }

  return (
    <div className="rounded-[12px] border-2 border-[#A97659]/35 bg-[#FAF7F2] p-4 space-y-2.5">
      <div className="flex items-center justify-center gap-2">
        <h4 className="text-center font-semibold uppercase tracking-[0.18em] text-[10px] text-[#6B5E53]">
          {title}
        </h4>
        <span className="rounded-full bg-[#F1E7DC] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#A97659]">
          Optional
        </span>
      </div>
      {items.map((item) => (
        <ExtraCard
          key={item.id}
          product={extraCatalog(catalog, item.id)}
          selected={item.selected}
          onToggle={item.onToggle}
        />
      ))}
    </div>
  );
}
