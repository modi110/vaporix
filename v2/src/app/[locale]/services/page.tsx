import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { routing, type Locale } from "@/i18n/routing";
import { alternatesFor } from "@/i18n/urls";
import { PageHeader } from "@/components/layout/PageHeader";
import { CtaBand } from "@/components/sections/CtaBand";
import { Offers } from "@/components/sections/Offers";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { services } from "@/content/services";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.services" });
  return {
    title: `${t("title")} — Vaporix`,
    description: t("lede"),
    alternates: alternatesFor("/services", locale),
  };
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Services />;
}

/**
 * No per-job prices here — these are quoted per car once we've seen it, not
 * flat like the wash. The one exception is the workshop's standing offers
 * (the 99 € pack and the battery discount), which follow the list: navy
 * header, white list, deep-blue offers, white closing band.
 */
function Services() {
  const p = useTranslations("pages.services");

  return (
    <>
      <PageHeader title={p("title")} lede={p("lede")} />

      <section className="section bg-pearl text-ink">
        <div className="wrap grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((id) => (
            <div key={id} className="lift">
              <ServiceIcon id={id} className="mb-5 size-10" />
              <h2 className="t-heading">{p(`items.${id}`)}</h2>
            </div>
          ))}
        </div>
      </section>

      <Offers />

      <CtaBand />
    </>
  );
}
