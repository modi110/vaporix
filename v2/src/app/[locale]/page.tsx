import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/sections/Hero";
import { Prices } from "@/components/sections/Prices";
import { Work } from "@/components/sections/Work";
import { Studio } from "@/components/sections/Studio";
import { MapBand } from "@/components/sections/MapBand";
import { CtaBand } from "@/components/sections/CtaBand";

/**
 * The page alternates dark and light band by band, which is the only
 * separation device the design system has — there are no shadows and no
 * radii to lean on.
 *
 *   hero     black    the studio's own work, full screen
 *   prices   marble   three sizes on a drag rail
 *   work     white    photographs, large, on a light ground
 *   studio   marble   one quiet frame
 *   map      navy     where it is and when it opens
 *   cta      black    the last yellow on the page
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
      <Prices />
      <Work />
      <Studio />
      <MapBand />
      <CtaBand />
    </>
  );
}
