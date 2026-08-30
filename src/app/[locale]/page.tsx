import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/sections/Hero";
import { Studio } from "@/components/sections/Studio";
import { Services } from "@/components/sections/Services";
import { CtaBand } from "@/components/sections/CtaBand";

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
    </>
  );
}
