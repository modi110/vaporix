/**
 * Non-translatable business facts.
 *
 * Address, coordinates, opening window and rating are transcribed from the
 * studio's own Google Business listing, which is also what the map on the
 * home page embeds — so the page and the listing cannot drift apart.
 */
export const site = {
  name: "Vaporix",
  legalName: "Vaporix car wash",
  tagline: "Detailing & Care",

  /**
   * As supplied by the studio. Note that the Google listing carries
   * +34 639 87 66 86 instead; if that is the live line, change it here and
   * every link on the site follows.
   */
  phone: "8-800-10-500",
  phoneHref: "tel:880010500",
  /**
   * WhatsApp needs a full international number, which the line above does not
   * carry, so this uses the mobile on the Google listing.
   */
  whatsapp: "https://wa.me/34639876686",
  email: "hola@vaporix.es",

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
   * Google's public panel exposes only the current day, and it read
   * 08:00–21:00. That window is therefore confirmed; which days it covers is
   * not, so the site states the window and sends people to the listing for
   * the day-by-day schedule. Replace with the full week once confirmed.
   */
  hours: { open: "08:00", close: "21:00" },

  rating: 5.0,

  social: [
    { label: "Instagram", icon: "instagram", href: "#" },
    { label: "WhatsApp", icon: "whatsapp", href: "https://wa.me/34639876686" },
  ],
} as const;

/** One-line address, the form used in body copy and link labels. */
export const addressLine = `${site.address.street}, ${site.address.postcode} ${site.address.city}`;
