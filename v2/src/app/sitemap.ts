import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";
import { absoluteUrl, staticPaths } from "@/i18n/urls";

/**
 * Every static route in both languages, each one carrying its alternates so
 * Google treats the Spanish and English versions as one page in two
 * languages rather than two competing pages.
 *
 * `/card/[token]` is deliberately absent: it is one customer's own loyalty
 * card, addressed by a secret token, and it has no business being crawled.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return staticPaths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: absoluteUrl(path, locale),
      lastModified: new Date(),
      // The home page is the one we actually want ranking for "Vaporix".
      priority: path === "/" ? 1 : 0.7,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, absoluteUrl(path, l)]),
        ),
      },
    })),
  );
}
