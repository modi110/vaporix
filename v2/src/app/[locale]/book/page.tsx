import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { routing, type Locale } from "@/i18n/routing";
import { alternatesFor } from "@/i18n/urls";
import { PageHeader } from "@/components/layout/PageHeader";
import { vehicles } from "@/content/vehicles";
import { site } from "@/content/site";

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
    title: `${t("title")} — Vaporix`,
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
 * confirm a slot, this hands over the two channels that do work today — and
 * puts them first, above the prices, because someone who has reached this page
 * has already decided. Making them scroll past a price list to find the phone
 * number would be asking them to decide twice.
 *
 * Both actions are full-width and oversized: on a phone these are the only two
 * things on the page that matter, and a thumb should not have to aim.
 */
function Book() {
  const p = useTranslations("pages.book");
  const v = useTranslations("vehicles");

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
              href={site.whatsapp}
              className="group flex min-h-[7rem] flex-col justify-between gap-6 rounded-2xl border border-ink p-7 transition-colors duration-150 hover:bg-ink hover:text-pearl active:bg-ink active:text-pearl"
            >
              <span className="t-heading">{p("whatsapp")}</span>
              <span className="flex items-center justify-between gap-4">
                <span className="t-display-lg font-medium">WhatsApp</span>
                <Arrow />
              </span>
            </a>
          </div>

          <dl className="grid gap-0 border-t border-hairline">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-hairline py-6"
              >
                <dt className="t-heading">{v(`items.${vehicle.id}.name`)}</dt>
                <dd className="m-0 flex items-baseline gap-2.5">
                  <span className="text-[clamp(1.25rem,2.6vw,1.75rem)] leading-none text-muted line-through decoration-2 tabular-nums">
                    {vehicle.price} €
                  </span>
                  <b className="text-[clamp(2.75rem,7vw,5.5rem)] font-medium leading-none tabular-nums">
                    {vehicle.salePrice} €
                  </b>
                </dd>
                {/* Full-basis row so the badge always sits on its own line,
                    whatever the name's length. A <p> here would be invalid
                    inside a <dl> row: browsers reparent it, React does not,
                    and the mismatch can take hydration down for the page. */}
                <dd className="m-0 basis-full">
                  <span className="t-caption inline-block bg-giallo px-1.5 py-0.5 text-pearl">
                    {v("discount")}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
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
