/**
 * Non-translatable business facts. Placeholder values until the client
 * sends the real ones — swapping them is a single-file edit.
 */
export const site = {
  name: "Vaporix",
  tagline: "Detailing & Care",
  phone: "+34 600 000 000",
  phoneHref: "tel:+34600000000",
  whatsapp: "https://wa.me/34600000000",
  email: "hola@vaporix.es",
  address: "Calle Ejemplo 00, 00000 Ciudad",
  hours: [
    { days: "mon-fri", open: "09:00", close: "20:00" },
    { days: "sat", open: "10:00", close: "14:00" },
  ],
  social: [
    { label: "Instagram", short: "IG", href: "#" },
    { label: "YouTube", short: "YT", href: "#" },
    { label: "WhatsApp", short: "WA", href: "#" },
  ],
  stats: {
    locations: 3,
    carsTreated: 12000,
    rating: 4.9,
    years: 12,
    serviceTypes: 9,
  },
} as const;
