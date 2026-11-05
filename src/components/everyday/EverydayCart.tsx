"use client";

import type { ReactNode } from "react";
import {
  ArrowRight,
  CaseSensitive,
  Expand,
  FileText,
  SquareSquare,
  Gift,
  Image as ImageIcon,
  Minus,
  Paintbrush,
  Plus,
  ShoppingBag,
  Tag,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { PreviewImage } from "@/components/PreviewImage";
import { useMedia, useUploadedMedia } from "@/components/SiteMedia";
import { extraCatalog, formatRupee, type PriceCatalog } from "@/lib/pricing";
import { EXTRA_IDS, fill, type EverydayContent, type ExtraId } from "@/lib/everyday-content";
import { Toggle } from "@/components/everyday/ui";

export type EverydayCartProps = {
  content: EverydayContent;
  catalog: PriceCatalog;
  hasItem: boolean;
  onClose: () => void;
  photoUrl: string;
  photoBusy: boolean;
  fileName: string;
  styleLabel: string;
  sizeLabel: string;
  backgroundLabel: string;
  frameLabel: string;
  petName: string;
  subtitle: string;
  priority: boolean;
  itemPrice: number;
  qty: number;
  onQty: (qty: number) => void;
  onRemove: () => void;
  extras: Record<ExtraId, boolean>;
  onToggleExtra: (id: ExtraId) => void;
  giftWrap: boolean;
  onGiftWrap: (on: boolean) => void;
  couponInput: string;
  onCouponInput: (value: string) => void;
  couponApplied: boolean;
  couponBusy: boolean;
  couponError: string | null;
  couponMessage: string | null;
  onApplyCoupon: () => void;
  onRemoveCoupon: () => void;
  itemCount: number;
  subtotal: number;
  discount: number;
  total: number;
  onCheckout: () => void;
};

function Detail({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-start gap-2.5">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center text-[#A97659]">{icon}</span>
      <p className="min-w-0">
        <span className="block text-[12px] leading-tight text-[#6B5E53]">{label}</span>
        <span className="mt-0.5 line-clamp-2 block break-words text-[13px] font-semibold leading-tight text-[#2D2D2D]">{value}</span>
      </p>
    </div>
  );
}

function ExtraRow({
  id,
  content,
  catalog,
  selected,
  onToggle,
}: {
  id: ExtraId;
  content: EverydayContent;
  catalog: PriceCatalog;
  selected: boolean;
  onToggle: () => void;
}) {
  const media = useMedia();
  const deskPhoto = useUploadedMedia("extra-desk");
  const product = extraCatalog(catalog, id);
  const copy = content.extras[id];
  const image = id === "desk" ? deskPhoto || media(product.image) : media(product.image);
  return (
    <div className="flex items-center gap-3 rounded-[10px] bg-white p-2.5">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[8px] bg-[#F1E7DC]">
        { }
        <img src={image} alt={copy.label} className="h-full w-full object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-playfair text-[15px] font-semibold leading-tight text-[#2D2D2D]">{copy.label}</p>
        {copy.description ? (
          <p className="mt-0.5 text-[12px] leading-snug text-[#6B5E53]">{copy.description}</p>
        ) : null}
        <p className="mt-1 flex items-baseline gap-1.5 leading-none">
          {product.compareAt > product.price ? (
            <span className="text-[13px] text-[#9B8B7D] line-through">{formatRupee(product.compareAt)}</span>
          ) : null}
          <span className="text-[15px] font-bold text-[#A97659]">{formatRupee(product.price)}</span>
        </p>
      </div>
      <Toggle on={selected} onToggle={onToggle} label={copy.label} />
    </div>
  );
}

export function EverydayCart(props: EverydayCartProps) {
  const { content, catalog } = props;
  const copy = content.cart;
  const giftPhoto = useUploadedMedia("everyday-gift-wrap");
  const visibleExtras = EXTRA_IDS.filter((id) => content.extras[id].visible);
  const notAdded = copy.notAddedLabel;

  return (
    <>
      <div className="relative flex items-center bg-[#A97659] px-5 py-3 text-white">
        <span className="text-[13px] font-semibold uppercase tracking-[0.1em]">{copy.banner}</span>
        <button
          type="button"
          onClick={props.onClose}
          aria-label="Close cart"
          className="ml-auto -mr-2 flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/15"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto bg-[#FAF7F2] px-4 pb-6 pt-5">
        <h2 className="font-playfair text-[26px] font-bold! leading-tight text-[#2D2D2D]">{copy.title}</h2>

        {!props.hasItem ? (
          <div className="flex flex-col items-center justify-center space-y-5 px-4 py-16 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F1E7DC] text-[#A97659]">
              <ShoppingBag size={34} />
            </div>
            <div className="space-y-2">
              <h3 className="font-inter! text-[16px] font-semibold! text-[#2D2D2D]">{copy.emptyTitle}</h3>
              <p className="mx-auto max-w-[280px] text-[13px] leading-relaxed text-[#6B5E53]">{copy.emptyText}</p>
            </div>
            <button
              type="button"
              onClick={props.onClose}
              className="h-11 rounded-[10px] bg-[#A97659] px-6 text-[14px] font-semibold uppercase tracking-[0.04em] text-white transition-colors hover:bg-[#966C55]"
            >
              {copy.emptyButton}
            </button>
          </div>
        ) : (
          <>
            <div className="rounded-[12px] border border-[#EBD6C8] bg-white">
              <div className="flex gap-4 p-4">
                <PreviewImage
                  src={props.photoUrl}
                  alt={content.header.productName}
                  busy={props.photoBusy}
                  className="h-[84px] w-[84px] shrink-0 rounded-[8px]"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-playfair text-[17px] font-semibold! leading-tight text-[#2D2D2D]">
                    {content.header.productName}
                  </h3>
                  <p className="mt-1 text-[13px] text-[#6B5E53]">
                    {props.styleLabel} · {props.sizeLabel}
                  </p>
                  <p className="mt-1.5 text-[18px] font-semibold text-[#A97659]">{formatRupee(props.itemPrice)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 border-t border-[#EBD6C8]">
                <div className="space-y-4 border-r border-[#EBD6C8] p-4">
                  <Detail icon={<ImageIcon size={18} strokeWidth={1.75} />} label={copy.styleLabel} value={props.styleLabel} />
                  <Detail icon={<Paintbrush size={18} strokeWidth={1.75} />} label={copy.backgroundLabel} value={props.backgroundLabel} />
                  <Detail icon={<CaseSensitive size={18} strokeWidth={1.75} />} label={copy.petNameLabel} value={props.petName || notAdded} />
                  {props.priority ? (
                    <Detail
                      icon={<Zap size={18} strokeWidth={1.75} />}
                      label={copy.priorityLabel}
                      value={formatRupee(catalog.priorityPreview)}
                    />
                  ) : null}
                </div>
                <div className="space-y-4 p-4">
                  <Detail icon={<Expand size={18} strokeWidth={1.75} />} label={copy.sizeLabel} value={props.sizeLabel} />
                  <Detail icon={<SquareSquare size={18} strokeWidth={1.75} />} label={copy.frameLabel} value={props.frameLabel} />
                  <Detail icon={<FileText size={18} strokeWidth={1.75} />} label={copy.subtitleLabel} value={props.subtitle || notAdded} />
                  <div className="flex min-w-0 items-start gap-2.5">
                    <span className="mt-0.5 h-6 w-6 shrink-0 overflow-hidden rounded-[4px] bg-[#F1E7DC]">
                      {props.photoUrl ? (
                         
                        <img src={props.photoUrl} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </span>
                    <p className="min-w-0">
                      <span className="block text-[12px] leading-tight text-[#6B5E53]">{copy.photoLabel}</span>
                      <span className="mt-0.5 block truncate text-[13px] font-semibold leading-tight text-[#2D2D2D]">
                        {props.fileName || "—"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-[#EBD6C8] px-4 py-3">
                <div className="flex h-9 items-center overflow-hidden rounded-[8px] border border-[#E3D9CF] bg-white">
                  <button
                    type="button"
                    onClick={() => props.onQty(Math.max(1, props.qty - 1))}
                    aria-label="Decrease quantity"
                    className="flex h-full w-9 items-center justify-center text-[#2D2D2D] transition-colors hover:bg-[#FAF7F2]"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="flex h-full w-10 select-none items-center justify-center border-x border-[#E3D9CF] text-[14px] font-semibold text-[#2D2D2D]">
                    {props.qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => props.onQty(props.qty + 1)}
                    aria-label="Increase quantity"
                    className="flex h-full w-9 items-center justify-center text-[#2D2D2D] transition-colors hover:bg-[#FAF7F2]"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={props.onRemove}
                  className="inline-flex min-h-[36px] items-center gap-1.5 text-[14px] font-medium text-[#A97659] transition-colors hover:text-red-600"
                >
                  <Trash2 size={16} />
                  {copy.removeLabel}
                </button>
              </div>
            </div>

            {visibleExtras.length > 0 ? (
              <div className="space-y-2 rounded-[12px] bg-[#A97659] p-3">
                <div className="flex items-center justify-between px-1 pb-1 pt-0.5">
                  <h4 className="font-inter! text-[13px] font-semibold! uppercase tracking-[0.08em] text-white">
                    {copy.extrasHeading}
                  </h4>
                  <span className="rounded-full bg-white/25 px-2.5 py-0.5 text-[12px] font-medium text-white">
                    {copy.optionalLabel}
                  </span>
                </div>
                {visibleExtras.map((id) => (
                  <ExtraRow
                    key={id}
                    id={id}
                    content={content}
                    catalog={catalog}
                    selected={props.extras[id]}
                    onToggle={() => props.onToggleExtra(id)}
                  />
                ))}
              </div>
            ) : null}

            {copy.showGift ? (
              <div className="space-y-3 rounded-[12px] border border-[#EBD6C8] bg-white p-3">
                <div className="flex items-center justify-between px-1 pt-0.5">
                  <h4 className="font-inter! text-[13px] font-semibold! uppercase tracking-[0.08em] text-[#A97659]">
                    {copy.giftHeading}
                  </h4>
                  <span className="rounded-full bg-[#F1E7DC] px-2.5 py-0.5 text-[12px] font-medium text-[#A97659]">
                    {copy.optionalLabel}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[8px] bg-[#F9EFE4] text-[#A97659]">
                    {giftPhoto ? (
                       
                      <img src={giftPhoto} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Gift size={28} strokeWidth={1.5} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-playfair text-[15px] font-semibold leading-tight text-[#2D2D2D]">{copy.giftTitle}</p>
                    {copy.giftDescription ? (
                      <p className="mt-0.5 text-[12px] leading-snug text-[#6B5E53]">{copy.giftDescription}</p>
                    ) : null}
                    <p className="mt-1 text-[15px] font-bold text-[#A97659]">{formatRupee(catalog.giftWrap)}</p>
                  </div>
                  <Toggle on={props.giftWrap} onToggle={() => props.onGiftWrap(!props.giftWrap)} label={copy.giftHeading} />
                </div>
              </div>
            ) : null}

            <div className="space-y-2 pt-1">
              <label htmlFor="everyday-coupon" className="block text-[13px] font-semibold uppercase tracking-[0.08em] text-[#A97659]">
                {copy.couponHeading}
              </label>
              <div className="flex gap-2">
                <div className="relative min-w-0 flex-1">
                  <Tag size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9B8B7D]" />
                  <input
                    id="everyday-coupon"
                    type="text"
                    value={props.couponInput}
                    onChange={(e) => props.onCouponInput(e.target.value)}
                    placeholder={copy.couponPlaceholder}
                    className={`h-11 w-full rounded-[8px] border bg-white pl-9 pr-3 text-[14px] uppercase text-[#2D2D2D] outline-none transition-colors placeholder:normal-case placeholder:text-[#9B8B7D] focus:border-[#A97659] ${
                      props.couponError ? "border-red-400 bg-red-50/40" : "border-[#E3D9CF]"
                    }`}
                  />
                </div>
                {props.couponApplied ? (
                  <button
                    type="button"
                    onClick={props.onRemoveCoupon}
                    className="h-11 shrink-0 rounded-[8px] border border-[#E3D9CF] bg-white px-4 text-[14px] font-bold uppercase text-[#6B5E53]"
                  >
                    {copy.removeCouponLabel}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={props.onApplyCoupon}
                    disabled={props.couponBusy}
                    className="h-11 shrink-0 rounded-[8px] bg-[#1F1F1F] px-5 text-[14px] font-bold uppercase text-white transition-colors hover:bg-[#333] disabled:opacity-60"
                  >
                    {props.couponBusy ? "…" : copy.applyLabel}
                  </button>
                )}
              </div>
              {props.couponError ? <p className="text-[12px] font-semibold text-red-500">{props.couponError}</p> : null}
              {props.couponMessage ? <p className="text-[12px] font-semibold text-[#2E7D32]">{props.couponMessage}</p> : null}
            </div>
          </>
        )}
      </div>

      {props.hasItem ? (
        <div className="space-y-4 rounded-t-[16px] border-t border-[#EBD6C8] bg-white px-5 pb-5 pt-4 shadow-[0_-4px_16px_rgba(45,45,45,0.04)]">
          <div className="space-y-2 text-[14px]">
            <div className="flex justify-between">
              <span className="text-[#6B5E53]">
                {fill(copy.subtotalLabel, {
                  count: props.itemCount,
                  items: props.itemCount === 1 ? copy.itemWord : copy.itemsWord,
                })}
              </span>
              <span className="font-semibold text-[#2D2D2D]">{formatRupee(props.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B5E53]">{copy.discountLabel}</span>
              <span className="font-semibold text-[#2E7D32]">– {formatRupee(props.discount)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-[#EFE5DA] pt-3">
              <span className="text-[20px] font-bold text-[#2D2D2D]">{copy.totalLabel}</span>
              <span className="text-[22px] font-bold text-[#2D2D2D]">{formatRupee(props.total)}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={props.onCheckout}
            className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[10px] bg-[#A97659] text-[15px] font-semibold uppercase tracking-[0.06em] text-white transition-all hover:bg-[#966C55] active:scale-[0.98]"
          >
            {copy.checkoutLabel} <ArrowRight size={18} />
          </button>
        </div>
      ) : null}
    </>
  );
}
