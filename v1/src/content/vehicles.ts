/**
 * Size brackets and the packages offered for each.
 *
 * A bike has no cabin to clean, so it gets its own pair of packages rather
 * than a hollow "interior" option. Prices live here; every label a visitor
 * reads lives in messages/*.json under `vehicles.packages.<id>`.
 */
export type VehicleId =
  | "moto"
  | "urbano"
  | "berlina"
  | "furgoneta"
  | "camion";

export type PackageId =
  | "interior"
  | "exterior"
  | "full"
  | "motoExterior"
  | "motoSealed";

export type Package = {
  id: PackageId;
  price: number;
  /** Marks the package the board should lead with. */
  featured?: boolean;
};

export type Vehicle = {
  id: VehicleId;
  packages: Package[];
};

const standard: Package[] = [
  { id: "interior", price: 20 },
  { id: "exterior", price: 20 },
  { id: "full", price: 35, featured: true },
];

export const vehicles: Vehicle[] = [
  {
    id: "moto",
    packages: [
      { id: "motoExterior", price: 15 },
      { id: "motoSealed", price: 30, featured: true },
    ],
  },
  { id: "urbano", packages: standard },
  { id: "berlina", packages: standard },
  { id: "furgoneta", packages: standard },
  {
    // A truck is a different job to a van, so it carries its own rate rather
    // than borrowing `standard`. These figures are placeholders — confirm.
    id: "camion",
    packages: [
      { id: "interior", price: 30 },
      { id: "exterior", price: 30 },
      { id: "full", price: 50, featured: true },
    ],
  },
];

export function getVehicle(id: VehicleId) {
  return vehicles.find((v) => v.id === id) ?? vehicles[1];
}

export function startingPrice(vehicle: Vehicle) {
  return Math.min(...vehicle.packages.map((p) => p.price));
}
