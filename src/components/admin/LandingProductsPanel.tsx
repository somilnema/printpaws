"use client";

import { FormEvent, useState } from "react";
import { deleteLandingProductAction, saveLandingProductAction } from "@/app/actions/landingActions";
import type { LandingProduct } from "@/lib/landing-products";
import { buttonClass, dangerButtonClass, errorClass, Field, ghostButtonClass, inputClass, okClass, Panel, warnClass } from "@/components/admin/ui";

type Draft = {
  id: string;
  slug: string;
  name: string;
  description: string;
  sortOrder: string;
  active: boolean;
  kind: "portrait" | "fixed";
  pets: "one" | "two" | "human";
  price: string;
  forSale: boolean;
};

const EMPTY: Draft = {
  id: "",
  slug: "",
  name: "",
  description: "",
  sortOrder: "0",
  active: true,
  kind: "fixed",
  pets: "one",
  price: "",
  forSale: false,
};

function fromProduct(product: LandingProduct): Draft {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    sortOrder: String(product.sortOrder),
    active: product.active,
    kind: product.kind,
    pets: product.pets || "one",
    price: product.price == null ? "" : String(product.price),
    forSale: product.forSale,
  };
}

export function LandingProductsPanel({
  products,
  ready,
  setupError,
  onChanged,
}: {
  products: LandingProduct[];
  ready: boolean;
  setupError?: string;
  onChanged: () => Promise<void>;
}) {
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    form.set("active", draft.active ? "true" : "false");
    form.set("forSale", draft.forSale ? "true" : "false");
    form.set("kind", draft.kind);
    form.set("pets", draft.pets);
    const result = await saveLandingProductAction(form);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    formEl.reset();
    setMessage(draft.id ? "Product saved." : "Product created.");
    setDraft(EMPTY);
    await onChanged();
  }

  async function remove(id: string, name: string) {
    if (!window.confirm(`Remove ${name} from the landing page?`)) return;
    setError("");
    setMessage("");
    const result = await deleteLandingProductAction(id);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (draft.id === id) setDraft(EMPTY);
    setMessage("Product removed.");
    await onChanged();
  }

  if (!ready) {
    return <p className={warnClass}>{setupError || "Landing products are not ready yet."}</p>;
  }

  return (
    <div className="space-y-4">
      <Panel
        title={draft.id ? "Edit product" : "New product"}
        note="Portrait cards open the existing customizer and show the live canvas starting price. Fixed-price cards stay as Coming soon until you enter a price and turn on For sale. Checkout charges that price."
      >
        <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
          <input type="hidden" name="id" value={draft.id} />
          <Field label="Name">
            <input name="name" value={draft.name} onChange={(event) => set("name", event.target.value)} className={inputClass} required />
          </Field>
          <Field label="Link" hint="Leave blank to build it from the name. Example: signature-gift-bundle">
            <input name="slug" value={draft.slug} onChange={(event) => set("slug", event.target.value)} className={inputClass} placeholder="signature-gift-bundle" />
          </Field>
          <div className="md:col-span-2">
            <Field label="Short description">
              <input name="description" value={draft.description} onChange={(event) => set("description", event.target.value)} className={inputClass} required />
            </Field>
          </div>
          <Field label="Order on the page">
            <input name="sortOrder" value={draft.sortOrder} onChange={(event) => set("sortOrder", event.target.value)} className={inputClass} inputMode="numeric" />
          </Field>
          <Field label="Photo" hint={draft.id ? "Leave empty to keep the current photo." : "Vertical photo, JPG, PNG, or WebP."}>
            <input name="file" type="file" accept="image/jpeg,image/png,image/webp" className="block w-full text-sm" />
          </Field>
          <Field label="How it sells">
            <select
              name="kind"
              value={draft.kind}
              onChange={(event) => set("kind", event.target.value === "fixed" ? "fixed" : "portrait")}
              className={inputClass}
            >
              <option value="portrait">Opens the portrait customizer</option>
              <option value="fixed">Fixed price, set here</option>
            </select>
          </Field>
          {draft.kind === "portrait" ? (
            <Field label="Customizer opens on">
              <select name="pets" value={draft.pets} onChange={(event) => set("pets", event.target.value as Draft["pets"])} className={inputClass}>
                <option value="one">One pet</option>
                <option value="two">Two pets</option>
                <option value="human">Person and pet</option>
              </select>
            </Field>
          ) : (
            <Field label="Price (₹)" hint="Required before For sale can be turned on.">
              <input name="price" value={draft.price} onChange={(event) => set("price", event.target.value)} className={inputClass} inputMode="numeric" />
            </Field>
          )}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={draft.active} onChange={(event) => set("active", event.target.checked)} />
            Show on the landing page
          </label>
          {draft.kind === "fixed" ? (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={draft.forSale} onChange={(event) => set("forSale", event.target.checked)} />
              For sale
            </label>
          ) : null}
          <div className="md:col-span-2 flex flex-wrap gap-2">
            <button type="submit" disabled={saving} className={buttonClass}>
              {saving ? "Saving…" : draft.id ? "Save product" : "Create product"}
            </button>
            {draft.id ? (
              <button type="button" className={ghostButtonClass} onClick={() => setDraft(EMPTY)}>
                Cancel edit
              </button>
            ) : null}
          </div>
        </form>
        {error ? <p className={`${errorClass} mt-4`}>{error}</p> : null}
        {message ? <p className={`${okClass} mt-4`}>{message}</p> : null}
      </Panel>

      <Panel title="Products" note="Signature Gift Bundle and Mini Desk Portrait stay Coming soon until you set a price and mark them for sale.">
        <ul className="divide-y divide-[#f3f4f6]">
          {products.map((product) => (
            <li key={product.id} className="flex flex-wrap items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{product.name}</p>
                <p className="text-xs text-[#6b7280]">
                  {product.kind === "portrait"
                    ? `Customizer · ${product.pets === "human" ? "person and pet" : product.pets === "two" ? "two pets" : "one pet"}`
                    : product.forSale && product.price
                      ? `For sale · ₹${product.price.toLocaleString("en-IN")}`
                      : "Coming soon"}
                  {product.active ? "" : " · Hidden"}
                </p>
              </div>
              <button type="button" className={ghostButtonClass} onClick={() => setDraft(fromProduct(product))}>
                Edit
              </button>
              <button type="button" className={dangerButtonClass} onClick={() => remove(product.id, product.name)}>
                Remove
              </button>
            </li>
          ))}
          {products.length === 0 ? <li className="py-3 text-sm text-[#6b7280]">No products yet.</li> : null}
        </ul>
      </Panel>
    </div>
  );
}
