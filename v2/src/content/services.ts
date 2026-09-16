import type { ServiceIconId } from "@/components/ui/ServiceIcon";

/**
 * The workshop's other jobs, in display order — mechanics and batteries
 * first, since that is what the home page leads with. Shared by `/services`
 * and the home page's services band so the two lists cannot drift apart.
 */
export const services: ServiceIconId[] = [
  "battery",
  "repairs",
  "mobile",
  "inspection",
  "bulbs",
  "oil",
  "brakes",
  "tyre",
  "boost",
];
