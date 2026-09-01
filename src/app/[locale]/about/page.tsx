import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { routing } from "@/i18n/routing";
import { PageHeader } from "@/components/layout/PageHeader";
import { CtaBand } from "@/components/sections/CtaBand";
import { CarStage } from "@/components/sections/CarStage";

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

const VALUES = ["care", "honesty", "steam"] as const;

function About() {
  const p = useTranslations("pages.about");

  return (
    <>
      <PageHeader label={p("label")} title={p("title")} lede={p("lede")} />

      <section className="section-under-header">
        <div className="wrap grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div className="grid gap-6" data-reveal>
            <p className="t-lede">{p("p1")}</p>
            <p className="t-lede">{p("p2")}</p>
          </div>
          <div
            data-clip
            className="relative overflow-hidden rounded-card border border-hairline bg-[radial-gradient(ellipse_70%_50%_at_50%_55%,rgba(var(--vapor-rgb),.18),transparent_72%),linear-gradient(160deg,var(--color-surface-2),var(--color-surface))] p-6"
          >
            <CarStage className="w-full" />
          </div>
        </div>
      </section>

      <section className="section pt-0">
        <div className="wrap">
          <h2 className="t-label mb-8" data-reveal>
            {p("valuesTitle")}
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {VALUES.map((key, i) => (
              <div
                key={key}
                data-reveal
                style={{ transitionDelay: `${i * 70}ms` }}
                className="grid gap-3 rounded-card border border-hairline bg-surface p-7"
              >
                <span className="t-label text-vapor-ink">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-lg font-medium tracking-[-0.02em]">
                  {p(`values.${key}.name`)}
                </h3>
                <p className="t-lede text-sm">{p(`values.${key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
