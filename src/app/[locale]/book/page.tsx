import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { routing } from "@/i18n/routing";
import { PageHeader } from "@/components/layout/PageHeader";
import { PillAnchor, PillLink } from "@/components/ui/PillButton";
import { VehicleArt } from "@/components/ui/VehicleArt";
import { vehicles, startingPrice } from "@/content/vehicles";
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
        <div className="wrap grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-start">
          {/*
            Real scheduling is its own build. Rather than ship a date picker
            that cannot actually confirm a slot, this states the position and
            hands over the two channels that do work today.
          */}
          <div
            className="grid gap-6 rounded-card border border-vapor/40 bg-surface-2 p-8"
            data-reveal
          >
            <p className="t-label text-vapor-ink">{v("choose")}</p>
            <p className="t-lede">{p("soon")}</p>
            <div className="flex flex-wrap gap-3">
              <PillAnchor href={site.phoneHref}>{p("call")}</PillAnchor>
              <PillAnchor href={site.whatsapp} variant="ghost">
                {p("whatsapp")}
              </PillAnchor>
            </div>
          </div>

          <aside className="grid gap-4" data-reveal>
            {vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="flex items-center gap-5 rounded-card border border-hairline bg-surface p-5"
              >
                <VehicleArt
                  id={vehicle.id}
                  className="h-12 w-20 shrink-0 text-muted"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{v(`items.${vehicle.id}.name`)}</p>
                  <p className="t-label mt-1 normal-case tracking-[0.04em] text-muted-dim">
                    {v(`items.${vehicle.id}.examples`)}
                  </p>
                </div>
                <span className="shrink-0 font-mono tabular-nums text-vapor-ink">
                  {startingPrice(vehicle)} €
                </span>
              </div>
            ))}
            <PillLink
              href="/pricing"
              variant="ghost"
              className="justify-self-start"
            >
              {v("label")}
            </PillLink>
          </aside>
        </div>
      </section>
    </>
  );
}
