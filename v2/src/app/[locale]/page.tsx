import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/sections/Hero";
import { Highlights } from "@/components/sections/Highlights";
import { Offers } from "@/components/sections/Offers";
import { Prices } from "@/components/sections/Prices";
import { LoyaltyBand } from "@/components/sections/LoyaltyBand";
import { Work } from "@/components/sections/Work";
import { Reviews } from "@/components/sections/Reviews";
import { MoreServices } from "@/components/sections/MoreServices";
import { MapBand } from "@/components/sections/MapBand";
import { CtaBand } from "@/components/sections/CtaBand";

/**
 * The page alternates dark and light band by band, which is the only
 * separation device the design system has — there are no shadows and no
 * radii to lean on.
 *
 *   hero          black    the studio's own work, full screen
 *   highlights    white    four things every wash includes
 *   loyalty       navy     the card, stamping itself full
 *   offers        deep     the 99 € pack, half-price batteries and, beside
 *                          the batteries, the on-site wash for businesses
 *                          (free demo, link to /business). Deep blue
 *                          (#003474), a step darker than the loyalty band
 *                          above it, so two dark bands in a row still read
 *                          as two; the white prices follow
 *   prices        marble   three sizes on a drag rail
 *   work          navy     photographs, large, on the brand blue
 *   reviews       white    what customers wrote on Google, on a drag rail,
 *                          and a link to the listing itself
 *   more services deep     one line: mechanics and batteries, and a link to
 *                          /services. Deep blue for the same reason as
 *                          offers: it sits between the white reviews and the
 *                          navy map, and a step darker keeps it a band of its
 *                          own rather than the top of the map
 *   map           navy     where it is and when it opens
 *   cta           white    the last accent on the page
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <Highlights />
      <LoyaltyBand />
      <Offers />
      <Prices />
      <Work />
      <Reviews />
      <MoreServices />
      <MapBand />
      <CtaBand />
    </>
  );
}
