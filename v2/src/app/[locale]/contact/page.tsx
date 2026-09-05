import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { routing } from "@/i18n/routing";
import { PageHeader } from "@/components/layout/PageHeader";
import { ButtonAnchor } from "@/components/ui/Button";
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
 * form nobody checks in real time, so this leads with those rather than
 * asking for one more thing to be filled in.
 */
function Contact() {
  const p = useTranslations("pages.contact");

  return (
    <>
      <PageHeader title={p("title")} lede={p("lede")} />

      <section className="section bg-pearl text-ink">
        <div className="wrap grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:items-start lg:gap-16">
          <div className="grid content-start gap-6">
            <h2 className="t-heading">{p("findUs")}</h2>
            <p className="t-sub">{addressLine}</p>
            <div className="flex flex-wrap gap-3">
              <ButtonAnchor href={site.phoneHref}>{p("callUs")}</ButtonAnchor>
              <ButtonAnchor href={site.whatsapp} variant="outlined">
                WhatsApp
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
                className="flex min-h-11 items-center text-muted transition-colors hover:text-ink"
              >
                {site.email}
              </a>
            </div>

            <div className="grid gap-4">
              <h2 className="t-caption">{p("hours")}</h2>
              <HoursTable />
            </div>
          </aside>
        </div>

        <div className="wrap mt-12">
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
