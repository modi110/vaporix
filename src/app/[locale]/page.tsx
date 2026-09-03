import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/sections/Hero";
import { Studio } from "@/components/sections/Studio";
import { Services } from "@/components/sections/Services";
import { CtaBand } from "@/components/sections/CtaBand";
import { Work } from "@/components/sections/Work";
import { MapBand } from "@/components/sections/MapBand";

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
      <Studio />
      <Services />
      <CtaBand />
      <Work />
      <MapBand />
    </>
  );
}
