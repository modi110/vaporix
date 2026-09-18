/**
 * Non-translatable business facts.
 *
 * Address, coordinates, opening window and rating are transcribed from the
 * studio's own Google Business listing, which is also what the map on the
 * home page embeds — so the page and the listing cannot drift apart.
 */
/** E.164, the one place the number is written down. */
const PHONE_E164 = "+34639876686";

export const site = {
  name: "Vaporix Car Wash - Fast Mechanics & Batteries",
  legalName: "Vaporix car wash",
  /**
   * One line, everywhere: the call link, the WhatsApp link and the number on
   * the page all come from here, so there is nothing to keep in sync.
   * Displayed in the Spanish grouping; the href stays E.164.
   */
  phone: "+34 639 87 66 86",
  phoneHref: `tel:${PHONE_E164}`,
  whatsapp: `https://wa.me/${PHONE_E164.slice(1)}`,
  email: "Info@vaporix.net",

  address: {
    street: "Ctra. Godelleta, 13",
    postcode: "46360",
    city: "Buñol",
    region: "Valencia",
    country: "ES",
  },

  geo: { lat: 39.4262003, lng: -0.7799652 },

  /** The listing itself, for "open in Google Maps" links. */
  mapsUrl:
    "https://www.google.com/maps/place/Vaporix+car+wash/@39.4262003,-0.7799652,17z/data=!4m6!3m5!1s0xd60e542b6b528b3:0xf44b4cd02a2dfe25!8m2!3d39.4262003!4d-0.7799652!16s%2Fg%2F11zfrgxbhm",

  /**
   * The keyless embed endpoint, which needs no API key and no billing
   * account. `q` is the place name plus its coordinates so the pin lands on
   * the studio rather than on the road.
   */
  mapEmbedUrl:
    "https://maps.google.com/maps?q=Vaporix%20car%20wash%2C%20Ctra.%20Godelleta%2013%2C%2046360%20Bu%C3%B1ol&ll=39.4262003,-0.7799652&z=16&hl=es&output=embed",

  /**
   * The real weekly schedule, confirmed by the studio and matching the Google
   * listing: open seven days a week, with the weekend running a shorter
   * morning window. Nothing here is ever `null` — the studio does not close
   * on any day, and the page says so out loud in `hours.everyday`.
   */
  hours: {
    weekdays: { open: "08:00", close: "21:00" },
    saturday: { open: "08:00", close: "14:00" },
    sunday: { open: "08:00", close: "14:00" },
  },

  rating: 5.0,

  // No Instagram account yet. When there is one, add
  //   { label: "Instagram", icon: "instagram", href: "https://instagram.com/..." }
  // here — the footer icon and the JSON-LD `sameAs` both pick it up on their own.
  social: [
    {
      label: "WhatsApp",
      icon: "whatsapp",
      href: `https://wa.me/${PHONE_E164.slice(1)}`,
    },
  ],
} as const;

/** One-line address, the form used in body copy and link labels. */
export const addressLine = `${site.address.street}, ${site.address.postcode} ${site.address.city}`;

/**
 * Absolute origin, no trailing slash. Canonicals, hreflang, the sitemap and
 * the JSON-LD all resolve against it, so it has to be the live domain in
 * production — set NEXT_PUBLIC_SITE_URL in the deploy environment.
 */
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vaporix.net";
