import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { routing, type Locale } from "@/i18n/routing";
import { alternatesFor } from "@/i18n/urls";
import { PageHeader } from "@/components/layout/PageHeader";
import { JoinForm } from "@/components/loyalty/JoinForm";
import { getActiveReward } from "@/lib/loyalty/service";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * Prerendered, but refreshed hourly: the headline names the current offer,
 * which lives in the database. Changing the reward there updates this page
 * on its own rather than leaving it advertising last month's discount.
 */
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.loyalty" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: alternatesFor("/loyalty", locale),
  };
}

export default async function LoyaltyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "loyalty" });
  const reward = await getActiveReward();

  const steps = [t("step1"), t("step2"), t("step3"), t("step4")];

  return (
    <>
      <PageHeader
        title={t("title", { reward: locale === "en" ? reward.en : reward.es })}
        lede={t("lede")}
      />

      <section className="section bg-pearl text-ink">
        <div className="wrap grid gap-12 lg:grid-cols-[0.85fr_1fr] lg:items-start lg:gap-16">
          <div className="grid content-start gap-6">
            <h2 className="t-heading">{t("howTitle")}</h2>
            {/* Numbered because the order is the whole point of the
                programme — four unordered lines would not say "then". */}
            <ol className="grid gap-4">
              {steps.map((step, index) => (
                <li key={step} className="flex gap-4">
                  <span className="t-caption pt-1 text-steel tabular-nums">
                    0{index + 1}
                  </span>
                  <span className="t-sub">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="grid content-start gap-6">
            <h2 className="t-heading">{t("formTitle")}</h2>
            <JoinForm />
          </div>
        </div>
      </section>
    </>
  );
}
