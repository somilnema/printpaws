"use client";

import { useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { restoreLandingContent, updateLandingContent, type LandingContentAdmin } from "@/app/actions/landingContentActions";
import {
  BENEFIT_ICONS,
  DEFAULT_LANDING_CONTENT,
  LANDING_LIMITS,
  LANDING_NUMBER_LIMITS,
  builtInReviews,
  slotUrl,
  type BenefitIcon,
  type LandingContent,
} from "@/lib/landing-content";
import { MEDIA_SLOTS, mediaSlot, type MediaSlot } from "@/lib/site-media-catalog";
import { buttonClass, errorClass, Field, ghostButtonClass, inputClass, okClass, Panel, warnClass } from "@/components/admin/ui";

type Tab = "announcements" | "hero" | "portraits" | "video" | "reviews" | "final" | "home" | "seo";

const TABS: { id: Tab; label: string }[] = [
  { id: "announcements", label: "Announcement bar" },
  { id: "hero", label: "Hero" },
  { id: "portraits", label: "Portrait cards" },
  { id: "video", label: "Videos" },
  { id: "reviews", label: "Reviews" },
  { id: "final", label: "Closing section" },
  { id: "home", label: "Home page" },
  { id: "seo", label: "Search & sharing" },
];

type FlatSection = "seo" | "hero" | "portraits" | "video" | "reviews" | "finalCta" | "home";
type FieldDef = { key: string; label: string; hint?: string; long?: boolean };
type Flat = Record<string, string | number | boolean>;

const EMPTY_HIDES = "Leave empty to hide it.";

const FIELDS: Record<FlatSection, FieldDef[]> = {
  hero: [
    { key: "headline", label: "Headline, first line" },
    { key: "headlineAccent", label: "Headline, second line" },
    { key: "text", label: "Text under the headline", hint: EMPTY_HIDES, long: true },
    { key: "imageAlt", label: "Photo description", hint: "Read out by screen readers. Describe the hero photo." },
    { key: "cta", label: "Button" },
  ],
  portraits: [
    { key: "title", label: "Section title" },
    { key: "text", label: "Text under the title", hint: EMPTY_HIDES },
    { key: "fromLabel", label: "Price on a card", hint: "{price} is the cheapest price on sale in Pricing." },
    { key: "comingSoonLabel", label: "Card that is not on sale yet" },
  ],
  video: [
    { key: "show", label: "Show the video section" },
    { key: "title", label: "Section title" },
    { key: "text", label: "Text under the title", hint: EMPTY_HIDES },
  ],
  reviews: [
    { key: "show", label: "Show the reviews section" },
    { key: "title", label: "Section title" },
    { key: "text", label: "Text under the title", hint: EMPTY_HIDES },
    { key: "verifiedLabel", label: "Verified tag", hint: `Shown on reviews marked verified. ${EMPTY_HIDES}` },
  ],
  finalCta: [
    { key: "show", label: "Show the closing section" },
    { key: "headline", label: "Headline" },
    { key: "text", label: "Text", hint: EMPTY_HIDES, long: true },
    { key: "cta", label: "Button" },
  ],
  home: [
    { key: "breadcrumbHome", label: "Breadcrumb, first part (computers)" },
    { key: "breadcrumbProduct", label: "Breadcrumb, page name (computers)" },
    { key: "subtitle", label: "Line under the headline (phones)", hint: EMPTY_HIDES },
    { key: "showRating", label: "Show the star rating row (phones)" },
    { key: "rating", label: "Stars shown" },
    { key: "ratingLabel", label: "Name beside the stars", hint: "Leave empty to show only the stars." },
  ],
  seo: [
    { key: "title", label: "Browser tab title" },
    { key: "description", label: "Search result description", long: true },
  ],
};

const ICON_LABELS: Record<BenefitIcon, string> = {
  preview: "Photo preview",
  revisions: "Revisions",
  shipping: "Truck",
  heart: "Heart",
  gift: "Gift",
  star: "Star",
  shield: "Shield",
  clock: "Clock",
  brush: "Brush",
  paw: "Paw",
};

/** Photos a review card can use. */
const REVIEW_PHOTO_GROUPS = ["Reviews", "Landing page", "Product gallery"];

const VIDEO_SLOTS = MEDIA_SLOTS.filter((slot) => slot.kind === "video");
const REVIEW_PHOTO_SLOTS = MEDIA_SLOTS.filter((slot) => slot.kind === "image" && REVIEW_PHOTO_GROUPS.includes(slot.group));

function clone(content: LandingContent): LandingContent {
  return JSON.parse(JSON.stringify(content)) as LandingContent;
}

function move<T>(items: T[], index: number, delta: number) {
  const target = index + delta;
  if (target < 0 || target >= items.length) return;
  const [row] = items.splice(index, 1);
  items.splice(target, 0, row);
}

/** "Media → Reviews → Zoya’s review": where the admin replaces that slot's file. */
function slotPath(id: string) {
  const slot = mediaSlot(id);
  return slot ? `Media → ${slot.group} → ${slot.label}` : "";
}

function previewSrc(url: string) {
  return /^https?:\/\//i.test(url) ? url : encodeURI(url);
}

function SlotOptions({ slots, current }: { slots: MediaSlot[]; current: string }) {
  const groups = [...new Set(slots.map((slot) => slot.group))];
  return (
    <>
      {current && !slots.some((slot) => slot.id === current) ? <option value={current}>{current}</option> : null}
      {groups.map((group) => (
        <optgroup key={group} label={group}>
          {slots
            .filter((slot) => slot.group === group)
            .map((slot) => (
              <option key={slot.id} value={slot.id}>
                {slot.label}
              </option>
            ))}
        </optgroup>
      ))}
    </>
  );
}

function FlatFields({
  section,
  value,
  onChange,
}: {
  section: FlatSection;
  value: Flat;
  onChange: (key: string, next: string | number | boolean) => void;
}) {
  const defaults = DEFAULT_LANDING_CONTENT[section] as unknown as Flat;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {FIELDS[section].map((field) => {
        const current = value[field.key];
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
          const limit = LANDING_NUMBER_LIMITS[`${section}.${field.key}`];
          return (
            <Field key={field.key} label={field.label} hint={field.hint || (limit ? `${limit.min} to ${limit.max}, in steps of ${limit.step}` : undefined)}>
              <input
                type="number"
                min={limit?.min}
                max={limit?.max}
                step={limit?.step ?? 1}
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
                  placeholder={String(defaults[field.key] ?? "")}
                  onChange={(e) => onChange(field.key, e.target.value)}
                  className={`${inputClass} resize-y`}
                />
              ) : (
                <input
                  type="text"
                  value={String(current ?? "")}
                  placeholder={String(defaults[field.key] ?? "")}
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

/** One row of an editable list: its fields, then move and remove buttons. */
function ListRow({
  children,
  index,
  count,
  onMove,
  onRemove,
  columns,
}: {
  children: ReactNode;
  index: number;
  count: number;
  onMove: (delta: number) => void;
  onRemove: () => void;
  columns: string;
}) {
  return (
    <div className={`grid gap-3 rounded-2xl border border-[#eeeeee] bg-[#fafafa] p-3 ${columns}`}>
      {children}
      <div className="flex items-end gap-1.5">
        <button type="button" aria-label="Move up" disabled={index === 0} onClick={() => onMove(-1)} className={`${ghostButtonClass} px-2.5`}>
          <ArrowUp size={14} />
        </button>
        <button
          type="button"
          aria-label="Move down"
          disabled={index === count - 1}
          onClick={() => onMove(1)}
          className={`${ghostButtonClass} px-2.5`}
        >
          <ArrowDown size={14} />
        </button>
        <button type="button" onClick={onRemove} className={ghostButtonClass}>
          Remove
        </button>
      </div>
    </div>
  );
}

function Note({ children }: { children: ReactNode }) {
  return <p className="text-sm text-[#6b7280]">{children}</p>;
}

type ListKey = "announcements" | "benefits" | "clips" | "reviewItems";

export function LandingContentPanel({
  initial,
  media,
  onSaved,
}: {
  initial: LandingContentAdmin;
  /** Admin uploads by slot id, for the review photo previews. */
  media: Record<string, string>;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<LandingContent>(() => clone(initial.content));
  const [tab, setTab] = useState<Tab>("announcements");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(initial.updatedAt);

  function edit(mutator: (next: LandingContent) => void) {
    setDraft((prev) => {
      const next = clone(prev);
      mutator(next);
      return next;
    });
    setDirty(true);
    setMessage(null);
  }

  function editFlat(section: FlatSection) {
    return (key: string, value: string | number | boolean) =>
      edit((next) => {
        (next[section] as unknown as Flat)[key] = value;
      });
  }

  function setItem<K extends ListKey>(key: K, index: number, patch: Partial<LandingContent[K][number]>) {
    edit((next) => {
      Object.assign(next[key][index], patch);
    });
  }

  function addItem<K extends ListKey>(key: K, item: LandingContent[K][number]) {
    edit((next) => {
      (next[key] as LandingContent[K][number][]).push(item);
    });
  }

  /** Move and remove buttons for row `index` of a list. */
  function rowProps(key: ListKey | "homeAnnouncements", index: number) {
    return {
      index,
      count: draft[key].length,
      onMove: (delta: number) =>
        edit((next) => {
          move(next[key] as unknown[], index, delta);
        }),
      onRemove: () =>
        edit((next) => {
          (next[key] as unknown[]).splice(index, 1);
        }),
    };
  }

  async function save() {
    setSaving(true);
    setError(null);
    setMessage(null);
    const result = await updateLandingContent(draft);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDraft(clone(result.content));
    setDirty(false);
    setUpdatedAt(result.updatedAt);
    setMessage("Saved. The landing page and home page show the new text within a minute.");
    onSaved();
  }

  async function reset() {
    if (!window.confirm("Put every landing and home page text, list and switch back to the original? This cannot be undone.")) return;
    setSaving(true);
    setError(null);
    const result = await restoreLandingContent();
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDraft(clone(result.content));
    setDirty(false);
    setUpdatedAt(null);
    setMessage("Original text restored.");
    onSaved();
  }

  return (
    <Panel
      title="Landing & home page text"
      note="Every title, description, button, list and on/off switch on /landing, plus the home page announcement bar, breadcrumb and rating row. Prices come from Pricing; photos from the Photos tab and Media."
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

      {tab === "announcements" ? (
        <div className="space-y-3">
          <Note>
            The bar at the top of /landing, one message at a time. A message with a coupon code shows only while that coupon is live in
            Coupons. Remove every message to hide the bar.
          </Note>
          {draft.announcements.map((item, index) => (
            <ListRow key={index} columns="sm:grid-cols-[1fr_180px_auto]" {...rowProps("announcements", index)}>
              <Field label="Message">
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) => setItem("announcements", index, { text: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Only while this coupon is live">
                <input
                  type="text"
                  value={item.couponCode}
                  placeholder="Always shown"
                  onChange={(e) => setItem("announcements", index, { couponCode: e.target.value.toUpperCase() })}
                  className={inputClass}
                />
              </Field>
            </ListRow>
          ))}
          {draft.announcements.length < LANDING_LIMITS.announcements ? (
            <button type="button" onClick={() => addItem("announcements", { text: "", couponCode: "" })} className={ghostButtonClass}>
              Add message
            </button>
          ) : null}
        </div>
      ) : null}

      {tab === "hero" ? (
        <div className="space-y-5">
          <Note>
            Photo and video: Photos tab → Landing page → Hero photo / Hero video. Until a hero photo is uploaded, the hero shows the photo
            from Media → Feature stories → Not just a gift.
          </Note>
          <FlatFields section="hero" value={draft.hero as unknown as Flat} onChange={editFlat("hero")} />
          <div className="space-y-3">
            <p className="text-sm font-semibold text-[#1a1a1b]">
              Benefits under the hero <span className="font-normal text-[#6b7280]">· up to {LANDING_LIMITS.benefits}</span>
            </p>
            {draft.benefits.map((item, index) => (
              <ListRow key={index} columns="sm:grid-cols-[170px_1fr_auto]" {...rowProps("benefits", index)}>
                <Field label="Icon">
                  <select
                    value={item.icon}
                    onChange={(e) => setItem("benefits", index, { icon: e.target.value as BenefitIcon })}
                    className={inputClass}
                  >
                    {BENEFIT_ICONS.map((icon) => (
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
                    onChange={(e) => setItem("benefits", index, { label: e.target.value })}
                    className={inputClass}
                  />
                </Field>
              </ListRow>
            ))}
            {draft.benefits.length < LANDING_LIMITS.benefits ? (
              <button type="button" onClick={() => addItem("benefits", { icon: "heart", label: "" })} className={ghostButtonClass}>
                Add benefit
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {tab === "portraits" ? (
        <div className="space-y-4">
          <Note>
            Card names, descriptions, photos, links, order and visibility are in the Products tab. The price on each card is worked out from
            Pricing (cheapest style and size on sale, plus the card&apos;s pet option).
          </Note>
          <FlatFields section="portraits" value={draft.portraits as unknown as Flat} onChange={editFlat("portraits")} />
        </div>
      ) : null}

      {tab === "video" ? (
        <div className="space-y-5">
          <Note>
            Upload or replace the videos in Admin → Media → Unboxing videos (the home page uses them too). Each caption should describe its
            video.
          </Note>
          <FlatFields section="video" value={draft.video as unknown as Flat} onChange={editFlat("video")} />
          <div className="space-y-3">
            <p className="text-sm font-semibold text-[#1a1a1b]">
              Videos, in order <span className="font-normal text-[#6b7280]">· up to {LANDING_LIMITS.clips}</span>
            </p>
            {draft.clips.map((clip, index) => (
              <ListRow key={index} columns="sm:grid-cols-[1fr_1fr_auto]" {...rowProps("clips", index)}>
                <Field label="Video (Media slot)" hint={slotPath(clip.slot)}>
                  <select value={clip.slot} onChange={(e) => setItem("clips", index, { slot: e.target.value })} className={inputClass}>
                    <SlotOptions slots={VIDEO_SLOTS} current={clip.slot} />
                  </select>
                </Field>
                <Field label="Caption">
                  <input
                    type="text"
                    value={clip.caption}
                    onChange={(e) => setItem("clips", index, { caption: e.target.value })}
                    className={inputClass}
                  />
                </Field>
              </ListRow>
            ))}
            {draft.clips.length < LANDING_LIMITS.clips ? (
              <button type="button" onClick={() => addItem("clips", { slot: VIDEO_SLOTS[0]?.id || "", caption: "" })} className={ghostButtonClass}>
                Add video
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {tab === "reviews" ? (
        <div className="space-y-5">
          <Note>
            Each review uses a photo from Media; replace it there (Admin → Media → Reviews, which the home page uses too). The list starts as
            the shop&apos;s own reviews; changes here only affect /landing.
          </Note>
          <FlatFields section="reviews" value={draft.reviews as unknown as Flat} onChange={editFlat("reviews")} />
          <div className="space-y-3">
            <p className="text-sm font-semibold text-[#1a1a1b]">
              Reviews, in order <span className="font-normal text-[#6b7280]">· up to {LANDING_LIMITS.reviews}</span>
            </p>
            {draft.reviewItems.map((review, index) => {
              const photo = review.photo ? slotUrl(review.photo, media) : "";
              return (
                <ListRow key={index} columns="md:grid-cols-[64px_1fr_auto]" {...rowProps("reviewItems", index)}>
                  <div className="h-20 w-16 overflow-hidden rounded-xl bg-white">
                    {photo ? <img src={previewSrc(photo)} alt="" className="h-full w-full object-cover" /> : null}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Name">
                      <input
                        type="text"
                        value={review.name}
                        onChange={(e) => setItem("reviewItems", index, { name: e.target.value })}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Photo (Media slot)" hint={slotPath(review.photo)}>
                      <select
                        value={review.photo}
                        onChange={(e) => setItem("reviewItems", index, { photo: e.target.value })}
                        className={inputClass}
                      >
                        <option value="">No photo</option>
                        <SlotOptions slots={REVIEW_PHOTO_SLOTS} current={review.photo} />
                      </select>
                    </Field>
                    <Field label="Stars">
                      <select
                        value={review.rating}
                        onChange={(e) => setItem("reviewItems", index, { rating: Number(e.target.value) })}
                        className={inputClass}
                      >
                        {[5, 4, 3, 2, 1].map((stars) => (
                          <option key={stars} value={stars}>
                            {stars} {stars === 1 ? "star" : "stars"}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <label className="flex items-center gap-2 self-end pb-2.5 text-sm text-[#1a1a1b]">
                      <input
                        type="checkbox"
                        checked={review.verified}
                        onChange={(e) => setItem("reviewItems", index, { verified: e.target.checked })}
                        className="h-4 w-4 accent-[#A97659]"
                      />
                      Verified purchase
                    </label>
                    <div className="sm:col-span-2">
                      <Field label="Review">
                        <textarea
                          rows={3}
                          value={review.text}
                          onChange={(e) => setItem("reviewItems", index, { text: e.target.value })}
                          className={`${inputClass} resize-y`}
                        />
                      </Field>
                    </div>
                  </div>
                </ListRow>
              );
            })}
            <div className="flex flex-wrap gap-2">
              {draft.reviewItems.length < LANDING_LIMITS.reviews ? (
                <button
                  type="button"
                  onClick={() => addItem("reviewItems", { name: "", text: "", rating: 5, verified: false, photo: "" })}
                  className={ghostButtonClass}
                >
                  Add review
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  if (!window.confirm("Replace this list with the shop's own reviews?")) return;
                  edit((next) => {
                    next.reviewItems = builtInReviews();
                  });
                }}
                className={ghostButtonClass}
              >
                Use the shop&apos;s reviews
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {tab === "final" ? (
        <div className="space-y-4">
          <Note>Photo: Photos tab → Landing page → Closing photo. The button scrolls up to the portrait cards.</Note>
          <FlatFields section="finalCta" value={draft.finalCta as unknown as Flat} onChange={editFlat("finalCta")} />
        </div>
      ) : null}

      {tab === "home" ? (
        <div className="space-y-5">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-[#1a1a1b]">
              Home page announcement bar <span className="font-normal text-[#6b7280]">· up to {LANDING_LIMITS.homeAnnouncements} messages</span>
            </p>
            <Note>
              {"{percent}"} is the prepaid discount from Pricing; a message with it hides while that discount is 0. Remove every message to
              hide the bar. Product pages still use the original messages.
            </Note>
            {draft.homeAnnouncements.map((text, index) => (
              <ListRow key={index} columns="sm:grid-cols-[1fr_auto]" {...rowProps("homeAnnouncements", index)}>
                <Field label="Message">
                  <input
                    type="text"
                    value={text}
                    onChange={(e) =>
                      edit((next) => {
                        next.homeAnnouncements[index] = e.target.value;
                      })
                    }
                    className={inputClass}
                  />
                </Field>
              </ListRow>
            ))}
            {draft.homeAnnouncements.length < LANDING_LIMITS.homeAnnouncements ? (
              <button
                type="button"
                onClick={() =>
                  edit((next) => {
                    next.homeAnnouncements.push("");
                  })
                }
                className={ghostButtonClass}
              >
                Add message
              </button>
            ) : null}
          </div>
          <FlatFields section="home" value={draft.home as unknown as Flat} onChange={editFlat("home")} />
          <Note>
            The rest of the home page is edited elsewhere: its photos and videos in Media; the order form and section text are not editable
            from the admin yet.
          </Note>
        </div>
      ) : null}

      {tab === "seo" ? (
        <div className="space-y-4">
          <Note>What /landing shows in the browser tab and in search results (the page is hidden from search until launch).</Note>
          <FlatFields section="seo" value={draft.seo as unknown as Flat} onChange={editFlat("seo")} />
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-[#f3f4f6] pt-4">
        <button type="button" onClick={save} disabled={saving || !dirty} className={buttonClass}>
          {saving ? "Saving…" : "Save changes"}
        </button>
        <button type="button" onClick={reset} disabled={saving} className={ghostButtonClass}>
          Restore original text
        </button>
        {dirty ? <span className="text-xs text-[#8a5a00]">Unsaved changes</span> : null}
        {updatedAt && !dirty ? <span className="text-xs text-[#9ca3af]">Last saved {new Date(updatedAt).toLocaleString("en-IN")}</span> : null}
      </div>
      {error ? <p className={`${errorClass} mt-4`}>{error}</p> : null}
      {message ? <p className={`${okClass} mt-4`}>{message}</p> : null}
    </Panel>
  );
}
