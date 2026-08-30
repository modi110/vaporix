/**
 * Pricing tiers shown in the tabbed card. Line-item labels are translated
 * via `pricing.tiers.<id>.rows.<key>`; the numbers live here.
 */
export type Tier = {
  id: "essential" | "advanced" | "extreme";
  rows: { key: string; price: number }[];
};

export const tiers: Tier[] = [
  {
    id: "essential",
    rows: [
      { key: "steamExterior", price: 45 },
      { key: "dryInterior", price: 65 },
      { key: "wheels", price: 30 },
      { key: "decontamination", price: 55 },
      { key: "trim", price: 25 },
    ],
  },
  {
    id: "advanced",
    rows: [
      { key: "steamFull", price: 120 },
      { key: "onePass", price: 190 },
      { key: "headlights", price: 85 },
      { key: "sealant", price: 140 },
      { key: "engineBay", price: 70 },
    ],
  },
  {
    id: "extreme",
    rows: [
      { key: "threePass", price: 390 },
      { key: "ceramic", price: 690 },
      { key: "ppfFront", price: 950 },
      { key: "tint", price: 260 },
      { key: "upholstery", price: 180 },
    ],
  },
];
