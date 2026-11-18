import type { ReactNode } from "react";
import type { BundleOrderDetails, DeskOrderDetails, OrderDetails } from "@/lib/product-order";

function rupee(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

const ROLE_LABEL: Record<string, string> = {
  group: "Group photo",
  subject: "Subject photo",
  reference: "Reference only",
};

/** Everything `orders.order_details` can hold: Multi-Pet / You & Your Pet, Desk Portrait or Gift Bundle. */
export type StaffOrderDetails = OrderDetails | DeskOrderDetails | BundleOrderDetails;

function isDeskDetails(details: StaffOrderDetails): details is DeskOrderDetails {
  return details.product_type === "mini_desk";
}

function isBundleDetails(details: StaffOrderDetails): details is BundleOrderDetails {
  return details.product_type === "gift_bundle";
}

function safeHex(value: string | undefined) {
  const hex = String(value || "").trim();
  return /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(hex) ? hex : "";
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <p className="break-words">
      <span className="text-[#6b7280]">{label}:</span> {children}
    </p>
  );
}

function PhotoTile({ url, label, note }: { url: string; label: string; note?: string }) {
  return (
    <a href={url} target="_blank" rel="noreferrer" className="group block overflow-hidden rounded-xl border border-[#eeeeee] bg-white">
      <span className="block aspect-square overflow-hidden bg-[#f8f9fa]">
        <img src={url} alt={label} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
      </span>
      <span className="block px-2 py-1.5 text-xs leading-tight">
        <span className="block font-semibold">{label}</span>
        {note ? <span className="block text-[#9ca3af]">{note}</span> : null}
      </span>
    </a>
  );
}

function PriceSnapshot({ items }: { items: [string, number | undefined][] }) {
  const shown = items.filter(([, value]) => typeof value === "number" && Number.isFinite(value));
  if (!shown.length) return null;
  return (
    <div className="rounded-xl bg-[#F8F3EE] px-3 py-2 text-xs">
      <p className="mb-1 font-semibold text-[#6b7280]">Price at checkout</p>
      <ul className="grid gap-0.5 sm:grid-cols-2">
        {shown.map(([label, value]) => (
          <li key={label} className="flex justify-between gap-3">
            <span className="text-[#6b7280]">{label}</span>
            <span className="font-semibold">{rupee(Number(value))}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Production view of a Desk Portrait: pet count + layout, colour, names, subtitle, stand, size and one photo per pet. */
function DeskConfiguration({ details, compact }: { details: DeskOrderDetails; compact: boolean }) {
  const count = Number(details.pet_count) || 1;
  const horizontal = details.layout_orientation === "horizontal";
  const colour = details.background_colour || { id: "", label: "", hex: "" };
  const hex = safeHex(colour.hex);
  const photos = Array.isArray(details.pet_photo_references) ? details.pet_photo_references : [];
  const subtitle = details.subtitle_enabled && details.subtitle ? details.subtitle : "";

  return (
    <div className="space-y-3 rounded-2xl border border-[#EBD6C8] bg-[#FFFCF8] p-3.5 text-sm text-[#1a1a1b]">
      <p className="font-semibold">
        Desk Portrait · {count} {count === 1 ? "pet" : "pets"} · {horizontal ? "Horizontal" : "Vertical"} layout
        {details.quantity > 1 ? ` · ${details.quantity} copies` : ""}
      </p>
      <p className="flex flex-wrap items-center gap-2">
        <span className="text-[#6b7280]">Background colour:</span>
        {hex ? (
          <span aria-hidden className="inline-block h-5 w-5 shrink-0 rounded-full border border-[#d1c4b8]" style={{ backgroundColor: hex }} />
        ) : null}
        <span className="font-semibold">{colour.label || colour.id || "Not recorded"}</span>
        {hex ? <span className="font-mono text-xs text-[#6b7280]">{hex.toUpperCase()}</span> : null}
      </p>
      <Row label={count > 1 ? "Pet names" : "Pet name"}>{details.pet_names || <span className="text-[#9ca3af]">no name</span>}</Row>
      <Row label="Subtitle">{subtitle || <span className="text-[#9ca3af]">None</span>}</Row>
      <Row label="Wooden stand">
        <span className="font-semibold">Included</span>
      </Row>
      {details.production_size ? <Row label="Production size">{details.production_size}</Row> : null}

      <div className="space-y-2">
        <p>
          <span className="text-[#6b7280]">Photos:</span> one per pet ({photos.length} of {count})
        </p>
        {photos.length ? (
          <div className={`grid gap-2 ${compact ? "grid-cols-3" : "grid-cols-3 sm:grid-cols-4"}`}>
            {photos.map((photo, index) => (
              <PhotoTile key={photo.key || index} url={photo.url} label={`Pet ${photo.pet || index + 1}`} note={photo.key} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#9ca3af]">No photos saved.</p>
        )}
      </div>

      <PriceSnapshot
        items={[
          ["Desk Portrait", details.pricing?.base_product_price],
          [count > 1 ? `Extra pets (${count})` : "Extra pets", details.pricing?.extra_pet_charge],
          ["Unit price", details.pricing?.unit_price],
          ["Order total", details.pricing?.final_total],
        ]}
      />
    </div>
  );
}

/** Production view of a Signature Gift Bundle: the portrait, every included item to make, the greeting card and pet details. */
function BundleConfiguration({ details, compact }: { details: BundleOrderDetails; compact: boolean }) {
  const items = Array.isArray(details.included_items) ? details.included_items : [];
  const card = details.greeting_card || { selected: false, message: "", price_snapshot: 0 };
  const style = details.portrait_style === "canvas" ? "Canvas" : "Framed";
  const pet = details.pet_details || { pet_type: "", breed: "", age: "" };
  const petType = pet.pet_type ? pet.pet_type.charAt(0).toUpperCase() + pet.pet_type.slice(1) : "";
  const tierLabel = details.bundle_label || (details.bundle_tier === "signature" ? "Signature" : "Essential");
  const petName = details.pet_name_enabled && details.pet_name ? details.pet_name : "";
  const subtitle = details.subtitle_enabled && details.subtitle ? details.subtitle : "";

  return (
    <div className="space-y-3 rounded-2xl border border-[#EBD6C8] bg-[#FFFCF8] p-3.5 text-sm text-[#1a1a1b]">
      <p className="font-semibold">
        Signature Gift Bundle · {tierLabel}
        {details.quantity > 1 ? ` · ${details.quantity} bundles` : ""}
      </p>
      <Row label="Portrait">
        {[style, details.size, details.portrait_style === "canvas" ? "" : details.frame ? `${details.frame} frame` : ""]
          .filter(Boolean)
          .join(" · ")}
      </Row>
      <Row label="Background">{details.background?.label || details.background?.id || "Not recorded"}</Row>
      <Row label="Pet name">{petName || <span className="text-[#9ca3af]">Not added</span>}</Row>
      <Row label="Subtitle">{subtitle || <span className="text-[#9ca3af]">Not added</span>}</Row>

      <div className="rounded-xl border border-[#E8D6C8] bg-white px-3 py-2">
        <p className="font-semibold text-[#8a5a00]">Make and pack with this order{details.quantity > 1 ? ` (× ${details.quantity})` : ""}:</p>
        {items.length ? (
          <ul className="mt-1 space-y-0.5">
            {items.map((item) => (
              <li key={item.id || item.label} className="flex items-center gap-2">
                <span aria-hidden className="text-[#A97659]">✓</span>
                <span>{item.label || item.id}</span>
                <span className="rounded-full bg-[#F1E7DC] px-2 py-0.5 text-[11px] font-semibold text-[#6B5E53]">Included</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-xs text-[#9ca3af]">No included items recorded.</p>
        )}
      </div>

      <div className="space-y-1">
        <p>
          <span className="text-[#6b7280]">Personalised Greeting Card:</span>{" "}
          {card.selected ? <span className="font-semibold">Yes</span> : <span className="text-[#9ca3af]">Not selected</span>}
        </p>
        {card.selected ? (
          <p className="whitespace-pre-wrap break-words rounded-xl bg-[#F8F3EE] px-3 py-2 italic">{card.message || "No message saved"}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <p>
          <span className="text-[#6b7280]">Photo:</span> {details.photo?.url ? "1 pet photo" : "No photo saved"}
        </p>
        {details.photo?.url ? (
          <div className={`grid gap-2 ${compact ? "grid-cols-3" : "grid-cols-3 sm:grid-cols-4"}`}>
            <PhotoTile url={details.photo.url} label="Pet 1" note={details.photo.key} />
          </div>
        ) : null}
      </div>

      <Row label="Pet details">
        {[petType, pet.breed, pet.age].filter(Boolean).join(" · ") || <span className="text-[#9ca3af]">Not given</span>}
      </Row>

      <PriceSnapshot
        items={[
          [`${tierLabel} bundle`, details.pricing?.base_bundle_price],
          ["Portrait", details.pricing?.portrait_price],
          ["Greeting card", card.selected ? details.pricing?.greeting_card_price : undefined],
          ["Unit price", details.pricing?.unit_price],
          ["Order total", details.pricing?.final_total],
        ]}
      />
    </div>
  );
}

/**
 * Production view of a Multi-Pet / You & Your Pet order: pet count, names, halo target, photo method and
 * every photo with what it shows. Reference photos are labelled as references, never as extra pets.
 */
export function OrderConfiguration({ details: stored, compact = false }: { details?: StaffOrderDetails | null; compact?: boolean }) {
  if (!stored) return null;
  if (isDeskDetails(stored)) return <DeskConfiguration details={stored} compact={compact} />;
  if (isBundleDetails(stored)) return <BundleConfiguration details={stored} compact={compact} />;
  if (!("configurator" in stored)) return null;
  const details: OrderDetails = stored;
  const multi = details.configurator === "multi_pet";
  const family = details.composition === "family_and_our_pet";
  const haloName = details.halo_pet_id ? details.pets.find((pet) => pet.id === details.halo_pet_id)?.name : null;
  const names = details.names.filter(Boolean);

  return (
    <div className="space-y-3 rounded-2xl border border-[#EBD6C8] bg-[#FFFCF8] p-3.5 text-sm text-[#1a1a1b]">
      <p className="font-semibold">
        {multi ? `Multi-Pet Portrait · ${details.pet_count} pets` : `You & Your Pet · ${family ? "My Family & Our Pet" : "Me & My Pet"}`}
        {details.quantity > 1 ? ` · ${details.quantity} copies` : ""}
        {!multi && family && details.composition_upgrade ? (
          <span className="font-normal text-[#6b7280]"> (+{rupee(details.composition_upgrade)} in the product price)</span>
        ) : null}
      </p>

      {multi ? (
        <ul className="grid gap-1 sm:grid-cols-2">
          {details.pets.map((pet) => (
            <li key={pet.id}>
              <span className="text-[#6b7280]">Pet {pet.id}:</span> {pet.name || <span className="text-[#9ca3af]">no name</span>}
              {details.halo_enabled && details.halo_pet_id === pet.id ? (
                <span className="ml-1.5 rounded-full bg-[#FFF4D6] px-2 py-0.5 text-xs font-semibold text-[#8a5a00]">Halo</span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : names.length ? (
        <p>
          <span className="text-[#6b7280]">Names:</span> {names.join(family ? ", " : " & ")}
        </p>
      ) : null}

      {details.subtitle ? (
        <p>
          <span className="text-[#6b7280]">Subtitle:</span> {details.subtitle}
        </p>
      ) : null}
      {details.halo_enabled && details.halo_pet_id ? (
        <p>
          <span className="text-[#6b7280]">Special Tribute:</span> subtle halo above Pet {details.halo_pet_id}
          {haloName ? ` (${haloName})` : ""}
          {details.halo_pet_note ? ` – ${details.halo_pet_note}` : ""}. No wings or clouds.
          {details.halo_price ? ` Charged ${rupee(details.halo_price)}.` : ""}
        </p>
      ) : null}
      {details.priority_preview ? <p className="font-semibold text-[#8a5a00]">Priority Preview</p> : null}
      {details.limited_edition_background ? (
        <p>
          <span className="text-[#6b7280]">Limited Edition background:</span> {details.background_label}
        </p>
      ) : null}

      <div className="space-y-2">
        <p>
          <span className="text-[#6b7280]">Photos:</span> {details.photo_method_label}
          {details.group_photo_confirmed ? <span className="text-[#6b7280]"> · customer confirmed every pet is visible</span> : null}
        </p>
        <div className={`grid gap-2 ${compact ? "grid-cols-3" : "grid-cols-3 sm:grid-cols-4"}`}>
          {details.photo_assets.map((asset) => (
            <a
              key={asset.key}
              href={asset.url}
              target="_blank"
              rel="noreferrer"
              className="group block overflow-hidden rounded-xl border border-[#eeeeee] bg-white"
            >
              <span className="block aspect-square overflow-hidden bg-[#f8f9fa]">
                <img src={asset.url} alt={asset.label} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
              </span>
              <span className="block px-2 py-1.5 text-xs leading-tight">
                <span className="block font-semibold">{asset.label}</span>
                <span className="block text-[#9ca3af]">{ROLE_LABEL[asset.role] || asset.role}</span>
              </span>
            </a>
          ))}
        </div>
        {details.photo_assets.some((asset) => asset.role === "reference") ? (
          <p className="text-xs text-[#6b7280]">Reference photos only add detail. They are not extra pets.</p>
        ) : null}
      </div>

      {details.artist_instructions ? (
        <p className="break-words">
          <span className="text-[#6b7280]">Artist instructions:</span> {details.artist_instructions}
        </p>
      ) : null}
    </div>
  );
}
