"use client";

import { EXTRA_PRODUCTS } from "@/lib/pricing";

type ExtraKey = keyof typeof EXTRA_PRODUCTS;

type ExtraProductsProps = {
  addMug: boolean;
  addMagnet: boolean;
  addGift: boolean;
  onToggleMug: () => void;
  onToggleMagnet: () => void;
  onToggleGift: () => void;
  title?: string;
};

function ExtraCard({
  product,
  selected,
  onToggle,
}: {
  product: (typeof EXTRA_PRODUCTS)[ExtraKey];
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={`w-full overflow-hidden rounded-xl bg-white p-3.5 flex items-center gap-3 text-left text-[#1a1a1b] border transition-colors duration-200 active:scale-[0.99] ${
        selected ? "border-[#1a1a1b]" : "border-transparent"
      }`}
    >
      <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#ece6e0] flex-shrink-0">
        <img
          src={product.image}
          alt={product.label}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <h5 className="font-bold text-sm leading-tight text-[#1a1a1b]">{product.label}</h5>
        {"subtitle" in product && product.subtitle && (
          <p className="text-[9px] font-semibold text-[#A87B62] uppercase tracking-wide mt-0.5">
            {product.subtitle}
          </p>
        )}
        <p className="text-[12px] mt-1 leading-none">
          <span className="text-gray-400 line-through mr-1.5">Rs. {product.compareAt}</span>
          <span className="font-bold text-[#A87B62]">Rs. {product.price}</span>
        </p>
      </div>
      <span className="flex-shrink-0 flex items-center pl-2">
        <span
          className={`relative block h-7 w-12 rounded-full overflow-hidden ${
            selected ? "bg-[#1a1a1b]" : "bg-gray-200"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out ${
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
  onToggleMug,
  onToggleMagnet,
  onToggleGift,
  title = "You might like",
}: ExtraProductsProps) {
  return (
    <div className="rounded-2xl bg-[#A87B62] p-4 space-y-2.5">
      <h4 className="text-center font-semibold uppercase tracking-[0.18em] text-[10px] text-white/95">
        {title}
      </h4>
      <ExtraCard product={EXTRA_PRODUCTS.mug} selected={addMug} onToggle={onToggleMug} />
      <ExtraCard product={EXTRA_PRODUCTS.magnet} selected={addMagnet} onToggle={onToggleMagnet} />
      <ExtraCard product={EXTRA_PRODUCTS.digital} selected={addGift} onToggle={onToggleGift} />
    </div>
  );
}
