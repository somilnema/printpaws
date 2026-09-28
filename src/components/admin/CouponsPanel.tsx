"use client";

import { FormEvent, useState } from "react";
import { removeCoupon, updateCoupon } from "@/app/actions/storeActions";
import type { CouponRecord } from "@/lib/store-config";
import { COUPON_SCOPES, type CouponScope } from "@/lib/pricing";
import { buttonClass, errorClass, Field, ghostButtonClass, inputClass, okClass, Panel, warnClass } from "@/components/admin/ui";

const SCOPE_LABELS: Record<CouponScope, string> = {
  all: "Entire order",
  portrait: "Portrait",
  mug: "Mug",
  magnet: "Magnet",
  digital: "Digital file",
};

type Draft = {
  id?: string;
  code: string;
  discountType: "percent" | "fixed";
  discountValue: string;
  active: boolean;
  startsAt: string;
  endsAt: string;
  minOrderAmount: string;
  usageLimit: string;
  oncePerCustomer: boolean;
  appliesTo: CouponScope[];
};

const EMPTY: Draft = {
  code: "",
  discountType: "percent",
  discountValue: "10",
  active: true,
  startsAt: "",
  endsAt: "",
  minOrderAmount: "",
  usageLimit: "",
  oncePerCustomer: false,
  appliesTo: ["all"],
};

function toLocalInput(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatWhen(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function CouponsPanel({
  coupons,
  ready,
  setupError,
  onChanged,
}: {
  coupons: CouponRecord[];
  ready: boolean;
  setupError?: string;
  onChanged: () => Promise<void>;
}) {
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function toggleScope(scope: CouponScope) {
    setDraft((current) => {
      const has = current.appliesTo.includes(scope);
      let next = has ? current.appliesTo.filter((item) => item !== scope) : [...current.appliesTo, scope];
      if (scope === "all" && !has) next = ["all"];
      if (scope !== "all") next = next.filter((item) => item !== "all");
      return { ...current, appliesTo: next };
    });
  }

  function edit(coupon: CouponRecord) {
    setError("");
    setMessage("");
    setDraft({
      id: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue),
      active: coupon.active,
      startsAt: toLocalInput(coupon.startsAt),
      endsAt: toLocalInput(coupon.endsAt),
      minOrderAmount: coupon.minOrderAmount == null ? "" : String(coupon.minOrderAmount),
      usageLimit: coupon.usageLimit == null ? "" : String(coupon.usageLimit),
      oncePerCustomer: coupon.oncePerCustomer,
      appliesTo: coupon.appliesTo,
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    const result = await updateCoupon({
      id: draft.id,
      code: draft.code,
      discountType: draft.discountType,
      discountValue: Number(draft.discountValue),
      active: draft.active,
      startsAt: draft.startsAt ? new Date(draft.startsAt).toISOString() : null,
      endsAt: draft.endsAt ? new Date(draft.endsAt).toISOString() : null,
      minOrderAmount: draft.minOrderAmount === "" ? null : Number(draft.minOrderAmount),
      usageLimit: draft.usageLimit === "" ? null : Number(draft.usageLimit),
      oncePerCustomer: draft.oncePerCustomer,
      appliesTo: draft.appliesTo,
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDraft(EMPTY);
    setMessage(draft.id ? "Coupon updated." : "Coupon created.");
    await onChanged();
  }

  async function handleDelete(coupon: CouponRecord) {
    if (!window.confirm(`Delete ${coupon.code}? Orders that already used it stay as they are.`)) return;
    setError("");
    setMessage("");
    const result = await removeCoupon(coupon.id);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (draft.id === coupon.id) setDraft(EMPTY);
    setMessage(`${coupon.code} deleted.`);
    await onChanged();
  }

  return (
    <div className="space-y-4">
      {setupError ? (
        <p className={warnClass}>{setupError}</p>
      ) : null}
      <p className="text-sm text-[#6b7280] leading-relaxed max-w-3xl">
        A coupon is checked when the customer applies it and again when they pay. Usage is the number of orders that
        saved that code. One use per email is checked at payment, because the email may not be entered when the code is
        first applied. Leave dates, minimum, and usage limit empty when you do not want that rule.
      </p>

      <Panel title={draft.id ? `Edit ${draft.code}` : "New coupon"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-4 gap-3">
            <Field label="Code">
              <input
                value={draft.code}
                onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })}
                className={inputClass}
                placeholder="WELCOME10"
                required
              />
            </Field>
            <Field label="Type">
              <select
                value={draft.discountType}
                onChange={(e) => setDraft({ ...draft, discountType: e.target.value as Draft["discountType"] })}
                className={inputClass}
              >
                <option value="percent">Percentage off</option>
                <option value="fixed">Fixed rupees off</option>
              </select>
            </Field>
            <Field label={draft.discountType === "percent" ? "Percent" : "Rupees off"}>
              <input
                type="number"
                min={1}
                max={draft.discountType === "percent" ? 100 : undefined}
                step={1}
                value={draft.discountValue}
                onChange={(e) => setDraft({ ...draft, discountValue: e.target.value })}
                className={inputClass}
                required
              />
            </Field>
            <Field label="Status">
              <select
                value={draft.active ? "on" : "off"}
                onChange={(e) => setDraft({ ...draft, active: e.target.value === "on" })}
                className={inputClass}
              >
                <option value="on">Active</option>
                <option value="off">Off</option>
              </select>
            </Field>
          </div>
          <div className="grid md:grid-cols-4 gap-3">
            <Field label="Starts">
              <input type="datetime-local" value={draft.startsAt} onChange={(e) => setDraft({ ...draft, startsAt: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Ends">
              <input type="datetime-local" value={draft.endsAt} onChange={(e) => setDraft({ ...draft, endsAt: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Minimum order ₹">
              <input type="number" min={0} step={1} value={draft.minOrderAmount} onChange={(e) => setDraft({ ...draft, minOrderAmount: e.target.value })} className={inputClass} placeholder="None" />
            </Field>
            <Field label="Total uses">
              <input type="number" min={1} step={1} value={draft.usageLimit} onChange={(e) => setDraft({ ...draft, usageLimit: e.target.value })} className={inputClass} placeholder="No limit" />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.oncePerCustomer}
              onChange={(e) => setDraft({ ...draft, oncePerCustomer: e.target.checked })}
              className="h-4 w-4 accent-black"
            />
            One use per customer email
          </label>
          <fieldset>
            <legend className="text-xs font-medium text-[#6b7280] mb-2">Applies to</legend>
            <div className="flex flex-wrap gap-2">
              {COUPON_SCOPES.map((scope) => {
                const on = draft.appliesTo.includes(scope);
                return (
                  <button
                    key={scope}
                    type="button"
                    onClick={() => toggleScope(scope)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium ${on ? "bg-primary text-white" : "bg-[#f8f9fa] text-[#6b7280]"}`}
                  >
                    {SCOPE_LABELS[scope]}
                  </button>
                );
              })}
            </div>
          </fieldset>
          {error ? <p className={errorClass}>{error}</p> : null}
          {message ? <p className={okClass}>{message}</p> : null}
          <div className="flex gap-2">
            <button type="submit" disabled={saving || !ready} className={buttonClass}>
              {saving ? "Saving…" : draft.id ? "Update coupon" : "Create coupon"}
            </button>
            {draft.id ? (
              <button type="button" onClick={() => setDraft(EMPTY)} className={ghostButtonClass}>
                Cancel edit
              </button>
            ) : null}
          </div>
        </form>
      </Panel>

      <div className="overflow-x-auto rounded-3xl border border-[#eeeeee] bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-xs text-[#9ca3af]">
            <tr>
              <th className="px-3 py-2 font-bold">Code</th>
              <th className="px-3 py-2 font-bold">Discount</th>
              <th className="px-3 py-2 font-bold">Status</th>
              <th className="px-3 py-2 font-bold">Window</th>
              <th className="px-3 py-2 font-bold">Rules</th>
              <th className="px-3 py-2 font-bold">Uses</th>
              <th className="px-3 py-2 font-bold"></th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-[#9ca3af]">
                  No coupons yet.
                </td>
              </tr>
            ) : (
              coupons.map((coupon) => (
                <tr key={coupon.id} className="border-t border-[#f3f4f6] align-top">
                  <td className="px-4 py-3.5 font-semibold">{coupon.code}</td>
                  <td className="px-3 py-3">
                    {coupon.discountType === "percent" ? `${coupon.discountValue}%` : `₹${coupon.discountValue.toLocaleString("en-IN")}`}
                    <div className="text-[11px] text-[#9ca3af] mt-1">{coupon.appliesTo.map((scope) => SCOPE_LABELS[scope]).join(", ")}</div>
                  </td>
                  <td className="px-3 py-3">{coupon.active ? "Active" : "Off"}</td>
                  <td className="px-3 py-3 text-xs leading-relaxed">
                    {formatWhen(coupon.startsAt)}
                    <br />
                    {formatWhen(coupon.endsAt)}
                  </td>
                  <td className="px-3 py-3 text-xs leading-relaxed">
                    {coupon.minOrderAmount != null ? `Min ₹${coupon.minOrderAmount.toLocaleString("en-IN")}` : "No minimum"}
                    <br />
                    {coupon.oncePerCustomer ? "Once per email" : "Repeat email allowed"}
                  </td>
                  <td className="px-3 py-3">
                    {coupon.usageCount}
                    {coupon.usageLimit != null ? ` / ${coupon.usageLimit}` : ""}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => edit(coupon)} className={ghostButtonClass}>
                        Edit
                      </button>
                      <button type="button" onClick={() => handleDelete(coupon)} className={ghostButtonClass}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
