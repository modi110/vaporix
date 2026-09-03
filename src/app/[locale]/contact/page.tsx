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

function Contact() {
  const p = useTranslations("pages.contact");

  return (
    <>
      <PageHeader label={p("label")} title={p("title")} lede={p("lede")} />

      <section className="section-under-header">
        <div className="wrap grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          {/*
            The form is presentational until booking is built. It says so
            plainly instead of pretending to submit, and points at the two
            channels that do work today.
          */}
          <form className="grid gap-7" data-reveal>
            <Field id="name" label={p("name")} type="text" autoComplete="name" />
            <Field id="phone" label={p("phone")} type="tel" autoComplete="tel" />
            <Field id="vehicle" label={p("vehicle")} type="text" />

            <div className="grid gap-2">
              <label htmlFor="message" className="t-label">
                {p("message")}
              </label>
              <textarea
                id="message"
                rows={4}
                className="resize-y border-b border-hairline bg-transparent pb-2 text-base outline-none transition-colors duration-300 focus:border-vapor-ink"
              />
            </div>

            <p className="t-lede text-sm text-muted-dim">{p("formNote")}</p>

            <div className="flex flex-wrap gap-3">
              <PillAnchor href={site.phoneHref}>{p("callUs")}</PillAnchor>
              <PillAnchor href={site.whatsapp} variant="ghost">
                WhatsApp
              </PillAnchor>
            </div>
          </form>

          <aside className="grid content-start gap-8" data-reveal>
            <div className="grid gap-3">
              <h2 className="t-label">{p("findUs")}</h2>
              <p className="text-lg">{addressLine}</p>
              <a
                href={site.phoneHref}
                className="font-mono text-lg text-vapor-ink hover:underline"
              >
                {site.phone}
              </a>
              <a
                href={`mailto:${site.email}`}
                className="text-muted hover:text-ink"
              >
                {site.email}
              </a>
            </div>

            <div className="grid gap-3">
              <h2 className="t-label">{p("hours")}</h2>
              <HoursTable />
            </div>

            <div className="group relative aspect-[4/3] overflow-hidden rounded-card border border-hairline">
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
          </aside>
        </div>
      </section>
    </>
  );
}

function Field({
  id,
  label,
  type,
  autoComplete,
}: {
  id: string;
  label: string;
  type: string;
  autoComplete?: string;
}) {
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="t-label">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        className="border-b border-hairline bg-transparent pb-2 text-base outline-none transition-colors duration-300 focus:border-vapor-ink"
      />
    </div>
  );
}
