import type { MetadataRoute } from "next";

import { siteUrl } from "@/content/site";

/**
 * Open to crawlers apart from the three areas that are not public pages:
 * the staff console, the route handlers behind it, and the per-customer
 * loyalty cards, which are addressed by a secret token.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/staff", "/api/", "/es/tarjeta/", "/en/card/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
