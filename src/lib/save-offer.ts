export type SaveSlice = {
  code: string;
  label: string;
  short: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  weight: number;
};

export type SaveOfferRule = {
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  appliesTo: Array<"all" | "portrait" | "mug" | "magnet" | "digital">;
  minOrderAmount: null;
};

/** One spin, every slice is a real discount checkout will honor. */
export const SAVE_WHEEL: SaveSlice[] = [
  { code: "STAY10", label: "10% off", short: "10%", discountType: "percent", discountValue: 10, weight: 26 },
  { code: "STAY200", label: "₹200 off", short: "₹200", discountType: "fixed", discountValue: 200, weight: 20 },
  { code: "STAY150", label: "₹150 off", short: "₹150", discountType: "fixed", discountValue: 150, weight: 18 },
  { code: "STAY10", label: "10% off", short: "10%", discountType: "percent", discountValue: 10, weight: 16 },
  { code: "STAY200", label: "₹200 off", short: "₹200", discountType: "fixed", discountValue: 200, weight: 12 },
  { code: "STAY150", label: "₹150 off", short: "₹150", discountType: "fixed", discountValue: 150, weight: 8 },
];

export const SAVE_OFFER_STORAGE_KEY = "peternity_save_offer";

export function saveOfferRule(code?: string | null): SaveOfferRule | null {
  const normalized = (code || "").trim().toUpperCase();
  const slice = SAVE_WHEEL.find((item) => item.code === normalized);
  if (!slice) return null;
  return {
    code: slice.code,
    discountType: slice.discountType,
    discountValue: slice.discountValue,
    appliesTo: ["all"],
    minOrderAmount: null,
  };
}

export function pickSaveOfferIndex() {
  const total = SAVE_WHEEL.reduce((sum, slice) => sum + slice.weight, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < SAVE_WHEEL.length; i++) {
    roll -= SAVE_WHEEL[i].weight;
    if (roll <= 0) return i;
  }
  return 0;
}

export function saveOfferRestingRotation(index: number) {
  const slice = 360 / SAVE_WHEEL.length;
  return -((index + 0.5) * slice);
}
