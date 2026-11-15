"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { restoreEverydayContent, updateEverydayContent, type EverydayContentAdmin } from "@/app/actions/contentActions";
import {
  CONFIGURATOR_MEDIA,
  CONFIGURATOR_NAMES,
  CONFIGURATOR_SLUGS,
  defaultContent,
  EXTRA_IDS,
  NUMBER_LIMITS,
  SIZE_RULE_KEYS,
  sizeRuleKey,
  TRUST_ICONS,
  type ConfiguratorProduct,
  type EverydayContent,
  type ExtraId,
  type ReviewCopy,
  type TrustIcon,
  type TrustItem,
} from "@/lib/everyday-content";
import { displaySizeLabel } from "@/lib/pricing";
import { buttonClass, errorClass, Field, ghostButtonClass, inputClass, okClass, Panel, warnClass } from "@/components/admin/ui";

type FlatSection = "header" | "gallery" | "step1" | "step2" | "step3" | "cart" | "below";

/** Lists a "starting choice" field picks from. */
type SelectSource = "style" | "framedSize" | "canvasSize" | "frame" | "background";

type FieldDef = {
  key: string;
  label: string;
  hint?: string;
  long?: boolean;
  /** Only shown for this product (Multi-Pet / You & Your Pet options). */
  only?: ConfiguratorProduct;
  /** Hidden for these products: their page never shows it. */
  skip?: ConfiguratorProduct[];
  /** Small title above this field, starting a group of fields. */
  heading?: string;
  /** Hex colour picker. */
  color?: boolean;
  select?: SelectSource;
};

type Tab =
  | "header"
  | "gallery"
  | "step1"
  | "step2"
  | "step3"
  | "flow"
  | "sizes"
  | "trust"
  | "backgrounds"
  | "frames"
  | "guide"
  | "cart"
  | "extras"
  | "below"
  | "accordions"
  | "sections"
  | "reviews";

const TABS: { id: Tab; label: string; products?: ConfiguratorProduct[] }[] = [
  { id: "header", label: "Header" },
  { id: "gallery", label: "Gallery" },
  { id: "step1", label: "Step 1 · Portrait" },
  { id: "step2", label: "Step 2 · Personalize" },
  { id: "step3", label: "Step 3 · Upload" },
  { id: "flow", label: "Product options", products: ["multi_pet", "you_and_your_pet"] },
  { id: "sizes", label: "Size rules", products: ["multi_pet", "you_and_your_pet"] },
  { id: "trust", label: "Trust badges" },
  { id: "backgrounds", label: "Backgrounds" },
  { id: "frames", label: "Frames" },
  { id: "guide", label: "Photo guide" },
  { id: "cart", label: "Cart" },
  { id: "extras", label: "Add-on products" },
  { id: "below", label: "Testimonial & banner" },
  { id: "accordions", label: "Details below" },
  { id: "sections", label: "Page sections" },
  { id: "reviews", label: "Reviews" },
];

const SIZE_RULE_LABELS: Record<string, string> = { two: "2 pets", three: "3 pets", four: "4 pets" };

const MP: ConfiguratorProduct = "multi_pet";
const YP: ConfiguratorProduct = "you_and_your_pet";
/** Multi-Pet and You & Your Pet replace some Everyday parts (upload boxes, cart details): those fields are hidden there. */
const FLOWS: ConfiguratorProduct[] = [MP, YP];

/** Multi-Pet / You & Your Pet switches and copy. Launch switches first: unapproved options stay off. */
const FLOW_FIELDS: FieldDef[] = [
  { key: "showLimited", label: "Offer Limited Edition backgrounds (turn on only once the designs and surcharge are approved)" },
  { key: "groupEnabled", label: "Offer the one-photo method" },
  { key: "separateEnabled", label: "Offer the separate-photos method" },
  { key: "mixedEnabled", label: "Offer Mixed Photos (turn on only once production confirms the workflow)" },
  { key: "showTribute", label: "Offer A Special Tribute (halo above one pet)", only: MP },
  { key: "showInstructions", label: "Show the artist instructions box" },
  { key: "choiceHeading", label: "Step 1 choice title" },
  { key: "choiceDescription", label: "Step 1 choice description" },
  { key: "includedLabel", label: "Included label" },
  { key: "upgradeLabel", label: "Upgrade price label", hint: "{price} is replaced with the price from Pricing." },
  { key: "petsWord", label: "Word under the pet number", only: MP },
  { key: "soloTitle", label: "First card title", only: YP },
  { key: "soloDescription", label: "First card description", only: YP },
  { key: "familyTitle", label: "Family card title", only: YP },
  { key: "familyDescription", label: "Family card description", only: YP },
  { key: "soloPersonLabel", label: "Me & My Pet: person name label", only: YP },
  { key: "soloPersonPlaceholder", label: "Me & My Pet: person name placeholder", only: YP },
  { key: "soloPetLabel", label: "Me & My Pet: pet name label", only: YP },
  { key: "soloPetPlaceholder", label: "Me & My Pet: pet name placeholder", only: YP },
  { key: "familyNamesLabel", label: "Family: names label", only: YP },
  { key: "familyNamesPlaceholder", label: "Family: names placeholder", only: YP },
  { key: "familyNamesMax", label: "Family: names max letters", only: YP },
  { key: "tributeHeading", label: "Tribute title", only: MP },
  { key: "tributeDescription", label: "Tribute question", only: MP },
  { key: "tributePriceLabel", label: "Tribute price label", hint: "Shown only when Pricing sets a halo price. {price} is filled in.", only: MP },
  { key: "tributeChooseLabel", label: "Tribute pet choice title", only: MP },
  { key: "tributeError", label: "Tribute: no pet chosen", only: MP },
  { key: "tributeNoteLabel", label: "Tribute: how to recognise the pet", hint: "Asked when that pet has no name on the order. {pet} is e.g. Pet 2.", only: MP },
  { key: "tributeNotePlaceholder", label: "Tribute: recognise placeholder", only: MP },
  { key: "tributeNoteError", label: "Tribute: recognise missing", only: MP },
  { key: "methodHeading", label: "Photo method title" },
  { key: "groupTitle", label: "One-photo method name" },
  { key: "groupDescription", label: "One-photo method description" },
  { key: "separateTitle", label: "Separate-photos method name" },
  { key: "separateDescription", label: "Separate-photos method description" },
  { key: "mixedTitle", label: "Mixed method name" },
  { key: "mixedDescription", label: "Mixed method description" },
  { key: "groupUploadLabel", label: "Group photo box title" },
  { key: "requiredLabel", label: "Required tag" },
  { key: "petSlotLabel", label: "Pet box title", hint: "{n} is the pet number.", only: MP },
  { key: "youSlotLabel", label: "Me & My Pet: person box title", only: YP },
  { key: "yourPetSlotLabel", label: "Me & My Pet: pet box title", only: YP },
  { key: "familyPetSlotLabel", label: "Family: pet box title", only: YP },
  { key: "personSlotLabel", label: "Family: person box title", hint: "{n} is the person number.", only: YP },
  { key: "familyMaxPeople", label: "Family: person photo boxes (first is required)", only: YP },
  { key: "replaceLabel", label: "Replace photo button" },
  { key: "confirmGroupLabel", label: "Group photo confirmation", hint: "Leave empty to drop the checkbox.", only: MP },
  { key: "confirmGroupError", label: "Group photo confirmation missing", only: MP },
  { key: "referencesHeading", label: "Reference photos title" },
  { key: "referencesDescription", label: "Reference photos description", long: true },
  { key: "referencesMax", label: "Reference photos allowed" },
  { key: "referenceAddLabel", label: "Add reference button" },
  { key: "referenceForLabel", label: "Reference: which pet label", only: MP },
  { key: "referenceAnyone", label: "Reference: empty choice", only: MP },
  { key: "referencePetError", label: "Reference: no pet chosen", only: MP },
  { key: "petRemoveConfirm", label: "Fewer pets: confirmation", long: true, only: MP },
  { key: "slotError", label: "Missing photo message", hint: "{slot} is the box title." },
  { key: "uploadsPendingLabel", label: "Photos still uploading" },
  {
    key: "sizeHiddenError",
    label: "Size not offered (Step 1 pop-up)",
    hint: "Shown when a size switched off in Size rules is still chosen. {size} and {count} (pets) are filled in.",
    long: true,
  },
  { key: "instructionsHeading", label: "Artist instructions title" },
  { key: "instructionsPlaceholder", label: "Artist instructions placeholder" },
  { key: "instructionsMax", label: "Artist instructions max letters" },
  { key: "instructionsHint", label: "Artist instructions note", hint: "Shown under the box. Leave empty to hide it." },
  { key: "choiceCartLabel", label: "Cart: choice label" },
  { key: "namesCartLabel", label: "Cart: names label" },
  { key: "haloCartLabel", label: "Cart: halo label", only: MP },
  { key: "methodCartLabel", label: "Cart: photo method label" },
  { key: "photosCartLabel", label: "Cart: photos label" },
  { key: "referencesCartValue", label: "Cart: reference count", hint: "{count} is filled in." },
  { key: "instructionsCartLabel", label: "Cart: artist note label" },
];

const PRICE_HINT = "{price} is replaced with the price from Pricing.";

const FIELDS: Record<FlatSection, FieldDef[]> = {
  header: [
    { key: "productName", label: "Product name (top right, and cart title)" },
    { key: "pageSubtitle", label: "Line under the page title on phones", hint: "Leave empty to hide it." },
    { key: "reviewsLabel", label: "Reviews count beside the stars (desktop)", hint: "Leave empty to hide the stars." },
    { key: "priceFormat", label: "Price format", hint: "{price} is the live price from Pricing, e.g. Rs. {price}.00" },
    { key: "backLabel", label: "Back link" },
    { key: "stepLabel", label: "Step line", hint: "{step}, {total} and {name} are filled in. {name} is each step's progress name." },
    { key: "completeLabel", label: "Progress percent", hint: "{percent} is filled in." },
    { key: "discountPercent", label: "Discount shown (%)", hint: "Sets the crossed-out price and the badge. 0 hides both." },
    { key: "discountBadge", label: "Discount badge", hint: "{percent} is filled in. Leave empty to hide the badge." },
    { key: "homeLabel", label: "Breadcrumb home link (desktop)" },
    { key: "pageBackground", label: "Page background colour", color: true },
    {
      key: "noticeTitle",
      label: "Problem pop-up title",
      hint: "Pop-up for a choice that can't go on (e.g. a size not offered) or a payment that can't start.",
      heading: "Pop-up",
    },
    { key: "noticeButton", label: "Problem pop-up button" },
  ],
  gallery: [
    { key: "photoCount", label: "Gallery photos shown", hint: "1–10, in order. The photos themselves are in the Photos tab → Gallery." },
    { key: "showVideo", label: "Show the “How the art is made” video after photo 1 (when a video is uploaded)" },
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
    { key: "defaultStyle", label: "Style chosen when the page opens", select: "style", heading: "Starting choices" },
    {
      key: "defaultFramedSize",
      label: "Framed size chosen at the start",
      select: "framedSize",
      hint: "If it is out of stock or not offered, the first size on sale is chosen.",
    },
    { key: "defaultCanvasSize", label: "Canvas size chosen at the start", select: "canvasSize" },
    { key: "showDeliveryEstimate", label: "Show the PIN code delivery check", heading: "Delivery check" },
    { key: "deliveryTitle", label: "Delivery check title" },
    { key: "deliverySubtitle", label: "Delivery check line" },
    { key: "deliveryPlaceholder", label: "PIN code placeholder" },
    { key: "deliveryInvalid", label: "PIN code not valid" },
    { key: "deliveryResult", label: "Result", hint: "{min} and {max} are the days below." },
    { key: "deliveryRange", label: "Result dates", hint: "{from} and {to} are dates; {pin} is the code typed." },
    { key: "deliveryMinDays", label: "Fastest delivery (days)" },
    { key: "deliveryMaxDays", label: "Slowest delivery (days)" },
    {
      key: "previewTitle",
      label: "Pop-up title",
      heading: "Preview pop-up (used while no infographic is uploaded in Photos → Step 1)",
    },
    { key: "previewFramedTitle", label: "Framed name" },
    { key: "previewFramedTagline", label: "Framed line" },
    { key: "previewCanvasTitle", label: "Canvas name" },
    { key: "previewCanvasTagline", label: "Canvas line" },
    { key: "previewUnavailable", label: "Style unavailable note", hint: "Also shown under an infographic while framed is off sale." },
  ],
  step2: [
    { key: "progressName", label: "Progress name" },
    { key: "title", label: "Page title" },
    { key: "description", label: "Description", long: true },
    { key: "showFrameColor", label: "Show frame colour choice (framed only)" },
    { key: "frameHeading", label: "Frame colour title" },
    { key: "defaultFrame", label: "Frame colour chosen at the start", select: "frame", hint: "A hidden colour falls back to the first one on show." },
    { key: "backgroundHeading", label: "Background section title" },
    {
      key: "defaultBackground",
      label: "Background chosen at the start",
      select: "background",
      hint: "A hidden background falls back to the first one on show.",
    },
    { key: "premiumHint", label: "Premium note beside the title", hint: PRICE_HINT },
    { key: "limitedHeading", label: "Limited edition title" },
    { key: "limitedPrice", label: "Limited edition price", hint: PRICE_HINT },
    { key: "optionalLabel", label: "Optional tag" },
    { key: "petNameHeading", label: "Pet name title" },
    { key: "petNameDescription", label: "Pet name description" },
    { key: "petNamePlaceholder", label: "Pet name placeholder", hint: "Multi-Pet: {n} is the pet number.", skip: [YP] },
    { key: "petNameMax", label: "Pet name max letters" },
    { key: "petNameDefaultOn", label: "Name switch starts on" },
    { key: "subtitleHeading", label: "Subtitle title" },
    { key: "subtitleDescription", label: "Subtitle description" },
    { key: "subtitlePlaceholder", label: "Subtitle placeholder" },
    { key: "subtitleMax", label: "Subtitle max letters" },
    { key: "subtitleDefaultOn", label: "Subtitle switch starts on" },
    { key: "showPriority", label: "Offer Priority Preview (only once its price and turnaround are approved)" },
    { key: "priorityDefaultOn", label: "Priority Preview starts on" },
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
    { key: "uploadHeading", label: "Upload section title", skip: FLOWS },
    { key: "uploadTitle", label: "Upload box title" },
    { key: "uploadHint", label: "Upload box hint", hint: "{max} is the largest photo size below." },
    { key: "uploadMaxMb", label: "Largest photo allowed (MB)" },
    { key: "uploadingLabel", label: "While uploading" },
    { key: "removeLabel", label: "Remove photo button" },
    { key: "detailsHeading", label: "Details section title" },
    { key: "detailsDescription", label: "Details description" },
    { key: "nameLabel", label: "Name label" },
    { key: "namePlaceholder", label: "Name placeholder" },
    { key: "phoneLabel", label: "Mobile label" },
    { key: "phonePrefix", label: "Mobile prefix", hint: "Shown before the number. Leave empty to hide it." },
    { key: "phonePlaceholder", label: "Mobile placeholder" },
    { key: "emailLabel", label: "Email label" },
    { key: "emailPlaceholder", label: "Email placeholder" },
    { key: "optionalLabel", label: "Optional tag (email, optional photo boxes)" },
    { key: "reassurance", label: "Reassurance box", hint: "Leave empty to hide the box.", long: true },
    { key: "addToCartLabel", label: "Button" },
    { key: "showTrust", label: "Show trust badges under the button" },
    { key: "photoError", label: "No photo chosen", heading: "Messages" },
    { key: "nameError", label: "Name missing" },
    { key: "phoneError", label: "Mobile number not valid" },
    { key: "emailError", label: "Email not valid" },
    { key: "formatErrorTitle", label: "Photo format pop-up: title" },
    { key: "formatError", label: "Photo format pop-up: text", long: true },
    { key: "tooLargeTitle", label: "Photo too large pop-up: title" },
    { key: "tooLargeError", label: "Photo too large pop-up: text", hint: "{name}, {size} and {max} are filled in.", long: true },
    { key: "uploadFailTitle", label: "Upload failed pop-up: title" },
    { key: "uploadFailedLabel", label: "Upload failed (under the photo)" },
    { key: "retryLabel", label: "Retry link (after the error)" },
    { key: "dialogButton", label: "Pop-up button" },
  ],
  cart: [
    { key: "banner", label: "Top bar" },
    { key: "title", label: "Title" },
    { key: "emptyTitle", label: "Empty cart title" },
    { key: "emptyText", label: "Empty cart text", long: true },
    { key: "emptyButton", label: "Empty cart button" },
    { key: "styleLabel", label: "Portrait style label", skip: FLOWS },
    { key: "sizeLabel", label: "Size label" },
    { key: "backgroundLabel", label: "Background label" },
    { key: "frameLabel", label: "Frame colour label" },
    { key: "canvasFrameLabel", label: "Frame colour line for canvas portraits", skip: FLOWS },
    { key: "petNameLabel", label: "Pet name label", skip: FLOWS },
    { key: "subtitleLabel", label: "Subtitle label" },
    { key: "photoLabel", label: "Uploaded photo label", skip: FLOWS },
    { key: "priorityLabel", label: "Priority Preview label" },
    { key: "notAddedLabel", label: "Shown when a detail is empty", skip: FLOWS },
    { key: "removeLabel", label: "Remove button" },
    { key: "extrasHeading", label: "Add-ons box title" },
    { key: "optionalLabel", label: "Optional tag" },
    { key: "showGift", label: "Offer gift wrapping" },
    { key: "showCompareAt", label: "Show crossed-out add-on prices (only for a genuine, approved discount)" },
    { key: "giftHeading", label: "Gift wrapping box title" },
    { key: "giftTitle", label: "Gift wrapping name" },
    { key: "giftDescription", label: "Gift wrapping description", long: true },
    { key: "couponHeading", label: "Coupon title" },
    { key: "couponPlaceholder", label: "Coupon placeholder" },
    { key: "applyLabel", label: "Apply button" },
    { key: "removeCouponLabel", label: "Remove coupon button" },
    { key: "couponEmptyError", label: "Coupon: nothing typed" },
    { key: "couponAppliedMessage", label: "Coupon applied", hint: "{code} and {off} (the saving) are filled in." },
    { key: "couponCheckError", label: "Coupon: could not be checked" },
    { key: "subtotalLabel", label: "Subtotal line", hint: "{count} and {items} are filled in, e.g. “1 item”." },
    { key: "itemWord", label: "Word for one item" },
    { key: "itemsWord", label: "Word for several items" },
    { key: "discountLabel", label: "Discount line" },
    { key: "totalLabel", label: "Total line" },
    { key: "checkoutLabel", label: "Checkout button" },
    { key: "replaceConfirm", label: "Replacing another page's portrait", hint: "Asked before the cart's portrait from another product is replaced.", long: true },
  ],
  below: [
    { key: "showTestimonial", label: "Show the testimonial card under the order form" },
    { key: "testimonialText", label: "Testimonial", long: true },
    { key: "testimonialAuthor", label: "Testimonial name" },
    { key: "showTrustedBanner", label: "Show the “Trusted by” banner" },
    { key: "trustedLabel", label: "“Trusted by” text" },
  ],
};

/** Shared sections under the product (their own text and photos are edited with the home page / Media). */
const SECTION_FIELDS: FieldDef[] = [
  { key: "showUnboxing", label: "Unboxing videos" },
  { key: "showTicker", label: "Scrolling ticker (Forever Starts Here…)" },
  { key: "showHowItWorks", label: "How it works" },
  { key: "showFeatures", label: "Feature stories (Not Just a Gift…)" },
  { key: "showCarousel", label: "Portrait carousel (The Moments That Meant Everything…)" },
  { key: "showComparison", label: "Peternity vs others comparison" },
  { key: "showFaq", label: "Questions (FAQ)" },
  { key: "showReviews", label: "Reviews (their text is in the Reviews tab)" },
  { key: "showInstagram", label: "Shelter meals and social videos" },
  { key: "showTrustFeatures", label: "Trust features (Customer Satisfaction, Secure Shopping…)" },
];

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

type SelectOption = { value: string; label: string };

/** Hex colour as a picker plus the code, so a colour can be typed or pasted. */
function ColorInput({ value, fallback, onChange, label }: { value: string; fallback: string; onChange: (next: string) => void; label: string }) {
  const valid = /^#[0-9a-fA-F]{6}$/.test(value);
  return (
    <span className="flex items-center gap-2">
      <input
        type="color"
        value={valid ? value : fallback}
        aria-label={label}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-[#e5e7eb] bg-white p-1"
      />
      <input
        type="text"
        value={value}
        placeholder={fallback}
        aria-label={`${label} code`}
        onChange={(e) => onChange(e.target.value.trim())}
        className={`${inputClass} max-w-[140px] font-mono uppercase`}
      />
    </span>
  );
}

function FlatFields({
  section,
  fields,
  value,
  defaults,
  onChange,
  options,
}: {
  section: FlatSection | "flow";
  fields: FieldDef[];
  value: Record<string, string | number | boolean>;
  defaults: Record<string, string | number | boolean>;
  onChange: (key: string, next: string | number | boolean) => void;
  /** Choices for select fields. */
  options?: (source: SelectSource) => SelectOption[];
}) {
  const heading = (field: FieldDef) =>
    field.heading ? (
      <p
        key={`${field.key}-heading`}
        className="border-t border-[#f1f1f1] pt-4 text-xs font-bold uppercase tracking-widest text-[#9ca3af] md:col-span-2"
      >
        {field.heading}
      </p>
    ) : null;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {fields.flatMap((field) => {
        const current = value[field.key];
        const fallback = defaults[field.key];
        if (current === undefined) return [];
        if (typeof current === "boolean") {
          return [
            heading(field),
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
            </label>,
          ];
        }
        if (typeof current === "number") {
          const limit = NUMBER_LIMITS[`${section}.${field.key}`];
          return [
            heading(field),
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
            </Field>,
          ];
        }
        if (field.color) {
          return [
            heading(field),
            <div key={field.key}>
              <Field label={field.label} hint={field.hint}>
                <ColorInput
                  value={String(current ?? "")}
                  fallback={String(fallback ?? "#FFFFFF")}
                  label={field.label}
                  onChange={(next) => onChange(field.key, next)}
                />
              </Field>
            </div>,
          ];
        }
        if (field.select && options) {
          const list = options(field.select);
          // A saved value that is no longer offered stays visible, so nothing changes silently.
          const choices = list.some((item) => item.value === current)
            ? list
            : [...list, { value: String(current), label: `${String(current)} (not offered now)` }];
          return [
            heading(field),
            <div key={field.key}>
              <Field label={field.label} hint={field.hint}>
                <select value={String(current)} onChange={(e) => onChange(field.key, e.target.value)} className={inputClass}>
                  {choices.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>,
          ];
        }
        return [
          heading(field),
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
          </div>,
        ];
      })}
    </div>
  );
}

function TrustEditor({
  title,
  items,
  onChange,
}: {
  title: string;
  items: TrustItem[];
  onChange: (items: TrustItem[]) => void;
}) {
  const update = (index: number, patch: Partial<TrustItem>) =>
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-[#1a1a1b]">
        {title} <span className="font-normal text-[#6b7280]">· up to four badges</span>
      </p>
      {items.map((item, index) => (
        <div key={index} className="grid gap-3 rounded-2xl border border-[#eeeeee] bg-[#fafafa] p-3 sm:grid-cols-[160px_1fr_auto]">
          <Field label="Icon">
            <select value={item.icon} onChange={(e) => update(index, { icon: e.target.value as TrustIcon })} className={inputClass}>
              {TRUST_ICONS.map((icon) => (
                <option key={icon} value={icon}>
                  {ICON_LABELS[icon]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Text">
            <input type="text" value={item.label} onChange={(e) => update(index, { label: e.target.value })} className={inputClass} />
          </Field>
          <div className="flex items-end">
            <button type="button" onClick={() => onChange(items.filter((_, i) => i !== index))} className={ghostButtonClass}>
              Remove
            </button>
          </div>
        </div>
      ))}
      {items.length < 4 ? (
        <button type="button" onClick={() => onChange([...items, { icon: "heart", label: "" }])} className={ghostButtonClass}>
          Add badge
        </button>
      ) : null}
    </div>
  );
}

export function ConfiguratorPanel({
  initial,
  onSaved,
  product = "everyday",
  sizes = { framed: [], canvas: [] },
}: {
  initial: EverydayContentAdmin;
  onSaved: () => void;
  product?: ConfiguratorProduct;
  /** Sizes from Pricing, for Multi-Pet's per-pet-count size rules. */
  sizes?: { framed: string[]; canvas: string[] };
}) {
  const defaults = defaultContent(product);
  const tabs = TABS.filter((item) => !item.products || item.products.includes(product));
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
    const result = await updateEverydayContent(draft, product);
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
    const result = await restoreEverydayContent(product);
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

  /** Fields this product's page actually shows. */
  const fieldsFor = (list: FieldDef[]) =>
    list.filter((field) => (!field.only || field.only === product) && !field.skip?.includes(product));

  const selectOptions = (source: SelectSource): SelectOption[] => {
    if (source === "style") {
      return [
        { value: "framed", label: draft.step1.framedTitle || "Framed" },
        { value: "canvas", label: draft.step1.canvasTitle || "Canvas" },
      ];
    }
    if (source === "framedSize" || source === "canvasSize") {
      return sizes[source === "framedSize" ? "framed" : "canvas"].map((size) => ({ value: size, label: displaySizeLabel(size) }));
    }
    if (source === "frame") {
      return draft.frames.map((frame) => ({ value: frame.id, label: `${frame.label}${frame.visible ? "" : " (hidden)"}` }));
    }
    return draft.backgrounds.map((bg) => ({ value: bg.id, label: `${bg.label}${bg.visible ? "" : " (hidden)"}` }));
  };

  const flatTab = tab === "header" || tab === "gallery" || tab === "step1" || tab === "step2" || tab === "step3" || tab === "cart" || tab === "below" ? tab : null;

  return (
    <Panel
      title={`${CONFIGURATOR_NAMES[product]} configurator`}
      note={`Every title, description, button and switch on this product page: order form, cart and the sections under it. Prices come from Pricing; photos are in the Photos tab above (also Media → ${CONFIGURATOR_MEDIA[product].group}).`}
    >
      {!initial.ready && initial.error ? <p className={`${warnClass} mb-4`}>{initial.error}</p> : null}

      <div className="mb-5 flex flex-wrap gap-1.5">
        {tabs.map((item) => ({
          ...item,
          label:
            item.id === "sizes" ? (product === "multi_pet" ? "Sizes per pet count" : "Sizes per composition") : item.label,
        })).map((item) => (
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

      {flatTab ? (
        <div className="space-y-4">
          {flatTab === "gallery" ? (
            <p className="text-sm text-[#6b7280]">
              The photos at the top of the page. Upload this product&apos;s own photos in the Photos tab → Gallery; until then
              each place shows the shared Product gallery photo.
            </p>
          ) : null}
          {flatTab === "below" ? (
            <p className="text-sm text-[#6b7280]">
              The testimonial card and the “Trusted by” banner under the order form. Their photos are in the Photos tab → Below
              the form.
            </p>
          ) : null}
          <FlatFields
            section={flatTab}
            fields={fieldsFor(FIELDS[flatTab])}
            value={draft[flatTab] as unknown as Record<string, string | number | boolean>}
            defaults={defaults[flatTab] as unknown as Record<string, string | number | boolean>}
            options={selectOptions}
            onChange={(key, value) =>
              edit((next) => {
                (next[flatTab] as unknown as Record<string, string | number | boolean>)[key] = value;
              })
            }
          />
        </div>
      ) : null}

      {tab === "sections" ? (
        <div className="space-y-4">
          <p className="text-sm text-[#6b7280]">
            Sections under the product, shared with the home page. Their own text and photos are edited there and in Media;
            here you choose which ones this product page shows.
          </p>
          <FlatFields
            section="below"
            fields={SECTION_FIELDS}
            value={draft.below as unknown as Record<string, string | number | boolean>}
            defaults={defaults.below as unknown as Record<string, string | number | boolean>}
            onChange={(key, value) =>
              edit((next) => {
                (next.below as unknown as Record<string, string | number | boolean>)[key] = value;
              })
            }
          />
        </div>
      ) : null}

      {tab === "reviews" ? (
        <div className="space-y-4">
          <p className="text-sm text-[#6b7280]">
            The reviews section on this product page. Each card keeps its place; its photo is in the Photos tab → Reviews
            (Review 1 photo, Review 2 photo…). Switch a card off to hide it.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Rating line" hint="Shown beside the stars above the reviews.">
              <input
                type="text"
                value={draft.reviews.summary}
                placeholder={defaults.reviews.summary}
                onChange={(e) =>
                  edit((next) => {
                    next.reviews.summary = e.target.value;
                  })
                }
                className={inputClass}
              />
            </Field>
            <Field label="Verified tag">
              <input
                type="text"
                value={draft.reviews.verifiedLabel}
                placeholder={defaults.reviews.verifiedLabel}
                onChange={(e) =>
                  edit((next) => {
                    next.reviews.verifiedLabel = e.target.value;
                  })
                }
                className={inputClass}
              />
            </Field>
          </div>
          {draft.reviews.items.map((review, index) => {
            const set = (patch: Partial<ReviewCopy>) =>
              edit((next) => {
                next.reviews.items[index] = { ...next.reviews.items[index], ...patch };
              });
            return (
              <div key={index} className="space-y-3 rounded-2xl border border-[#eeeeee] bg-[#fafafa] p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[#1a1a1b]">Review {index + 1}</p>
                  <label className="flex items-center gap-2 text-sm text-[#1a1a1b]">
                    <input
                      type="checkbox"
                      checked={review.visible}
                      onChange={(e) => set({ visible: e.target.checked })}
                      className="h-4 w-4 accent-[#A97659]"
                    />
                    Show
                  </label>
                </div>
                <div className="grid gap-3 md:grid-cols-4">
                  <Field label="Name">
                    <input type="text" value={review.name} onChange={(e) => set({ name: e.target.value })} className={inputClass} />
                  </Field>
                  <Field label="Date">
                    <input type="text" value={review.date} onChange={(e) => set({ date: e.target.value })} className={inputClass} />
                  </Field>
                  <Field label="Stars (1–5)">
                    <select value={review.rating} onChange={(e) => set({ rating: Number(e.target.value) })} className={inputClass}>
                      {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Photo tag" hint="e.g. +2. Empty hides it.">
                    <input
                      type="text"
                      value={review.photosBadge}
                      onChange={(e) => set({ photosBadge: e.target.value })}
                      className={inputClass}
                    />
                  </Field>
                </div>
                <Field label="Review">
                  <textarea
                    rows={2}
                    value={review.text}
                    onChange={(e) => set({ text: e.target.value })}
                    className={`${inputClass} resize-y`}
                  />
                </Field>
                <label className="flex items-center gap-2 text-sm text-[#1a1a1b]">
                  <input
                    type="checkbox"
                    checked={review.verified}
                    onChange={(e) => set({ verified: e.target.checked })}
                    className="h-4 w-4 accent-[#A97659]"
                  />
                  Show the verified tag
                </label>
              </div>
            );
          })}
        </div>
      ) : null}

      {tab === "flow" && draft.flow && defaults.flow ? (
        <div className="space-y-4">
          <p className="text-sm text-[#6b7280]">
            Switches for options Peternity still has to approve start off. Prices for the family upgrade and the halo are in
            Pricing; how many pets can be chosen is the Number of pets status in Pricing.
          </p>
          <FlatFields
            section="flow"
            fields={fieldsFor(FLOW_FIELDS)}
            value={draft.flow as unknown as Record<string, string | number | boolean>}
            defaults={defaults.flow as unknown as Record<string, string | number | boolean>}
            onChange={(key, value) =>
              edit((next) => {
                if (next.flow) (next.flow as unknown as Record<string, string | number | boolean>)[key] = value as never;
              })
            }
          />
        </div>
      ) : null}

      {tab === "sizes" ? (
        <div className="space-y-3">
          <p className="text-sm text-[#6b7280]">
            {product === "multi_pet"
              ? "Untick a size that can't give a balanced, legible group portrait for that many pets."
              : "Untick a size Peternity does not offer for that composition."}{" "}
            Sizes themselves (and their prices) are set in Pricing.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-[#eeeeee]">
            <table className="min-w-full text-sm">
              <thead className="bg-[#fafafa] text-left text-xs text-[#6b7280]">
                <tr>
                  <th className="px-3 py-2 font-semibold">Size</th>
                  {(SIZE_RULE_KEYS[product] || []).map((rule) => (
                    <th key={rule} className="px-3 py-2 font-semibold">
                      {SIZE_RULE_LABELS[rule] ||
                        (rule === "solo" ? draft.flow?.soloTitle : rule === "family" ? draft.flow?.familyTitle : rule) ||
                        rule}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(["framed", "canvas"] as const).flatMap((style) =>
                  sizes[style].map((size) => {
                    const key = sizeRuleKey(style, size);
                    return (
                      <tr key={key} className="border-t border-[#f1f1f1]">
                        <td className="px-3 py-2 text-[#1a1a1b]">
                          {style === "framed" ? "Framed" : "Canvas"} {displaySizeLabel(size)}
                        </td>
                        {(SIZE_RULE_KEYS[product] || []).map((pets) => {
                          const hidden = Boolean(draft.hiddenSizes?.[pets]?.includes(key));
                          return (
                            <td key={pets} className="px-3 py-2">
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={!hidden}
                                  onChange={(e) =>
                                    edit((next) => {
                                      const rules = { ...(next.hiddenSizes || {}) };
                                      const list = new Set(rules[pets] || []);
                                      if (e.target.checked) list.delete(key);
                                      else list.add(key);
                                      rules[pets] = [...list];
                                      next.hiddenSizes = rules;
                                    })
                                  }
                                  className="h-4 w-4 accent-[#A97659]"
                                />
                                Offer
                              </label>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {tab === "trust" ? (
        <div className="space-y-6">
          <TrustEditor
            title="Under Step 1 (Continue button)"
            items={draft.trustStep1}
            onChange={(items) =>
              edit((next) => {
                next.trustStep1 = items;
              })
            }
          />
          <TrustEditor
            title="Under Step 3 (Add to Cart button)"
            items={draft.trust}
            onChange={(items) =>
              edit((next) => {
                next.trust = items;
              })
            }
          />
        </div>
      ) : null}

      {tab === "frames" ? (
        <div className="space-y-3">
          <p className="text-sm text-[#6b7280]">
            Frame colours for framed portraits (Step 2): name, swatch colour and whether it is offered. Hide a colour production
            can&apos;t supply.
          </p>
          {draft.frames.map((frame, index) => (
            <div key={frame.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#eeeeee] bg-[#fafafa] p-3">
              <p className="w-24 text-xs font-semibold text-[#1a1a1b]">{frame.id}</p>
              <input
                type="text"
                value={frame.label}
                aria-label={`${frame.id} name`}
                onChange={(e) =>
                  edit((next) => {
                    next.frames[index].label = e.target.value;
                  })
                }
                className={`${inputClass} min-w-[180px] flex-1`}
              />
              <ColorInput
                value={frame.color}
                fallback={defaults.frames.find((item) => item.id === frame.id)?.color || "#1F1F1F"}
                label={`${frame.id} swatch colour`}
                onChange={(color) =>
                  edit((next) => {
                    next.frames[index].color = color;
                  })
                }
              />
              <label className="flex items-center gap-2 text-sm text-[#1a1a1b]">
                <input
                  type="checkbox"
                  checked={frame.visible}
                  onChange={(e) =>
                    edit((next) => {
                      next.frames[index].visible = e.target.checked;
                    })
                  }
                  className="h-4 w-4 accent-[#A97659]"
                />
                Show
              </label>
            </div>
          ))}
        </div>
      ) : null}

      {tab === "guide" ? (
        <div className="space-y-4">
          <p className="text-sm text-[#6b7280]">
            The Photo Guide pop-up in Step 3. Its four example photos are in the Photos tab → Step 3 · Photo guide.
          </p>
          <Field label="Title">
            <input
              type="text"
              value={draft.photoGuide.title}
              onChange={(e) =>
                edit((next) => {
                  next.photoGuide.title = e.target.value;
                })
              }
              className={inputClass}
            />
          </Field>
          <Field label="Introduction">
            <textarea
              rows={3}
              value={draft.photoGuide.intro}
              onChange={(e) =>
                edit((next) => {
                  next.photoGuide.intro = e.target.value;
                })
              }
              className={`${inputClass} resize-y`}
            />
          </Field>
          {draft.photoGuide.tips.map((tip, index) => (
            <div key={index} className="flex items-end gap-2">
              <div className="flex-1">
                <Field label={`Tip ${index + 1}`}>
                  <input
                    type="text"
                    value={tip}
                    onChange={(e) =>
                      edit((next) => {
                        next.photoGuide.tips[index] = e.target.value;
                      })
                    }
                    className={inputClass}
                  />
                </Field>
              </div>
              <button
                type="button"
                onClick={() =>
                  edit((next) => {
                    next.photoGuide.tips.splice(index, 1);
                  })
                }
                className={ghostButtonClass}
              >
                Remove
              </button>
            </div>
          ))}
          {draft.photoGuide.tips.length < 10 ? (
            <button
              type="button"
              onClick={() =>
                edit((next) => {
                  next.photoGuide.tips.push("");
                })
              }
              className={ghostButtonClass}
            >
              Add tip
            </button>
          ) : null}
        </div>
      ) : null}

      {tab === "accordions" ? (
        <div className="space-y-3">
          <p className="text-sm text-[#6b7280]">
            The Description / Shipping / Guarantee sections under the order form. Blank line = new paragraph, “- ” = bullet,
            **bold**, *italic*.
          </p>
          {draft.accordions.map((item, index) => (
            <div key={index} className="space-y-3 rounded-2xl border border-[#eeeeee] bg-[#fafafa] p-3">
              <div className="grid gap-3 sm:grid-cols-[160px_1fr_auto]">
                <Field label="Icon">
                  <select
                    value={item.icon}
                    onChange={(e) =>
                      edit((next) => {
                        next.accordions[index].icon = e.target.value as TrustIcon;
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
                <Field label="Title">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) =>
                      edit((next) => {
                        next.accordions[index].title = e.target.value;
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
                        next.accordions.splice(index, 1);
                      })
                    }
                    className={ghostButtonClass}
                  >
                    Remove
                  </button>
                </div>
              </div>
              <Field label="Text">
                <textarea
                  rows={5}
                  value={item.body}
                  onChange={(e) =>
                    edit((next) => {
                      next.accordions[index].body = e.target.value;
                    })
                  }
                  className={`${inputClass} resize-y`}
                />
              </Field>
            </div>
          ))}
          {draft.accordions.length < 8 ? (
            <button
              type="button"
              onClick={() =>
                edit((next) => {
                  next.accordions.push({ icon: "heart", title: "", body: "" });
                })
              }
              className={ghostButtonClass}
            >
              Add section
            </button>
          ) : null}
        </div>
      ) : null}

      {tab === "backgrounds" ? (
        <div className="space-y-3">
          <p className="text-sm text-[#6b7280]">
            Order, names, tile colours and visibility of the Step 2 tiles. Pearl to Black are standard; bg7–bg9 are Limited
            Edition and charge the premium price from Pricing. Orders keep the id on the left. The colour fills a tile until
            its photo is uploaded in the Photos tab → Step 2 · Background tiles (also Media → {CONFIGURATOR_MEDIA[product].group}).
            {product !== "everyday" ? " Limited Edition tiles only show once Product options → Limited Edition is on." : ""}
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
                {limited ? (
                  <p className="w-[196px] text-[11px] leading-snug text-[#9ca3af]">Tile shows its pattern until a tile photo is uploaded.</p>
                ) : (
                  <ColorInput
                    value={bg.color}
                    fallback={defaults.backgrounds.find((item) => item.id === bg.id)?.color || "#F1E7DC"}
                    label={`${bg.label} tile colour`}
                    onChange={(color) =>
                      edit((next) => {
                        next.backgrounds[index].color = color;
                      })
                    }
                  />
                )}
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
          <p className="text-sm text-[#6b7280]">
            Names and descriptions in the cart. Prices and crossed-out prices are set in Pricing; photos are in the Photos tab →
            Cart.
          </p>
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
          href={`/portraits/${CONFIGURATOR_SLUGS[product]}`}
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
