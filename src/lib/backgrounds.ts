// Portrait backgrounds. The `name` is the id stored on orders and used for pricing,
// so it never changes; shop labels and visibility come from the configurator content.

export type BackgroundType = {
  name: string;
  value: string;
  textColor: string;
  isImage?: boolean;
  limited?: boolean;
  label?: string;
};

export const BACKGROUNDS: BackgroundType[] = [
  { name: "Pearl", value: "#f9f9f7", textColor: "#d1d1cf" },
  { name: "Almond", value: "#f3e4d4", textColor: "#c4a484" },
  { name: "Serenity", value: "#f0e9f9", textColor: "#c4b5d4" },
  { name: "Celadon", value: "#b8cfc1", textColor: "#ffffff" },
  { name: "Tea Rosé", value: "#f3ccc6", textColor: "#ffffff" },
  { name: "Black", value: "#000000", textColor: "#ffffff" },
];

export const LIMITED_BACKGROUNDS: BackgroundType[] = [
  { name: "bg7", label: "Aurora", value: "/bg7.png", textColor: "#ffffff", isImage: true, limited: true },
  { name: "bg8", label: "Meadow", value: "/bg8.png", textColor: "#ffffff", isImage: true, limited: true },
  { name: "bg9", label: "Dusk", value: "/bg9.png", textColor: "#ffffff", isImage: true, limited: true },
];

export const ALL_BACKGROUNDS: BackgroundType[] = [...BACKGROUNDS, ...LIMITED_BACKGROUNDS];

export function backgroundById(id: string) {
  return ALL_BACKGROUNDS.find((bg) => bg.name === id) || null;
}

/** Admin → Media slot holding the tile photo (pet on this background). */
export function backgroundTileSlot(id: string) {
  const slug = id
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `everyday-bg-${slug}`;
}
