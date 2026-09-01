import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { routing } from "@/i18n/routing";
import { PageHeader } from "@/components/layout/PageHeader";
import { CtaBand } from "@/components/sections/CtaBand";
import { VehicleArt } from "@/components/ui/VehicleArt";
import { vehicles } from "@/content/vehicles";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.pricing" });
  return { title: `${t("title")} — Vaporix`, description: t("lede") };
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Pricing />;
}

function Pricing() {
  const p = useTranslations("pages.pricing");
  const v = useTranslations("vehicles");

  return (
    <>
      <PageHeader label={p("label")} title={p("title")} lede={p("lede")} />

      <section className="section-under-header">
        <div className="wrap grid gap-4">
          {/* One block per bracket: motorcycles carry a different set of
              packages, so a single shared table would have holes in it. */}
          {vehicles.map((vehicle, i) => (
            <div
              key={vehicle.id}
              data-reveal
              style={{ transitionDelay: `${i * 60}ms` }}
              className="grid gap-6 rounded-card border border-hairline bg-surface p-7 md:grid-cols-[0.42fr_1fr] md:items-center md:gap-10"
            >
              <div className="flex items-center gap-5">
                <VehicleArt id={vehicle.id} className="h-16 w-28 shrink-0 text-vapor-ink" />
                <div>
                  <h2 className="text-lg font-medium tracking-[-0.02em]">
                    {v(`items.${vehicle.id}.name`)}
                  </h2>
                  <p className="t-label mt-1.5 normal-case tracking-[0.04em] text-muted-dim">
                    {v(`items.${vehicle.id}.examples`)}
                  </p>
                </div>
              </div>

              <dl className="grid gap-0">
                {vehicle.packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="flex items-baseline justify-between gap-4 border-b border-hairline py-3 last:border-b-0"
                  >
                    <dt className="text-sm">{v(`packages.${pkg.id}.name`)}</dt>
                    <dd className="font-mono font-medium tabular-nums text-vapor-ink">
                      {pkg.price} €
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}

          <p className="t-lede mt-4 text-sm text-muted-dim" data-reveal>
            {p("note")}
          </p>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
