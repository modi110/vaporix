import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { routing, type Locale } from "@/i18n/routing";
import { alternatesFor } from "@/i18n/urls";
import { PageHeader } from "@/components/layout/PageHeader";
import { CtaBand } from "@/components/sections/CtaBand";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.about" });
  return {
    title: `${t("title")} — Vaporix`,
    description: t("lede"),
    alternates: alternatesFor("/about", locale),
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <About />;
}

/**
 * Kept short and general on purpose: no founding story, no numbers, nothing
 * specific enough to be wrong. Just what any small workshop can honestly say
 * about how it works.
 */
function About() {
  const p = useTranslations("pages.about");

  return (
    <>
      <PageHeader title={p("title")} lede={p("lede")} />

      <section className="section bg-pearl text-ink">
        <div className="wrap">
          <p className="t-body text-lg">{p("body")}</p>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
