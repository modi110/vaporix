import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { routing } from "@/i18n/routing";
import { PageHeader } from "@/components/layout/PageHeader";
import { CtaBand } from "@/components/sections/CtaBand";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.about" });
  return { title: `${t("title")} — Vaporix`, description: t("lede") };
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
      <PageHeader label={p("label")} title={p("title")} lede={p("lede")} />

      <section className="section-under-header">
        <div className="wrap max-w-[58ch]">
          <p className="t-lede" data-reveal>
            {p("body")}
          </p>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
