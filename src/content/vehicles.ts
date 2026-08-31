import { services, type Service } from "./services";

/**
 * Size brackets. A wash prices by how much surface and time a vehicle takes,
 * so each bracket carries a multiplier applied to the base service price and
 * duration. Model names in the messages file are recognisable examples of the
 * bracket, the way a price board lists them — not endorsements.
 */
export type VehicleId = "moto" | "urbano" | "berlina" | "furgoneta";

export type Vehicle = {
  id: VehicleId;
  multiplier: number;
  /** Services that do not apply to this bracket. */
  excludes?: Service["slug"][];
};

export const vehicles: Vehicle[] = [
  { id: "moto", multiplier: 0.6, excludes: ["window-tint", "dry-interior"] },
  { id: "urbano", multiplier: 1 },
  { id: "berlina", multiplier: 1.35 },
  { id: "furgoneta", multiplier: 1.7 },
];

/** Rounded to the nearest 5 so the board never shows an odd number. */
const round5 = (n: number) => Math.round(n / 5) * 5;

export function servicesFor(vehicle: Vehicle) {
  return services
    .filter((s) => !vehicle.excludes?.includes(s.slug))
    .map((s) => ({
      ...s,
      price: round5(s.priceFrom * vehicle.multiplier),
      minutes: Math.round((s.durationMinutes * vehicle.multiplier) / 15) * 15,
    }));
}

export function startingPrice(vehicle: Vehicle) {
  return Math.min(...servicesFor(vehicle).map((s) => s.price));
}
