"use client";

import { FormEvent, useEffect, useState } from "react";
import { updatePrices } from "@/app/actions/storeActions";
import { cloneCatalog, type PriceCatalog } from "@/lib/pricing";
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
    setMessage("Prices saved. New checkouts use these amounts. Orders already placed stay unchanged.");
    await onSaved();
  }

  const dueLater = Math.max(0, 100 - (Number(catalog.codAdvancePercent) || 0));

  return (
    <form onSubmit={handleSave} className="space-y-4">
      {setupError ? (
        <p className={warnClass}>{setupError}</p>
      ) : null}
      <p className="text-sm text-[#6b7280] leading-relaxed max-w-3xl">
        Amounts are in rupees. A crossed-out price is shown on the shop only when it is higher than the selling price.
        The cash-on-delivery amount due later is always 100 minus the pay-now percent.
      </p>

      <Panel title="Framed portraits">
        <div className="grid sm:grid-cols-3 gap-3">
          <Money label='8" × 10"' value={catalog.framed['8"x10"']} onChange={(value) => patch({ framed: { ...catalog.framed, '8"x10"': value } })} />
          <Money label='12" × 16"' value={catalog.framed['12"x16"']} onChange={(value) => patch({ framed: { ...catalog.framed, '12"x16"': value } })} />
          <Money label='18" × 24"' value={catalog.framed['18"x24"']} onChange={(value) => patch({ framed: { ...catalog.framed, '18"x24"': value } })} />
        </div>
      </Panel>

      <Panel title="Canvas portraits">
        <div className="grid sm:grid-cols-3 gap-3">
          <Money label='8" × 12"' value={catalog.canvas['8"x12"']} onChange={(value) => patch({ canvas: { ...catalog.canvas, '8"x12"': value } })} />
          <Money label='16" × 20"' value={catalog.canvas['16"x20"']} onChange={(value) => patch({ canvas: { ...catalog.canvas, '16"x20"': value } })} />
          <Money label='20" × 30"' value={catalog.canvas['20"x30"']} onChange={(value) => patch({ canvas: { ...catalog.canvas, '20"x30"': value } })} />
        </div>
      </Panel>

      <Panel title="Extra pets" note="One pet stays included at ₹0.">
        <div className="grid sm:grid-cols-4 gap-3">
          <Money label="2 pets" value={catalog.pets.two} onChange={(value) => patch({ pets: { ...catalog.pets, two: value } })} />
          <Money label="3 pets" value={catalog.pets.three} onChange={(value) => patch({ pets: { ...catalog.pets, three: value } })} />
          <Money label="4 pets" value={catalog.pets.four} onChange={(value) => patch({ pets: { ...catalog.pets, four: value } })} />
          <Money label="Human + pet" value={catalog.pets.human} onChange={(value) => patch({ pets: { ...catalog.pets, human: value } })} />
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
        {saving ? "Saving…" : "Save prices"}
      </button>
    </form>
  );
}
