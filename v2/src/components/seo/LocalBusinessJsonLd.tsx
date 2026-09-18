import { site, siteUrl } from "@/content/site";
import type { Locale } from "@/i18n/routing";

/**
 * The machine-readable version of the studio's own details, so Google can
 * tie this site to the Google Business listing it already has rather than
 * treating them as two unrelated businesses. That link is what puts the
 * site under the map result for "vaporix" and "lavado de coches Buñol".
 *
 * Every value is read from `site.ts`, which is also what the visible page
 * renders — markup that disagreed with the page would be a guidelines
 * violation, not a shortcut.
 *
 * No `aggregateRating`: Google only allows it when the reviews it summarises
 * are shown on this page, and they are not. The rating belongs on the
 * Business Profile, where it already is.
 */
export function LocalBusinessJsonLd({
  locale,
  description,
}: {
  locale: Locale;
  /** The same sentence the page's meta description uses, in this locale. */
  description: string;
}) {
  const { address, geo, hours } = site;

  const data = {
    "@context": "https://schema.org",
    // Both: the wash and the mechanics side are one business at one address.
    "@type": ["AutoWash", "AutoRepair"],
    "@id": `${siteUrl}/#business`,
    name: site.name,
    legalName: site.legalName,
    url: `${siteUrl}/${locale}`,
    logo: `${siteUrl}/logo-vaporix.png`,
    image: `${siteUrl}/images/gallery/audi-q5.webp`,
    telephone: site.phone,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: address.street,
      addressLocality: address.city,
      addressRegion: address.region,
      postalCode: address.postcode,
      addressCountry: address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: geo.lat,
      longitude: geo.lng,
    },
    hasMap: site.mapsUrl,
    // Only links that actually resolve — a placeholder "#" here would point
    // Google at this page's own URL.
    sameAs: [site.mapsUrl, ...site.social.map((s) => s.href)].filter((href) =>
      href.startsWith("http"),
    ),
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: hours.weekdays.open,
        closes: hours.weekdays.close,
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: hours.saturday.open,
        closes: hours.saturday.close,
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Sunday",
        opens: hours.sunday.open,
        closes: hours.sunday.close,
      },
    ],
    // The towns people actually drive in from, which is what "near me"
    // searches in the valley resolve to.
    areaServed: ["Buñol", "Chiva", "Cheste", "Godelleta", "Yátova", "Siete Aguas"].map(
      (name) => ({ "@type": "City", name }),
    ),
    description,
  };

  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is data, not markup; the only character that
      // could break out of a <script> is "<", which cannot appear here.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
