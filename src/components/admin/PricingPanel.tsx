"use client";

import { FormEvent, useEffect, useState } from "react";
import { updatePrices } from "@/app/actions/storeActions";
import {
  CANVAS_SIZES,
  cloneCatalog,
  displaySizeLabel,
  FRAMED_SIZES,
  OPTION_STATUS_LABELS,
  OPTION_STATUSES,
  type OptionMeta,
  type OptionStatus,
  type PriceCatalog,
} from "@/lib/pricing";
import { buttonClass, errorClass, Field, inputClass, okClass, Panel, warnClass } from "@/components/admin/ui";

function Money({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  hint?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <input
        type="number"
        min={0}
        step={1}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value))}
        className={inputClass}
      />
    </Field>
  );
}

function OptionControls({
  label,
  price,
  onPriceChange,
  meta,
  onMetaChange,
  priceHint,
  showPrice = true,
}: {
  label: string;
  price?: number;
  onPriceChange?: (value: number) => void;
  meta: OptionMeta;
  onMetaChange: (meta: OptionMeta) => void;
  priceHint?: string;
  showPrice?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[#eeeeee] bg-[#fafafa] p-3 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-[#1a1a1b]">{label}</p>
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
            meta.status === "available"
              ? "bg-[#eefbf3] text-[#067647]"
              : meta.status === "out_of_stock"
                ? "bg-[#fff7e8] text-[#8a5a00]"
                : "bg-[#f3f4f6] text-[#6b7280]"
          }`}
        >
          {OPTION_STATUS_LABELS[meta.status]}
        </span>
      </div>
      <div className={`grid gap-3 ${showPrice ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
        {showPrice && onPriceChange ? (
          <Money label="Price (₹)" value={price ?? 0} onChange={onPriceChange} hint={priceHint} />
        ) : null}
        <Field label="Shop status" hint="Hidden removes it. Out of stock greys it out.">
          <select
            value={meta.status}
            onChange={(e) => onMetaChange({ ...meta, status: e.target.value as OptionStatus })}
            className={inputClass}
          >
            {OPTION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {OPTION_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Badge" hint="Optional chip, e.g. Value for Money">
          <input
            type="text"
            maxLength={40}
            value={meta.badge}
            onChange={(e) => onMetaChange({ ...meta, badge: e.target.value })}
            placeholder="None"
            className={inputClass}
          />
        </Field>
      </div>
    </div>
  );
}

export function PricingPanel({
  initial,
  ready,
  setupError,
  onSaved,
}: {
  initial: PriceCatalog;
  ready: boolean;
  setupError?: string;
  onSaved: () => Promise<void>;
}) {
  const [catalog, setCatalog] = useState(() => cloneCatalog(initial));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setCatalog(cloneCatalog(initial));
  }, [initial]);

  function patch(next: Partial<PriceCatalog>) {
    setCatalog((current) => ({ ...current, ...next }));
  }

  function patchOptions(next: Partial<PriceCatalog["options"]>) {
    setCatalog((current) => ({
      ...current,
      options: { ...current.options, ...next },
    }));
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    const result = await updatePrices(catalog);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessage("Saved. New checkouts use these prices and visibility settings. Orders already placed stay unchanged.");
    await onSaved();
  }

  const dueLater = Math.max(0, 100 - (Number(catalog.codAdvancePercent) || 0));

  return (
    <form onSubmit={handleSave} className="space-y-4">
      {setupError ? (
        <p className={warnClass}>{setupError}</p>
      ) : null}
      <p className="text-sm text-[#6b7280] leading-relaxed max-w-3xl">
        Amounts are in rupees. Use shop status to show a choice, hide it completely, or leave it visible as out of stock.
        Badges appear as chips next to the option on the product page. A crossed-out price is shown only when it is higher
        than the selling price.
      </p>

      <Panel
        title="Portrait styles"
        note="Out of stock greys the card with “Temporarily unavailable”. Hidden removes the style from the shop entirely."
      >
        <div className="grid md:grid-cols-2 gap-3">
          <OptionControls
            label="Canvas Portrait"
            showPrice={false}
            meta={catalog.options.styles.canvas}
            onMetaChange={(meta) =>
              patchOptions({ styles: { ...catalog.options.styles, canvas: meta } })
            }
          />
          <OptionControls
            label="Framed Portrait"
            showPrice={false}
            meta={catalog.options.styles.framed}
            onMetaChange={(meta) =>
              patchOptions({ styles: { ...catalog.options.styles, framed: meta } })
            }
          />
        </div>
      </Panel>

      <Panel title="Framed sizes" note="Only shown when Framed Portrait is visible.">
        <div className="space-y-3">
          {FRAMED_SIZES.map((size) => (
            <OptionControls
              key={size}
              label={displaySizeLabel(size)}
              price={catalog.framed[size]}
              onPriceChange={(value) => patch({ framed: { ...catalog.framed, [size]: value } })}
              meta={catalog.options.framedSizes[size]}
              onMetaChange={(meta) =>
                patchOptions({
                  framedSizes: { ...catalog.options.framedSizes, [size]: meta },
                })
              }
            />
          ))}
        </div>
      </Panel>

      <Panel title="Canvas sizes" note="Only shown when Canvas Portrait is visible.">
        <div className="space-y-3">
          {CANVAS_SIZES.map((size) => (
            <OptionControls
              key={size}
              label={displaySizeLabel(size)}
              price={catalog.canvas[size]}
              onPriceChange={(value) => patch({ canvas: { ...catalog.canvas, [size]: value } })}
              meta={catalog.options.canvasSizes[size]}
              onMetaChange={(meta) =>
                patchOptions({
                  canvasSizes: { ...catalog.options.canvasSizes, [size]: meta },
                })
              }
            />
          ))}
        </div>
      </Panel>

      <Panel title="Number of pets" note="One pet stays ₹0 when included. Status still controls show / hide / out of stock.">
        <div className="space-y-3">
          {(
            [
              { id: "one", label: "One pet", fixed: true },
              { id: "two", label: "Two pets" },
              { id: "three", label: "Three pets" },
              { id: "four", label: "Four pets" },
              { id: "human", label: "Human + pet" },
            ] as const
          ).map((pet) => (
            <OptionControls
              key={pet.id}
              label={pet.label}
              showPrice={!("fixed" in pet && pet.fixed)}
              price={catalog.pets[pet.id]}
              onPriceChange={
                "fixed" in pet && pet.fixed
                  ? undefined
                  : (value) => patch({ pets: { ...catalog.pets, [pet.id]: value } })
              }
              priceHint={pet.id === "one" ? "Always included at ₹0" : undefined}
              meta={catalog.options.pets[pet.id]}
              onMetaChange={(meta) =>
                patchOptions({ pets: { ...catalog.options.pets, [pet.id]: meta } })
              }
            />
          ))}
        </div>
      </Panel>

      <Panel
        title="Add-ons"
        note="Premium background is charged when a customer picks bg7, bg8, or bg9. Those three backgrounds are currently hidden on the product page."
      >
        <div className="grid sm:grid-cols-3 gap-3">
          <Money label="Halo effect" value={catalog.halo} onChange={(halo) => patch({ halo })} />
          <Money label="Gift wrap" value={catalog.giftWrap} onChange={(giftWrap) => patch({ giftWrap })} />
          <Money label="Premium background" value={catalog.premiumBackground} onChange={(premiumBackground) => patch({ premiumBackground })} />
        </div>
      </Panel>

      <Panel title="Extras">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-3">
            <Money label="Mug price" value={catalog.mug.price} onChange={(price) => patch({ mug: { ...catalog.mug, price } })} />
            <Money label="Mug crossed-out" value={catalog.mug.compareAt} onChange={(compareAt) => patch({ mug: { ...catalog.mug, compareAt } })} />
          </div>
          <div className="space-y-3">
            <Money label="Magnet price" value={catalog.magnet.price} onChange={(price) => patch({ magnet: { ...catalog.magnet, price } })} />
            <Money label="Magnet crossed-out" value={catalog.magnet.compareAt} onChange={(compareAt) => patch({ magnet: { ...catalog.magnet, compareAt } })} />
          </div>
          <div className="space-y-3">
            <Money label="Digital file price" value={catalog.digital.price} onChange={(price) => patch({ digital: { ...catalog.digital, price } })} />
            <Money label="Digital file crossed-out" value={catalog.digital.compareAt} onChange={(compareAt) => patch({ digital: { ...catalog.digital, compareAt } })} />
          </div>
        </div>
      </Panel>

      <Panel
        title="Payment rules"
        note="The coupon is applied first. The prepaid discount is then taken off the amount after the coupon. Cash on delivery does not get the prepaid discount."
      >
        <div className="grid sm:grid-cols-3 gap-3">
          <Money label="Prepaid discount %" value={catalog.prepaidPercent} onChange={(prepaidPercent) => patch({ prepaidPercent })} hint="0 to 100" />
          <Money label="Cash on delivery, pay now %" value={catalog.codAdvancePercent} onChange={(codAdvancePercent) => patch({ codAdvancePercent })} hint="1 to 99" />
          <Field label="Due on delivery %">
            <input readOnly value={dueLater} className={`${inputClass} bg-[#f8f9fa]`} />
          </Field>
        </div>
      </Panel>

      <Panel
        title="Fixed payment products"
        note="These are the only amounts checkout will accept for custom payment, fresh payment, and a standalone digital download."
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Money
            label="Custom payment A"
            value={catalog.customPayments[0]}
            onChange={(value) => patch({ customPayments: [value, catalog.customPayments[1]] })}
          />
          <Money
            label="Custom payment B"
            value={catalog.customPayments[1]}
            onChange={(value) => patch({ customPayments: [catalog.customPayments[0], value] })}
          />
          <Money label="Fresh payment" value={catalog.freshPayment} onChange={(freshPayment) => patch({ freshPayment })} />
          <Money
            label="Digital download A"
            value={catalog.digitalDownloads[0]}
            onChange={(value) => patch({ digitalDownloads: [value, catalog.digitalDownloads[1]] })}
          />
          <Money
            label="Digital download B"
            value={catalog.digitalDownloads[1]}
            onChange={(value) => patch({ digitalDownloads: [catalog.digitalDownloads[0], value] })}
          />
        </div>
      </Panel>

      {error ? <p className={errorClass}>{error}</p> : null}
      {message ? <p className={okClass}>{message}</p> : null}
      <button type="submit" disabled={saving || !ready} className={buttonClass}>
        {saving ? "Saving…" : "Save prices & availability"}
      </button>
    </form>
  );
}
