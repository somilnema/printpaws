"use client";

import { FormEvent, useEffect, useState } from "react";
import { updatePrices } from "@/app/actions/storeActions";
import {
  cloneCatalog,
  cloneOptionMeta,
  displaySizeLabel,
  isBuiltInSize,
  makeSize,
  MAX_SIZE_INCHES,
  OPTION_STATUS_LABELS,
  OPTION_STATUSES,
  sizeOptionMeta,
  sizesForStyle,
  type OptionMeta,
  type OptionStatus,
  type PortraitStyle,
  type PriceCatalog,
} from "@/lib/pricing";
import { buttonClass, errorClass, Field, ghostButtonClass, inputClass, okClass, Panel, warnClass } from "@/components/admin/ui";

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
  onRemove,
}: {
  label: string;
  price?: number;
  onPriceChange?: (value: number) => void;
  meta: OptionMeta;
  onMetaChange: (meta: OptionMeta) => void;
  priceHint?: string;
  showPrice?: boolean;
  onRemove?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-[#eeeeee] bg-[#fafafa] p-3 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-[#1a1a1b]">{label}</p>
        {onRemove ? (
          <button type="button" onClick={onRemove} className="ml-auto text-xs font-semibold text-[#b42318] hover:underline">
            Remove size
          </button>
        ) : null}
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

/** Sizes for one style, with an add form. Built-in sizes can only be hidden; added ones can be removed. */
function SizeRows({
  style,
  catalog,
  onChange,
}: {
  style: PortraitStyle;
  catalog: PriceCatalog;
  onChange: (next: Partial<PriceCatalog>) => void;
}) {
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [problem, setProblem] = useState("");
  const optionKey = style === "framed" ? "framedSizes" : "canvasSizes";
  const prices = catalog[style];
  const options = catalog.options[optionKey];

  function addSize() {
    const w = Number(width);
    const h = Number(height);
    if (!Number.isInteger(w) || !Number.isInteger(h) || w < 1 || h < 1 || w > MAX_SIZE_INCHES || h > MAX_SIZE_INCHES) {
      setProblem(`Enter whole inches from 1 to ${MAX_SIZE_INCHES}.`);
      return;
    }
    const size = makeSize(w, h);
    if (prices[size] != null) {
      setProblem(`${displaySizeLabel(size)} is already in the list.`);
      return;
    }
    onChange({
      [style]: { ...prices, [size]: 0 },
      options: { ...catalog.options, [optionKey]: { ...options, [size]: cloneOptionMeta() } },
    });
    setWidth("");
    setHeight("");
    setProblem("");
  }

  function removeSize(size: string) {
    const nextPrices = { ...prices };
    const nextOptions = { ...options };
    delete nextPrices[size];
    delete nextOptions[size];
    onChange({ [style]: nextPrices, options: { ...catalog.options, [optionKey]: nextOptions } });
  }

  return (
    <div className="space-y-3">
      {sizesForStyle(style, catalog).map((size) => (
        <OptionControls
          key={size}
          label={displaySizeLabel(size)}
          price={prices[size]}
          onPriceChange={(value) => onChange({ [style]: { ...prices, [size]: value } })}
          meta={sizeOptionMeta(catalog, style, size) ?? cloneOptionMeta()}
          onMetaChange={(meta) => onChange({ options: { ...catalog.options, [optionKey]: { ...options, [size]: meta } } })}
          onRemove={isBuiltInSize(style, size) ? undefined : () => removeSize(size)}
        />
      ))}
      <div className="flex flex-wrap items-end gap-2 rounded-2xl border border-dashed border-[#d1d5db] p-3">
        <Field label="Width (in)">
          <input type="number" min={1} max={MAX_SIZE_INCHES} value={width} onChange={(e) => setWidth(e.target.value)} className={`${inputClass} w-24`} />
        </Field>
        <Field label="Height (in)">
          <input type="number" min={1} max={MAX_SIZE_INCHES} value={height} onChange={(e) => setHeight(e.target.value)} className={`${inputClass} w-24`} />
        </Field>
        <button type="button" onClick={addSize} className={ghostButtonClass}>
          Add size
        </button>
        {problem ? <p className="w-full text-sm text-[#b42318]">{problem}</p> : null}
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
        <SizeRows style="framed" catalog={catalog} onChange={patch} />
      </Panel>

      <Panel title="Canvas sizes" note="Only shown when Canvas Portrait is visible.">
        <SizeRows style="canvas" catalog={catalog} onChange={patch} />
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
        note="Backgrounds marked Limited Edition in the configurator charge this price. Priority Preview is an Everyday Pet Portrait option."
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Money label="Halo effect" value={catalog.halo} onChange={(halo) => patch({ halo })} />
          <Money label="Gift wrap" value={catalog.giftWrap} onChange={(giftWrap) => patch({ giftWrap })} />
          <Money label="Limited Edition background" value={catalog.premiumBackground} onChange={(premiumBackground) => patch({ premiumBackground })} />
          <Money label="Priority Preview" value={catalog.priorityPreview} onChange={(priorityPreview) => patch({ priorityPreview })} />
        </div>
      </Panel>

      <Panel
        title="You & Your Pet and Multi-Pet"
        note="Family upgrade: added to the main product price when the shopper picks My Family & Our Pet (never shown as an add-on). Halo: Multi-Pet's Special Tribute; keep ₹0 until Peternity approves a price. Both base prices come from the sizes above plus Human + pet / Two pets."
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Money
            label="My Family & Our Pet upgrade"
            value={catalog.familyUpgrade}
            onChange={(familyUpgrade) => patch({ familyUpgrade })}
          />
          <Money
            label="Multi-Pet halo (Special Tribute)"
            value={catalog.multiPetHalo}
            onChange={(multiPetHalo) => patch({ multiPetHalo })}
          />
        </div>
      </Panel>

      <Panel
        title="Desk Portrait"
        note="The Desk Portrait product page (one fixed size, wooden stand always included, never a paid add-on). Customer pays the base price, plus the extra for 2 or 3 pets. Keep a placeholder until Peternity approves the prices."
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Money
            label="Base price (1 pet)"
            value={catalog.miniDesk.price}
            onChange={(price) => patch({ miniDesk: { ...catalog.miniDesk, price } })}
          />
          <Money
            label="Extra for 2 pets"
            value={catalog.miniDesk.twoPets}
            onChange={(twoPets) => patch({ miniDesk: { ...catalog.miniDesk, twoPets } })}
            hint="Added to the base price. 0 = no extra charge."
          />
          <Money
            label="Extra for 3 pets"
            value={catalog.miniDesk.threePets}
            onChange={(threePets) => patch({ miniDesk: { ...catalog.miniDesk, threePets } })}
            hint="Added to the base price. 0 = no extra charge."
          />
        </div>
      </Panel>

      <Panel
        title="Signature Gift Bundle"
        note="Each bundle tier price is added to the portrait's style × size price above (Framed / Canvas sizes). The mug, digital file, magnet and packaging included in a tier are never charged again. Keep placeholders until Peternity approves the prices."
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Money
            label="Essential tier price"
            value={catalog.giftBundle.essential}
            onChange={(essential) => patch({ giftBundle: { ...catalog.giftBundle, essential } })}
            hint="Added to the portrait's style × size price."
          />
          <Money
            label="Signature tier price"
            value={catalog.giftBundle.signature}
            onChange={(signature) => patch({ giftBundle: { ...catalog.giftBundle, signature } })}
            hint="Added to the portrait's style × size price."
          />
          <Money
            label="Personalised Greeting Card"
            value={catalog.giftBundle.greetingCard}
            onChange={(greetingCard) => patch({ giftBundle: { ...catalog.giftBundle, greetingCard } })}
            hint="Optional paid card. It can only be added while this is above ₹0."
          />
        </div>
      </Panel>

      <Panel title="Extras">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          <div className="space-y-3">
            <Money
              label="Desk Portrait add-on (Everyday cart) price"
              value={catalog.desk.price}
              onChange={(price) => patch({ desk: { ...catalog.desk, price } })}
              hint="The add-on in the cart. The Desk Portrait product page is priced in its own panel above."
            />
            <Money
              label="Desk Portrait add-on (Everyday cart) crossed-out"
              value={catalog.desk.compareAt}
              onChange={(compareAt) => patch({ desk: { ...catalog.desk, compareAt } })}
            />
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
