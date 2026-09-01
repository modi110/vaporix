import type { PackageId, VehicleId } from "./vehicles";

/**
 * Sample account data.
 *
 * There is no sign-in yet — that arrives with online booking — so this file
 * stands in for whatever the booking system ends up storing. The shape is the
 * point: one record per visit, with the work itemised, so the page can be
 * pointed at a real source later without touching the layout.
 *
 * `task` values are i18n keys under `pages.account.tasks`, never prose, so
 * both locales stay in the message files.
 */
export type Visit = {
  id: string;
  /** ISO date, formatted per locale at render time. */
  date: string;
  vehicle: VehicleId;
  package: PackageId;
  price: number;
  bay: number;
  tasks: string[];
};

export const account = {
  name: "Marta",
  /**
   * Stamps counted since the last reward was redeemed, which is why this can
   * be lower than the number of visits listed below.
   */
  stampsEarned: 2,
  stampsNeeded: 3,
  visits: [
    {
      id: "v-2026-08-14",
      date: "2026-08-14",
      vehicle: "berlina",
      package: "full",
      price: 35,
      bay: 2,
      tasks: ["steam", "interior", "wheels", "glass", "handDry", "deodorise"],
    },
    {
      id: "v-2026-06-02",
      date: "2026-06-02",
      vehicle: "berlina",
      package: "exterior",
      price: 20,
      bay: 1,
      tasks: ["steam", "wheels", "handDry", "sealant", "tyres"],
    },
    {
      id: "v-2026-03-21",
      date: "2026-03-21",
      vehicle: "urbano",
      package: "interior",
      price: 20,
      bay: 3,
      tasks: ["interior", "glass", "deodorise"],
    },
  ] satisfies Visit[],
} as const;

export function totalSpent() {
  return account.visits.reduce((sum, v) => sum + v.price, 0);
}
