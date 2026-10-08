import { Barlow, Manrope } from "next/font/google";

/**
 * The loyalty surfaces only.
 *
 * The site is set entirely in Barlow Condensed, and that stays true for
 * everything a visitor browses. But the card's job is a number read at a
 * glance in daylight, and a condensed face is the wrong tool for a 40px
 * numeral — the strokes crowd at exactly the size where they matter most.
 * Manrope carries the digits and the small print; Barlow Condensed still
 * sets the wordmark and the customer's name, so the card stays Vaporix.
 *
 * Loaded here rather than in the root layout so it ships only on the
 * routes that use it.
 */
export const manrope = Manrope({
  subsets: ["latin"],
  weight: ["500", "600", "800"],
  variable: "--font-manrope",
  display: "swap",
});

/**
 * The card itself.
 *
 * The card is a reproduction of artwork the owner supplied, and that artwork
 * is set in an upright grotesque. Barlow Condensed — the site face — would
 * narrow every glyph and stop the card being the thing that was approved, and
 * Manrope sits too wide and too round against the photograph. Barlow is the
 * same family as the site's display face in its normal width, so the card
 * stays recognisably Vaporix without being a different typeface.
 */
export const cardFont = Barlow({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-card",
  display: "swap",
});
