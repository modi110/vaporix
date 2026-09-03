import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { routing } from "@/i18n/routing";
import { PageHeader } from "@/components/layout/PageHeader";
import { PillAnchor } from "@/components/ui/PillButton";
import { HoursTable } from "@/components/ui/HoursTable";
import { site, addressLine } from "@/content/site";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.contact" });
  return { title: `${t("title")} — Vaporix`, description: t("lede") };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Contact />;
}

/**
 * No form: a phone number and a WhatsApp line answer faster than a contact
 * form nobody checks in real time, so this page leads with those instead of
 * asking for one more thing to be filled in.
 */
function Contact() {
  const p = useTranslations("pages.contact");

  return (
    <>
      <PageHeader label={p("label")} title={p("title")} lede={p("lede")} />

      <section className="section-under-header">
        <div className="wrap grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-start">
          <div
            className="grid gap-6 rounded-card border border-vapor/40 bg-surface-2 p-8"
            data-reveal
          >
            <p className="t-label text-vapor-ink">{p("findUs")}</p>
            <p className="text-lg">{addressLine}</p>
            <div className="flex flex-wrap gap-3">
              <PillAnchor href={site.phoneHref}>{p("callUs")}</PillAnchor>
              <PillAnchor href={site.whatsapp} variant="ghost">
                WhatsApp
              </PillAnchor>
            </div>
          </div>

          <aside className="grid content-start gap-8" data-reveal>
            <div className="-m-2 grid gap-1">
              <a
                href={site.phoneHref}
                className="rounded-lg p-2 font-mono text-lg text-vapor-ink hover:underline"
              >
                {site.phone}
              </a>
              <a
                href={`mailto:${site.email}`}
                className="rounded-lg p-2 text-muted hover:text-ink"
              >
                {site.email}
              </a>
            </div>

            <div className="grid gap-3">
              <h2 className="t-label">{p("hours")}</h2>
              <HoursTable />
            </div>
          </aside>
        </div>

        <div className="group wrap relative mt-8 aspect-[16/9] overflow-hidden rounded-card border border-hairline lg:mt-10">
          <iframe
            src={site.mapEmbedUrl}
            title={p("mapTitle")}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="map-embed absolute inset-0 size-full border-0"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[rgba(var(--vapor-rgb),0.12)] transition-opacity duration-500 group-hover:opacity-0"
          />
        </div>
      </section>
    </>
  );
}
