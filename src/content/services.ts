/**
 * Structure and non-translatable data only. Every string a visitor reads
 * lives in messages/*.json under `services.items.<slug>`.
 */
export type Service = {
  slug: string;
  priceFrom: number;
  durationMinutes: number;
  tier: "essential" | "advanced" | "extreme";
};

export const services: Service[] = [
  { slug: "steam-wash", priceFrom: 45, durationMinutes: 60, tier: "essential" },
  { slug: "dry-interior", priceFrom: 65, durationMinutes: 90, tier: "essential" },
  { slug: "paint-correction", priceFrom: 190, durationMinutes: 300, tier: "advanced" },
  { slug: "ceramic-coating", priceFrom: 690, durationMinutes: 960, tier: "extreme" },
  { slug: "paint-protection-film", priceFrom: 950, durationMinutes: 1440, tier: "extreme" },
  { slug: "window-tint", priceFrom: 260, durationMinutes: 240, tier: "advanced" },
  { slug: "decontamination", priceFrom: 55, durationMinutes: 90, tier: "essential" },
  { slug: "engine-bay", priceFrom: 70, durationMinutes: 60, tier: "advanced" },
  { slug: "trim-restoration", priceFrom: 25, durationMinutes: 45, tier: "essential" },
];

export const serviceSlugs = services.map((s) => s.slug);

export function getService(slug: string) {
  return services.find((s) => s.slug === slug);
}
