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
  const t = await getTranslations({ locale, namespace: "pages.gallery" });
  return { title: `${t("title")} — Vaporix`, description: t("lede") };
}

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Gallery />;
}

/**
 * Six slots at the aspect ratios the real photographs will use, so dropping
 * <Image> in later changes nothing about the layout. Each one says plainly
 * that it is a placeholder rather than pretending to be work.
 */
const SLOTS = [0, 1, 2, 3, 4, 5];

function Gallery() {
  const p = useTranslations("pages.gallery");
  const v = useTranslations("vehicles");

  return (
    <>
      <PageHeader label={p("label")} title={p("title")} lede={p("lede")} />

      <section className="section-under-header">
        <div className="wrap grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SLOTS.map((n, i) => {
            const vehicle = vehicles[n % vehicles.length];
            return (
              <figure
                key={n}
                data-reveal
                style={{ transitionDelay: `${i * 55}ms` }}
                className={`relative grid place-items-center overflow-hidden rounded-card border border-hairline bg-[radial-gradient(ellipse_70%_50%_at_50%_58%,rgba(var(--vapor-rgb),.14),transparent_72%),linear-gradient(160deg,var(--color-surface-2),var(--color-surface))] ${
                  i % 5 === 0 ? "aspect-[4/5]" : "aspect-[4/3]"
                }`}
              >
                <VehicleArt
                  id={vehicle.id}
                  className="w-3/4 text-muted opacity-60"
                />
                <figcaption className="t-label absolute bottom-4 left-5">
                  {v(`items.${vehicle.id}.name`)} · {p("placeholder")}
                </figcaption>
              </figure>
            );
          })}
        </div>
      </section>

      <CtaBand />
    </>
  );
}
