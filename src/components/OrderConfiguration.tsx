import type { OrderDetails } from "@/lib/product-order";

function rupee(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

const ROLE_LABEL: Record<string, string> = {
  group: "Group photo",
  subject: "Subject photo",
  reference: "Reference only",
};

/**
 * Production view of a Multi-Pet / You & Your Pet order: pet count, names, halo target, photo method and
 * every photo with what it shows. Reference photos are labelled as references, never as extra pets.
 */
export function OrderConfiguration({ details, compact = false }: { details?: OrderDetails | null; compact?: boolean }) {
  if (!details) return null;
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
