"use client";

import { FormEvent, useState } from "react";
import { PawPrint } from "lucide-react";
import { deleteLandingProductAction, saveLandingProductAction } from "@/app/actions/landingActions";
import { removeLandingProductPhoto } from "@/app/actions/landingContentActions";
import { CONFIGURATOR_NAMES, configuratorForSlug, isNewProduct, type NewProduct } from "@/lib/everyday-content";
import type { LandingProduct } from "@/lib/landing-products";
import { PORTRAITS, cardPhoto, portraitBySlug, type CardPhotoSource } from "@/lib/portraits";
import { mediaSlot } from "@/lib/site-media-catalog";
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

/** Desk Portrait / Signature Gift Bundle: launched here, then sold through their own configurator at Pricing's prices. */
function launchProduct(slug: string): NewProduct | null {
  const product = configuratorForSlug(slug.trim());
  return isNewProduct(product) ? product : null;
}

/** Same rule as the shop: a launched row is kind 'portrait' (or a 'fixed' row marked for sale). */
function isLaunched(item: { active?: boolean; kind: "portrait" | "fixed"; forSale: boolean }) {
  return item.kind === "portrait" || item.forSale;
}

/** "Photos tab → Landing page → You & Your Pet card", for cards that have a Media slot. */
function mediaPath(slug: string) {
  const slot = portraitBySlug(slug)?.imageSlot;
  const label = slot ? mediaSlot(slot)?.label : "";
  return label ? `Photos tab → Landing page → ${label}` : "";
}

/** Where the card photo comes from, and how to change it. */
function photoNote(slug: string, source: CardPhotoSource, canUpload: boolean) {
  const path = mediaPath(slug);
  if (source === "upload") return `Photo uploaded here.${path ? ` Remove it to use ${path} instead.` : ""}`;
  if (source === "media") return `Photo from ${path}.${canUpload ? " A photo uploaded here would replace it on this card." : ""}`;
  const where = [canUpload ? "here (Edit → Photo)" : "", path ? `in ${path}` : ""].filter(Boolean).join(" or ");
  if (source === "shop") return `Shop photo, shown until you upload one ${where}.`;
  return where ? `No photo yet: the card shows a paw. Upload one ${where}.` : "No photo yet: the card shows a paw.";
}

function previewSrc(url: string) {
  return /^https?:\/\//i.test(url) ? url : encodeURI(url);
}

function CardThumb({ url }: { url: string }) {
  return (
    <div className="relative flex h-16 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f5efe9]">
      {url ? (
        <img src={previewSrc(url)} alt="" className="h-full w-full object-cover" />
      ) : (
        <PawPrint aria-hidden size={18} className="text-[#A97659]/50" />
      )}
    </div>
  );
}

export function LandingProductsPanel({
  products,
  ready,
  setupError,
  media,
  onChanged,
  onOpenPhotos,
}: {
  products: LandingProduct[];
  ready: boolean;
  setupError?: string;
  /** Admin uploads by Media slot id, to show each card's current photo. */
  media: Record<string, string>;
  onChanged: () => Promise<void>;
  /** Opens the landing photos (Media → Landing page). */
  onOpenPhotos: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const editing = products.find((product) => product.id === draft.id);
  const editingPhoto = editing ? cardPhoto(editing.slug, editing.imageUrl, media) : null;

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
    if (launchProduct(draft.slug)) {
      // Launched → opens its configurator (portrait, one pet); otherwise Coming soon. The server applies the same rule.
      const launched = isLaunched(draft);
      form.set("kind", launched ? "portrait" : "fixed");
      form.set("pets", "one");
      form.set("forSale", launched ? "true" : "false");
      form.delete("price");
    } else {
      form.set("kind", draft.kind);
      form.set("pets", draft.pets);
    }
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

  async function removePhoto(id: string) {
    if (!window.confirm("Remove the photo uploaded for this card? The card goes back to its Media photo, or a paw if it has none.")) return;
    setSaving(true);
    setError("");
    setMessage("");
    const result = await removeLandingProductPhoto(id);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessage("Photo removed.");
    await onChanged();
  }

  if (!ready) {
    return (
      <div className="space-y-4">
        <p className={warnClass}>{setupError || "Landing products are not ready yet."}</p>
        <Panel
          title="Cards on the landing page now"
          note="Until that SQL is run, /landing shows these built-in cards and their names, descriptions, order and visibility can't be changed here. Their photos can: upload them in the Photos tab → Landing page."
        >
          <ul className="divide-y divide-[#f3f4f6]">
            {PORTRAITS.map((portrait) => {
              const photo = cardPhoto(portrait.slug, "", media);
              return (
                <li key={portrait.slug} className="flex flex-wrap items-center gap-3 py-3">
                  <CardThumb url={photo.url} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{portrait.name}</p>
                    <p className="text-xs text-[#6b7280]">
                      {portrait.pets && !launchProduct(portrait.slug) ? "Opens the portrait customizer" : "Coming soon"}
                    </p>
                    <p className="mt-0.5 text-xs text-[#9ca3af]">{photoNote(portrait.slug, photo.source, false)}</p>
                  </div>
                  <button type="button" className={ghostButtonClass} onClick={onOpenPhotos}>
                    {photo.source === "media" ? "Change photo" : "Upload photo"}
                  </button>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Panel
        title={draft.id ? "Edit product" : "New product"}
        note="Portrait cards open the existing customizer and show the cheapest price on sale in Pricing. Fixed-price cards stay as Coming soon until you enter a price and turn on For sale. Checkout charges that price. The “From” and “Coming soon” wording is in the Page text tab."
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
          <Field label="Order on the page" hint="Smaller numbers come first.">
            <input name="sortOrder" value={draft.sortOrder} onChange={(event) => set("sortOrder", event.target.value)} className={inputClass} inputMode="numeric" />
          </Field>
          <Field
            label="Photo"
            hint={
              draft.id
                ? "Vertical 3:4 photo, JPG, PNG, or WebP, under 15 MB. Leave empty to keep the current photo."
                : "Vertical 3:4 photo, JPG, PNG, or WebP, under 15 MB. Without one, the card uses its Media → Landing page photo, if it has one."
            }
          >
            <input name="file" type="file" accept="image/jpeg,image/png,image/webp" className="block w-full text-sm" />
          </Field>
          {editing && editingPhoto ? (
            <div className="flex items-center gap-3 rounded-2xl border border-[#eeeeee] bg-[#fafafa] p-3 md:col-span-2">
              <CardThumb url={editingPhoto.url} />
              <p className="min-w-0 flex-1 text-xs text-[#6b7280]">Shown on the card now. {photoNote(editing.slug, editingPhoto.source, true)}</p>
              {editingPhoto.source === "upload" ? (
                <button type="button" disabled={saving} className={dangerButtonClass} onClick={() => removePhoto(editing.id)}>
                  Remove uploaded photo
                </button>
              ) : mediaPath(editing.slug) ? (
                <button type="button" className={ghostButtonClass} onClick={onOpenPhotos}>
                  Open landing photos
                </button>
              ) : null}
            </div>
          ) : null}
          {launchProduct(draft.slug) ? (
            <div className="space-y-2 rounded-2xl border border-[#eeeeee] bg-[#fafafa] p-3 md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={isLaunched(draft)}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      kind: event.target.checked ? "portrait" : "fixed",
                      pets: "one",
                      forSale: event.target.checked,
                    }))
                  }
                />
                Launch: open the {CONFIGURATOR_NAMES[launchProduct(draft.slug) as NewProduct]} configurator
              </label>
              <p className="text-xs text-[#6b7280]">
                Off: the card says Coming soon and its page is not found. On: the card links to the product page and shows
                the “From” price from Pricing → {launchProduct(draft.slug) === "mini_desk" ? "Desk Portrait" : "Signature Gift Bundle"}.
                Its text, switches and photos are in Admin → Configurator → {CONFIGURATOR_NAMES[launchProduct(draft.slug) as NewProduct]}.
              </p>
            </div>
          ) : null}
          {launchProduct(draft.slug) ? null : (
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
          )}
          {launchProduct(draft.slug) ? null : draft.kind === "portrait" ? (
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
          {draft.kind === "fixed" && !launchProduct(draft.slug) ? (
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

      <Panel
        title="Products"
        note="In page order. Card photo: the one uploaded here wins, then the card's photo in Photos tab → Landing page, then a shop photo; with none, the card shows a paw. Signature Gift Bundle and Desk Portrait stay Coming soon until you Edit them and tick Launch; they then open their own configurator at the prices in Pricing."
      >
        <ul className="divide-y divide-[#f3f4f6]">
          {products.map((product) => {
            const photo = cardPhoto(product.slug, product.imageUrl, media);
            return (
              <li key={product.id} className="flex flex-wrap items-center gap-3 py-3">
                <CardThumb url={photo.url} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{product.name}</p>
                  <p className="text-xs text-[#6b7280]">
                    {launchProduct(product.slug)
                      ? product.active && isLaunched(product)
                        ? `Launched · ${CONFIGURATOR_NAMES[launchProduct(product.slug) as NewProduct]} configurator · price from Pricing`
                        : "Coming soon · Edit → Launch to sell it"
                      : product.kind === "portrait"
                      ? `Customizer · ${product.pets === "human" ? "person and pet" : product.pets === "two" ? "two pets" : "one pet"}`
                      : product.forSale && product.price
                        ? `For sale · ₹${product.price.toLocaleString("en-IN")}`
                        : "Coming soon"}
                    {product.active ? "" : " · Hidden"}
                  </p>
                  <p className="mt-0.5 text-xs text-[#9ca3af]">{photoNote(product.slug, photo.source, true)}</p>
                </div>
                <button type="button" className={ghostButtonClass} onClick={() => setDraft(fromProduct(product))}>
                  Edit
                </button>
                <button type="button" className={dangerButtonClass} onClick={() => remove(product.id, product.name)}>
                  Remove
                </button>
              </li>
            );
          })}
          {products.length === 0 ? <li className="py-3 text-sm text-[#6b7280]">No products yet.</li> : null}
        </ul>
      </Panel>
    </div>
  );
}
