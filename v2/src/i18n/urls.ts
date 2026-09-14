import type { Metadata } from "next";

import { routing, type Locale, type StaticPathname } from "@/i18n/routing";
import { siteUrl } from "@/content/site";

/** `/es/nosotros` for ("/about", "es"); `/es` rather than `/es/` for the root. */
export function localizedPath(path: StaticPathname, locale: Locale) {
  const localised = routing.pathnames[path];
  const segment = typeof localised === "string" ? localised : localised[locale];
  return `/${locale}${segment === "/" ? "" : segment}`;
}

export function absoluteUrl(path: StaticPathname, locale: Locale) {
  return `${siteUrl}${localizedPath(path, locale)}`;
}

/**
 * Next merges metadata down the tree, so a page that sets only a title keeps
 * the layout's `alternates` — which is how every sub-page came to declare
 * itself a duplicate of the home page. Each page has to state its own, and
 * this is the one place that spells them out.
 */
export function alternatesFor(
  path: StaticPathname,
  locale: Locale,
): Metadata["alternates"] {
  return {
    canonical: localizedPath(path, locale),
    // Absolute URLs — search engines ignore relative hreflang.
    languages: Object.fromEntries(
      routing.locales.map((l) => [l, absoluteUrl(path, l)]),
    ),
  };
}

/** Every route without a dynamic segment, which is every route in the sitemap. */
export const staticPaths = Object.keys(routing.pathnames).filter(
  (p) => !p.includes("["),
) as StaticPathname[];
