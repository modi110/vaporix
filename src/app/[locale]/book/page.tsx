import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { routing } from "@/i18n/routing";
import { PageHeader } from "@/components/layout/PageHeader";
import { PillAnchor } from "@/components/ui/PillButton";
import { VehicleArt } from "@/components/ui/VehicleArt";
import { vehicles } from "@/content/vehicles";
import { site } from "@/content/site";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.book" });
  return { title: `${t("title")} — Vaporix`, description: t("lede") };
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Book />;
}

function Book() {
  const p = useTranslations("pages.book");
  const v = useTranslations("vehicles");

  return (
    <>
      <PageHeader label={p("label")} title={p("title")} lede={p("lede")} />

      <section className="section-under-header">
        <div className="wrap grid gap-8">
          {/*
            Real scheduling is its own build. Rather than ship a date picker
            that cannot actually confirm a slot, this states the position and
            hands over the two channels that do work today.
          */}
          <div
            className="grid gap-6 rounded-card border border-vapor/40 bg-surface-2 p-8 sm:flex sm:items-center sm:justify-between sm:gap-8"
            data-reveal
          >
            <p className="t-label text-vapor-ink">{v("choose")}</p>
            <div className="flex flex-wrap gap-3">
              <PillAnchor href={site.phoneHref}>{p("call")}</PillAnchor>
              <PillAnchor href={site.whatsapp} variant="ghost">
                {p("whatsapp")}
              </PillAnchor>
            </div>
          </div>

          {/* One block per bracket: motorcycles carry a different set of
              packages, so a single shared table would have holes in it. */}
          <div className="grid gap-4">
            {vehicles.map((vehicle, i) => (
              <div
                key={vehicle.id}
                data-reveal
                style={{ transitionDelay: `${i * 60}ms` }}
                className="grid gap-6 rounded-card border border-hairline bg-surface p-7 md:grid-cols-[0.42fr_1fr] md:items-center md:gap-10"
              >
                <div className="flex items-center gap-5">
                  <VehicleArt
                    id={vehicle.id}
                    className="h-16 w-28 shrink-0 text-vapor-ink"
                  />
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
          </div>

          <p className="t-lede text-sm text-muted-dim" data-reveal>
            {p("note")}
          </p>
        </div>
      </section>
    </>
  );
}
