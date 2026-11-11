import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { PageHeader } from "@/components/layout/PageHeader";
import { privacy } from "@/content/privacy";
import { addressLine, site } from "@/content/site";
import { routing, type Locale } from "@/i18n/routing";
import { alternatesFor } from "@/i18n/urls";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const doc = privacy[locale];
  return {
    title: `${doc.title.replace(/\.$/, "")} — Vaporix`,
    description: doc.lede,
    alternates: alternatesFor("/privacy", locale),
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const doc = privacy[locale];

  const fill = (text: string) =>
    text
      .replaceAll("{{controller}}", site.legalName)
      .replaceAll("{{address}}", `${addressLine}, ${site.address.region}`)
      .replaceAll("{{email}}", site.email)
      .replaceAll("{{phone}}", site.phone);

  return (
    <>
      <PageHeader title={doc.title} lede={doc.lede} />

      <section className="section bg-pearl text-ink">
        <div className="wrap grid max-w-[68ch] gap-10">
          {doc.sections.map((section) => (
            <div key={section.heading} className="grid gap-3">
              <h2 className="t-heading">{section.heading}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} className="t-body text-muted">
                  {fill(paragraph)}
                </p>
              ))}
            </div>
          ))}
          <p className="text-sm tracking-normal text-muted">{doc.updated}</p>
        </div>
      </section>
    </>
  );
}
