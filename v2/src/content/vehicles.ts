/**
 * The whole price list: three sizes, one flat price each.
 *
 * This replaces v1's five brackets crossed with three packages. That grid
 * asked a visitor to make two decisions before seeing a number, and half of
 * its figures were never confirmed by the studio. Size is the only thing a
 * customer already knows about their own car, and now it is the only thing
 * they are asked.
 *
 */
export type VehicleId = "small" | "suv" | "van";

export type Vehicle = {
  id: VehicleId;
  price: number;
};

export const vehicles: Vehicle[] = [
  { id: "small", price: 40 },
  { id: "suv", price: 50 },
  { id: "van", price: 60 },
];

/** The rail opens here: the middle card, with one peeking either side. */
export const DEFAULT_VEHICLE: VehicleId = "suv";
