import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { routing, type Locale } from "@/i18n/routing";
import { alternatesFor } from "@/i18n/urls";
import { PageHeader } from "@/components/layout/PageHeader";
import { ButtonAnchor } from "@/components/ui/Button";
import { HoursTable } from "@/components/ui/HoursTable";
import { site, addressLine, whatsappWith } from "@/content/site";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.book" });
  return {
    title: `${t("metaTitle")} — Vaporix`,
    description: t("lede"),
    alternates: alternatesFor("/book", locale),
  };
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

/**
 * Real scheduling is its own build. Rather than ship a date picker that cannot
 * confirm a slot, this hands over the two channels that do work today. No
 * price list here (owner's choice, 10 November 2026): someone who has reached
 * this page has already decided, and the prices live on the home page.
 *
 * Both actions are full-width and oversized: on a phone these are the only two
 * things on the page that matter, and a thumb should not have to aim.
 *
 * It is also the contact page (merged 22 November 2026; the old Contact URLs
 * redirect here): under the two actions sit the address, phone, email, hours
 * and the map, which was everything Contact had. The WhatsApp chat opens with
 * a first line already typed that asks for the vehicle and the service, so
 * the reply can come back with a time.
 */
function Book() {
  const p = useTranslations("pages.book");
  const map = useTranslations("map");

  return (
    <>
      <PageHeader title={p("title")} lede={p("lede")} />

      <section className="section bg-pearl text-ink">
        <div className="wrap grid gap-14">
          <div className="grid gap-3 sm:grid-cols-2">
            <a
              href={site.phoneHref}
              className="group flex min-h-[7rem] flex-col justify-between gap-6 rounded-2xl bg-giallo p-7 text-pearl transition-colors duration-150 hover:bg-giallo-deep active:bg-giallo-deep"
            >
              <span className="t-heading">{p("call")}</span>
              <span className="flex items-center justify-between gap-4">
                <span className="t-display-lg font-medium tabular-nums">
                  {site.phone}
                </span>
                <Arrow />
              </span>
            </a>

            <a
              href={whatsappWith(p("waText"))}
              className="group flex min-h-[7rem] flex-col justify-between gap-6 rounded-2xl border border-ink p-7 transition-colors duration-150 hover:bg-ink hover:text-pearl active:bg-ink active:text-pearl"
            >
              <span className="t-heading">{p("whatsapp")}</span>
              <span className="flex items-center justify-between gap-4">
                <span className="t-display-lg font-medium">WhatsApp</span>
                <Arrow />
              </span>
            </a>
          </div>

          <div className="grid gap-12 border-t border-hairline pt-12 lg:grid-cols-[1fr_0.85fr] lg:items-start lg:gap-16">
            <div className="grid content-start gap-6">
              <h2 className="t-heading">{p("findUs")}</h2>
              <p className="t-sub">{addressLine}</p>
              <div className="flex flex-wrap gap-3">
                <ButtonAnchor href={site.mapsUrl} variant="outlined">
                  {map("directions")}
                </ButtonAnchor>
              </div>
            </div>

            <aside className="grid content-start gap-10">
              <div className="grid">
                <a
                  href={site.phoneHref}
                  className="flex min-h-11 items-center text-lg tabular-nums transition-colors hover:text-giallo-deep"
                >
                  {site.phone}
                </a>
                <a
                  href={`mailto:${site.email}`}
                  aria-label={`${p("email")}: ${site.email}`}
                  className="flex min-h-11 items-center text-muted transition-colors hover:text-ink"
                >
                  {site.email}
                </a>
              </div>

              <div className="grid gap-4">
                <h2 className="t-caption text-muted">{p("hours")}</h2>
                <HoursTable />
              </div>
            </aside>
          </div>

          <div className="relative aspect-[16/9] overflow-hidden border border-hairline">
            <iframe
              src={site.mapEmbedUrl}
              title={p("mapTitle")}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="map-embed absolute inset-0 size-full border-0"
            />
          </div>
        </div>
      </section>
    </>
  );
}

function Arrow() {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className="size-7 shrink-0 transition-transform duration-150 group-hover:translate-x-1 group-active:translate-x-1 motion-reduce:transition-none"
    >
      <path d="M2 8h11M9 4l4 4-4 4" />
    </svg>
  );
}
