import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { PageHeader } from "@/components/layout/PageHeader";
import { CtaBand } from "@/components/sections/CtaBand";
import { services } from "@/content/services";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.servicesIndex" });
  return { title: `${t("title")} — Vaporix`, description: t("lede") };
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ServicesIndex />;
}

function ServicesIndex() {
  const p = useTranslations("pages.servicesIndex");
  const d = useTranslations("pages.serviceDetail");
  const t = useTranslations("services");

  return (
    <>
      <PageHeader label={p("label")} title={p("title")} lede={p("lede")} />

      <section className="section-under-header">
        <div className="wrap grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {services.map((s, i) => (
            <div key={s.slug} data-reveal style={{ transitionDelay: `${i * 55}ms` }}>
              <Link
                href={{ pathname: "/services/[slug]", params: { slug: s.slug } }}
                className="group flex h-full flex-col gap-4 rounded-card border border-hairline bg-surface p-7 transition-colors duration-400 hover:border-vapor/50"
              >
                <span className="t-label">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="text-xl font-medium tracking-[-0.02em] transition-colors duration-300 group-hover:text-vapor-ink-ink-ink">
                  {t(`items.${s.slug}.name`)}
                </h2>
                <p className="t-lede text-sm">{t(`items.${s.slug}.short`)}</p>
                <span className="mt-auto flex items-baseline gap-2 border-t border-hairline pt-4">
                  <span className="t-label">{d("priceFrom")}</span>
                  <span className="font-mono font-medium tabular-nums text-vapor-ink">
                    {s.priceFrom} €
                  </span>
                </span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <CtaBand />
    </>
  );
}
