import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { PageHeader } from "@/components/layout/PageHeader";
import { CtaBand } from "@/components/sections/CtaBand";
import { PillLink } from "@/components/ui/PillButton";
import { services, getService } from "@/content/services";

/** Every locale × every service, all prerendered. */
export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    services.map((s) => ({ locale, slug: s.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!getService(slug)) return {};
  const t = await getTranslations({ locale, namespace: "services" });
  return {
    title: `${t(`items.${slug}.name`)} — Vaporix`,
    description: t(`items.${slug}.short`),
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  if (!getService(slug)) notFound();
  return <ServiceDetail slug={slug} />;
}

function ServiceDetail({ slug }: { slug: string }) {
  const service = getService(slug)!;
  const t = useTranslations("services");
  const d = useTranslations("pages.serviceDetail");
  const others = services.filter((s) => s.slug !== slug).slice(0, 3);

  return (
    <>
      <PageHeader
        label={d("label")}
        title={t(`items.${slug}.name`)}
        lede={t(`items.${slug}.short`)}
      />

      <section className="section-under-header">
        <div className="wrap grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-start">
          <div className="grid gap-6" data-reveal>
            <h2 className="t-label">{d("includes")}</h2>
            <p className="t-lede">{t(`items.${slug}.short`)}</p>
            <p className="t-lede text-sm text-muted-dim">{d("pricingNote")}</p>
          </div>

          <aside
            className="grid gap-6 rounded-card border border-hairline bg-surface p-8"
            data-reveal
          >
            <div className="flex items-baseline justify-between gap-4 border-b border-hairline pb-4">
              <span className="t-label">{d("priceFrom")}</span>
              <span className="font-mono text-2xl font-medium tabular-nums text-vapor">
                {service.priceFrom} €
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <span className="t-label">{d("duration")}</span>
              <span className="font-mono tabular-nums">
                {t("minutes", { count: service.durationMinutes })}
              </span>
            </div>
            <PillLink href="/book" className="justify-self-start">
              {d("book")}
            </PillLink>
          </aside>
        </div>
      </section>

      <section className="section pt-0">
        <div className="wrap">
          <h2 className="t-label mb-6">{d("others")}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {others.map((s) => (
              <div key={s.slug} data-reveal>
                <Link
                  href={{ pathname: "/services/[slug]", params: { slug: s.slug } }}
                  className="group flex h-full flex-col gap-3 rounded-card border border-hairline bg-surface p-6 transition-colors duration-400 hover:border-vapor/50"
                >
                  <h3 className="font-medium transition-colors duration-300 group-hover:text-vapor">
                    {t(`items.${s.slug}.name`)}
                  </h3>
                  <p className="t-lede text-sm">{t(`items.${s.slug}.short`)}</p>
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-8">
            <Link href="/services" className="t-label hover:text-ink">
              ← {d("back")}
            </Link>
          </p>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
