import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { routing } from "@/i18n/routing";
import { PageHeader } from "@/components/layout/PageHeader";
import { CtaBand } from "@/components/sections/CtaBand";
import { ServiceIcon, type ServiceIconId } from "@/components/ui/ServiceIcon";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.services" });
  return { title: `${t("title")} — Vaporix`, description: t("lede") };
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

const items: ServiceIconId[] = ["oil", "brakes", "tyre"];

/**
 * No prices here, unlike `/reservar` — these are quoted per car once we've
 * seen it, not flat like the wash. The page exists to say the workshop does
 * more than washing, not to sell any one of these on its own.
 */
function Services() {
  const p = useTranslations("pages.services");

  return (
    <>
      <PageHeader title={p("title")} lede={p("lede")} />

      <section className="section bg-pearl text-ink">
        <div className="wrap grid gap-10 sm:grid-cols-3">
          {items.map((id) => (
            <div key={id}>
              <ServiceIcon id={id} className="mb-5 size-10" />
              <h2 className="t-heading">{p(`items.${id}`)}</h2>
            </div>
          ))}
        </div>
      </section>

      <CtaBand />
    </>
  );
}
