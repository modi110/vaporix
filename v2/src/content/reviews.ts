/**
 * Customer reviews, transcribed from the studio's Google Business listing —
 * the same listing `site.mapsUrl` points at and the map embeds. The wording is
 * the customer's, untouched; only capitalisation and punctuation are
 * normalised (one was written entirely in capitals).
 *
 * Left in Spanish in both locales, on purpose: a translated quote is no longer
 * the words the customer wrote, and the section links straight to the listing
 * where anyone can check them. Only the section's own chrome is translated.
 *
 * Two of the five were shown on the listing without an attributed name, so
 * they carry none here rather than an invented one — the component falls back
 * to the "verified Google review" label for those.
 *
 * No dates: relative ones ("2 months ago") go stale on their own, and an
 * absolute one on a five-star quote adds nothing.
 */
export type Review = {
  id: string;
  /** As Google shows it. Absent when the listing attributed no name. */
  author?: string;
  quote: string;
};

export const reviews: readonly Review[] = [
  {
    id: "andra",
    author: "Andra Mirea",
    quote:
      "Gran servicio a un precio razonable. El coche quedó perfectamente limpio y el trato fue excelente. Da gusto encontrar profesionales que hacen tan bien su trabajo. Repetiré seguro.",
  },
  {
    id: "ramon",
    author: "Ramón Cerezo",
    quote:
      "Muy contento con el trabajo. Profesionales y detallistas. Antes y después del trabajo, una pasada. Parece nuevo. No hace falta añadir nada más.",
  },
  {
    id: "paula",
    author: "Paula Moreno",
    quote:
      "Excelente servicio, mi coche quedó perfecto y personal muy amable.",
  },
  {
    id: "anon-1",
    quote: "Expectacular trabajo, lo aconsejo. Muchas gracias.",
  },
  {
    id: "anon-2",
    quote: "Excelente atención y profesionalidad.",
  },
] as const;
