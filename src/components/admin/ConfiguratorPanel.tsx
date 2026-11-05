"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { restoreEverydayContent, updateEverydayContent, type EverydayContentAdmin } from "@/app/actions/contentActions";
import {
  DEFAULT_EVERYDAY_CONTENT,
  EXTRA_IDS,
  NUMBER_LIMITS,
  TRUST_ICONS,
  type EverydayContent,
  type ExtraId,
  type TrustIcon,
} from "@/lib/everyday-content";
import { buttonClass, errorClass, Field, ghostButtonClass, inputClass, okClass, Panel, warnClass } from "@/components/admin/ui";

type FlatSection = "header" | "step1" | "step2" | "step3" | "cart";

type FieldDef = {
  key: string;
  label: string;
  hint?: string;
  long?: boolean;
};

type Tab = "header" | "step1" | "step2" | "step3" | "trust" | "backgrounds" | "cart" | "extras";

const TABS: { id: Tab; label: string }[] = [
  { id: "header", label: "Header" },
  { id: "step1", label: "Step 1 · Portrait" },
  { id: "step2", label: "Step 2 · Personalize" },
  { id: "step3", label: "Step 3 · Upload" },
  { id: "trust", label: "Trust badges" },
  { id: "backgrounds", label: "Backgrounds" },
  { id: "cart", label: "Cart" },
  { id: "extras", label: "Add-on products" },
];

const PRICE_HINT = "{price} is replaced with the price from Pricing.";

const FIELDS: Record<FlatSection, FieldDef[]> = {
  header: [
    { key: "productName", label: "Product name (top right, and cart title)" },
    { key: "backLabel", label: "Back link" },
    { key: "stepLabel", label: "Step line", hint: "{step}, {total} and {name} are filled in. {name} is each step's progress name." },
    { key: "completeLabel", label: "Progress percent", hint: "{percent} is filled in." },
    { key: "discountPercent", label: "Discount shown (%)", hint: "Sets the crossed-out price and the badge. 0 hides both." },
    { key: "discountBadge", label: "Discount badge", hint: "{percent} is filled in. Leave empty to hide the badge." },
  ],
  step1: [
    { key: "progressName", label: "Progress name", hint: "Shown in the step line at the top." },
    { key: "title", label: "Page title" },
    { key: "description", label: "Description", long: true },
    { key: "styleHeading", label: "Style section title" },
    { key: "framedTitle", label: "Framed card title" },
    { key: "framedDescription", label: "Framed card description", long: true },
    { key: "canvasTitle", label: "Canvas card title" },
    { key: "canvasDescription", label: "Canvas card description", long: true },
    { key: "previewLabel", label: "Preview button" },
    { key: "sizeHeading", label: "Size section title" },
    { key: "sizeDescription", label: "Size section description" },
    { key: "unavailableLabel", label: "Unavailable style text" },
    { key: "outOfStockLabel", label: "Out of stock size text" },
    { key: "continueLabel", label: "Button" },
    { key: "showTrust", label: "Show trust badges under the button" },
    { key: "showDeliveryEstimate", label: "Show the PIN code delivery check" },
  ],
  step2: [
    { key: "progressName", label: "Progress name" },
    { key: "title", label: "Page title" },
    { key: "description", label: "Description", long: true },
    { key: "showFrameColor", label: "Show frame colour choice (framed only)" },
    { key: "frameHeading", label: "Frame colour title" },
    { key: "blackFrameLabel", label: "Black frame label" },
    { key: "whiteFrameLabel", label: "White frame label" },
    { key: "backgroundHeading", label: "Background section title" },
    { key: "premiumHint", label: "Premium note beside the title", hint: PRICE_HINT },
    { key: "limitedHeading", label: "Limited edition title" },
    { key: "limitedPrice", label: "Limited edition price", hint: PRICE_HINT },
    { key: "optionalLabel", label: "Optional tag" },
    { key: "petNameHeading", label: "Pet name title" },
    { key: "petNameDescription", label: "Pet name description" },
    { key: "petNamePlaceholder", label: "Pet name placeholder" },
    { key: "petNameMax", label: "Pet name max letters" },
    { key: "subtitleHeading", label: "Subtitle title" },
    { key: "subtitleDescription", label: "Subtitle description" },
    { key: "subtitlePlaceholder", label: "Subtitle placeholder" },
    { key: "subtitleMax", label: "Subtitle max letters" },
    { key: "showPriority", label: "Offer Priority Preview" },
    { key: "priorityTitle", label: "Priority Preview title" },
    { key: "priorityPrice", label: "Priority Preview price", hint: PRICE_HINT },
    { key: "priorityDescription", label: "Priority Preview description", long: true },
    { key: "priorityInfo", label: "Priority Preview ⓘ text", hint: "Opens from the info icon. Leave empty to hide the icon.", long: true },
    { key: "continueLabel", label: "Button" },
  ],
  step3: [
    { key: "progressName", label: "Progress name" },
    { key: "title", label: "Page title" },
    { key: "description", label: "Description", long: true },
    { key: "guideTitle", label: "Photo guide title" },
    { key: "guideDescription", label: "Photo guide description" },
    { key: "uploadHeading", label: "Upload section title" },
    { key: "uploadTitle", label: "Upload box title" },
    { key: "uploadHint", label: "Upload box hint" },
    { key: "uploadingLabel", label: "While uploading" },
    { key: "removeLabel", label: "Remove photo button" },
    { key: "detailsHeading", label: "Details section title" },
    { key: "detailsDescription", label: "Details description" },
    { key: "nameLabel", label: "Name label" },
    { key: "namePlaceholder", label: "Name placeholder" },
    { key: "phoneLabel", label: "Mobile label" },
    { key: "phonePlaceholder", label: "Mobile placeholder" },
    { key: "emailLabel", label: "Email label" },
    { key: "emailPlaceholder", label: "Email placeholder" },
    { key: "optionalLabel", label: "Optional tag (email)" },
    { key: "reassurance", label: "Reassurance box", hint: "Leave empty to hide the box.", long: true },
    { key: "addToCartLabel", label: "Button" },
    { key: "showTrust", label: "Show trust badges under the button" },
  ],
  cart: [
    { key: "banner", label: "Top bar" },
    { key: "title", label: "Title" },
    { key: "emptyTitle", label: "Empty cart title" },
    { key: "emptyText", label: "Empty cart text", long: true },
    { key: "emptyButton", label: "Empty cart button" },
    { key: "styleLabel", label: "Portrait style label" },
    { key: "sizeLabel", label: "Size label" },
    { key: "backgroundLabel", label: "Background label" },
    { key: "frameLabel", label: "Frame colour label" },
    { key: "petNameLabel", label: "Pet name label" },
    { key: "subtitleLabel", label: "Subtitle label" },
    { key: "photoLabel", label: "Uploaded photo label" },
    { key: "priorityLabel", label: "Priority Preview label" },
    { key: "notAddedLabel", label: "Shown when a detail is empty" },
    { key: "removeLabel", label: "Remove button" },
    { key: "extrasHeading", label: "Add-ons box title" },
    { key: "optionalLabel", label: "Optional tag" },
    { key: "showGift", label: "Offer gift wrapping" },
    { key: "giftHeading", label: "Gift wrapping box title" },
    { key: "giftTitle", label: "Gift wrapping name" },
    { key: "giftDescription", label: "Gift wrapping description", long: true },
    { key: "couponHeading", label: "Coupon title" },
    { key: "couponPlaceholder", label: "Coupon placeholder" },
    { key: "applyLabel", label: "Apply button" },
    { key: "removeCouponLabel", label: "Remove coupon button" },
    { key: "subtotalLabel", label: "Subtotal line", hint: "{count} and {items} are filled in, e.g. “1 item”." },
    { key: "itemWord", label: "Word for one item" },
    { key: "itemsWord", label: "Word for several items" },
    { key: "discountLabel", label: "Discount line" },
    { key: "totalLabel", label: "Total line" },
    { key: "checkoutLabel", label: "Checkout button" },
  ],
};

const ICON_LABELS: Record<TrustIcon, string> = {
  shield: "Shield",
  truck: "Truck",
  heart: "Heart",
  eye: "Eye",
  brush: "Brush",
  star: "Star",
  refresh: "Revisions",
  gift: "Gift",
  clock: "Clock",
  paw: "Paw",
};

const EXTRA_NAMES: Record<ExtraId, string> = {
  mug: "Mug",
  magnet: "Fridge magnet",
  digital: "Digital download",
  desk: "Desk portrait",
};

function clone(content: EverydayContent): EverydayContent {
  return JSON.parse(JSON.stringify(content)) as EverydayContent;
}

function FlatFields({
  section,
  value,
  onChange,
}: {
  section: FlatSection;
  value: Record<string, string | number | boolean>;
  onChange: (key: string, next: string | number | boolean) => void;
}) {
  const fields = FIELDS[section];
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {fields.map((field) => {
        const current = value[field.key];
        const fallback = (DEFAULT_EVERYDAY_CONTENT[section] as Record<string, string | number | boolean>)[field.key];
        if (typeof current === "boolean") {
          return (
            <label
              key={field.key}
              className="flex items-center gap-3 rounded-xl border border-[#eeeeee] bg-[#fafafa] px-3.5 py-3 text-sm text-[#1a1a1b] md:col-span-2"
            >
              <input
                type="checkbox"
                checked={current}
                onChange={(e) => onChange(field.key, e.target.checked)}
                className="h-4 w-4 accent-[#A97659]"
              />
              {field.label}
            </label>
          );
        }
        if (typeof current === "number") {
          const limit = NUMBER_LIMITS[`${section}.${field.key}`];
          return (
            <Field key={field.key} label={field.label} hint={field.hint || (limit ? `${limit.min}–${limit.max}` : undefined)}>
              <input
                type="number"
                min={limit?.min}
                max={limit?.max}
                step={1}
                value={Number.isFinite(current) ? current : 0}
                onChange={(e) => onChange(field.key, Number(e.target.value))}
                className={inputClass}
              />
            </Field>
          );
        }
        return (
          <div key={field.key} className={field.long ? "md:col-span-2" : undefined}>
            <Field label={field.label} hint={field.hint}>
              {field.long ? (
                <textarea
                  rows={2}
                  value={String(current ?? "")}
                  placeholder={String(fallback ?? "")}
                  onChange={(e) => onChange(field.key, e.target.value)}
                  className={`${inputClass} resize-y`}
                />
              ) : (
                <input
                  type="text"
                  value={String(current ?? "")}
                  placeholder={String(fallback ?? "")}
                  onChange={(e) => onChange(field.key, e.target.value)}
                  className={inputClass}
                />
              )}
            </Field>
          </div>
        );
      })}
    </div>
  );
}

export function ConfiguratorPanel({ initial, onSaved }: { initial: EverydayContentAdmin; onSaved: () => void }) {
  const [draft, setDraft] = useState<EverydayContent>(() => clone(initial.content));
  const [tab, setTab] = useState<Tab>("header");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  function edit(mutator: (next: EverydayContent) => void) {
    setDraft((prev) => {
      const next = clone(prev);
      mutator(next);
      return next;
    });
    setDirty(true);
    setMessage(null);
  }

  async function save() {
    setSaving(true);
    setError(null);
    setMessage(null);
    const result = await updateEverydayContent(draft);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDraft(clone(result.content));
    setDirty(false);
    setMessage("Saved. The shop shows the new text within a minute.");
    onSaved();
  }

  async function reset() {
    if (!window.confirm("Put every configurator text, switch and background back to the original? This cannot be undone.")) return;
    setSaving(true);
    setError(null);
    const result = await restoreEverydayContent();
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDraft(clone(result.content));
    setDirty(false);
    setMessage("Original text restored.");
    onSaved();
  }

  const moveBackground = (index: number, delta: number) =>
    edit((next) => {
      const target = index + delta;
      if (target < 0 || target >= next.backgrounds.length) return;
      const [row] = next.backgrounds.splice(index, 1);
      next.backgrounds.splice(target, 0, row);
    });

  return (
    <Panel
      title="Everyday Pet Portrait configurator"
      note="Every title, description, button and switch on the 3-step order form and cart. Prices come from Pricing; photos come from Media → Everyday configurator."
    >
      {!initial.ready && initial.error ? <p className={`${warnClass} mb-4`}>{initial.error}</p> : null}

      <div className="mb-5 flex flex-wrap gap-1.5">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              tab === item.id ? "bg-[#1a1a1b] text-white" : "border border-[#e5e7eb] bg-white text-[#6b7280] hover:text-[#1a1a1b]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "header" || tab === "step1" || tab === "step2" || tab === "step3" || tab === "cart" ? (
        <FlatFields
          section={tab}
          value={draft[tab] as unknown as Record<string, string | number | boolean>}
          onChange={(key, value) =>
            edit((next) => {
              (next[tab] as unknown as Record<string, string | number | boolean>)[key] = value;
            })
          }
        />
      ) : null}

      {tab === "trust" ? (
        <div className="space-y-3">
          <p className="text-sm text-[#6b7280]">The strip under the buttons on steps 1 and 3. Up to four badges.</p>
          {draft.trust.map((item, index) => (
            <div key={index} className="grid gap-3 rounded-2xl border border-[#eeeeee] bg-[#fafafa] p-3 sm:grid-cols-[160px_1fr_auto]">
              <Field label="Icon">
                <select
                  value={item.icon}
                  onChange={(e) =>
                    edit((next) => {
                      next.trust[index].icon = e.target.value as TrustIcon;
                    })
                  }
                  className={inputClass}
                >
                  {TRUST_ICONS.map((icon) => (
                    <option key={icon} value={icon}>
                      {ICON_LABELS[icon]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Text">
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) =>
                    edit((next) => {
                      next.trust[index].label = e.target.value;
                    })
                  }
                  className={inputClass}
                />
              </Field>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() =>
                    edit((next) => {
                      next.trust.splice(index, 1);
                    })
                  }
                  className={ghostButtonClass}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          {draft.trust.length < 4 ? (
            <button
              type="button"
              onClick={() =>
                edit((next) => {
                  next.trust.push({ icon: "heart", label: "" });
                })
              }
              className={ghostButtonClass}
            >
              Add badge
            </button>
          ) : null}
        </div>
      ) : null}

      {tab === "backgrounds" ? (
        <div className="space-y-3">
          <p className="text-sm text-[#6b7280]">
            Order, names and visibility of the Step 2 tiles. Pearl to Black are standard; bg7–bg9 are Limited Edition and
            charge the premium price from Pricing. Orders keep the id on the left. Tile photos live in Media → Everyday
            configurator.
          </p>
          {draft.backgrounds.map((bg, index) => {
            const limited = /^bg\d+$/.test(bg.id);
            return (
              <div
                key={bg.id}
                className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#eeeeee] bg-[#fafafa] p-3"
              >
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    aria-label="Move up"
                    disabled={index === 0}
                    onClick={() => moveBackground(index, -1)}
                    className="rounded-md border border-[#e5e7eb] bg-white p-1 disabled:opacity-30"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    aria-label="Move down"
                    disabled={index === draft.backgrounds.length - 1}
                    onClick={() => moveBackground(index, 1)}
                    className="rounded-md border border-[#e5e7eb] bg-white p-1 disabled:opacity-30"
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>
                <div className="w-28">
                  <p className="text-xs font-semibold text-[#1a1a1b]">{bg.id}</p>
                  <p className="text-[11px] text-[#9ca3af]">{limited ? "Limited edition" : "Standard"}</p>
                </div>
                <div className="min-w-[180px] flex-1">
                  <input
                    type="text"
                    value={bg.label}
                    aria-label={`${bg.id} name`}
                    onChange={(e) =>
                      edit((next) => {
                        next.backgrounds[index].label = e.target.value;
                      })
                    }
                    className={inputClass}
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-[#1a1a1b]">
                  <input
                    type="checkbox"
                    checked={bg.visible}
                    onChange={(e) =>
                      edit((next) => {
                        next.backgrounds[index].visible = e.target.checked;
                      })
                    }
                    className="h-4 w-4 accent-[#A97659]"
                  />
                  Show
                </label>
              </div>
            );
          })}
        </div>
      ) : null}

      {tab === "extras" ? (
        <div className="space-y-3">
          <p className="text-sm text-[#6b7280]">Names and descriptions in the cart. Prices and crossed-out prices are set in Pricing.</p>
          {EXTRA_IDS.map((id) => (
            <div key={id} className="space-y-3 rounded-2xl border border-[#eeeeee] bg-[#fafafa] p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[#1a1a1b]">{EXTRA_NAMES[id]}</p>
                <label className="flex items-center gap-2 text-sm text-[#1a1a1b]">
                  <input
                    type="checkbox"
                    checked={draft.extras[id].visible}
                    onChange={(e) =>
                      edit((next) => {
                        next.extras[id].visible = e.target.checked;
                      })
                    }
                    className="h-4 w-4 accent-[#A97659]"
                  />
                  Offer in cart
                </label>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Name">
                  <input
                    type="text"
                    value={draft.extras[id].label}
                    onChange={(e) =>
                      edit((next) => {
                        next.extras[id].label = e.target.value;
                      })
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Description">
                  <input
                    type="text"
                    value={draft.extras[id].description}
                    onChange={(e) =>
                      edit((next) => {
                        next.extras[id].description = e.target.value;
                      })
                    }
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="sticky bottom-0 -mx-5 mt-6 flex flex-wrap items-center gap-3 border-t border-[#eeeeee] bg-white px-5 pb-1 pt-4">
        <button type="button" onClick={save} disabled={saving || !dirty || !initial.ready} className={buttonClass}>
          {saving ? "Saving…" : "Save changes"}
        </button>
        <button type="button" onClick={reset} disabled={saving || !initial.ready} className={ghostButtonClass}>
          Restore original text
        </button>
        <a
          href="/portraits/everyday-pet-portrait"
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium text-primary"
        >
          Open the page
        </a>
        {dirty ? <span className="text-xs text-[#8a5a00]">Unsaved changes</span> : null}
      </div>
      {message ? <p className={`${okClass} mt-3`}>{message}</p> : null}
      {error ? <p className={`${errorClass} mt-3`}>{error}</p> : null}
    </Panel>
  );
}
