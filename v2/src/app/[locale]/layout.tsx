import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Barlow_Condensed } from "next/font/google";
import Script from "next/script";

import { routing, type Locale } from "@/i18n/routing";
import { siteUrl } from "@/content/site";
import { alternatesFor, localizedPath } from "@/i18n/urls";
import { LocalBusinessJsonLd } from "@/components/seo/LocalBusinessJsonLd";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { Preloader, preloadFlagScript } from "@/components/motion/Preloader";
import { TransitionOverlay } from "@/components/motion/TransitionOverlay";
import "../globals.css";

/**
 * LamboType is not licensable, and design.md names Barlow Condensed as the
 * substitute: the same tall industrial proportions, and it carries the
 * accented capitals Spanish needs in a page set entirely in uppercase —
 * GALERÍA and MENÚ have to render properly.
 *
 * One family, one weight. The type system gets its hierarchy from scale
 * alone, which is the signature of the direction rather than a limitation.
 */
const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-barlow-condensed",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.home" });

  return {
    metadataBase: new URL(siteUrl),
    title: t("title"),
    description: t("description"),
    alternates: alternatesFor("/", locale),
    openGraph: {
      type: "website",
      locale,
      url: localizedPath("/", locale),
      siteName: "Vaporix",
      title: t("title"),
      description: t("description"),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Required in every layout and page, or the route silently goes dynamic.
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "meta.home" });

  return (
    <html
      lang={locale}
      className={barlow.variable}
      // The pre-paint script below stamps data-preloaded here.
      suppressHydrationWarning
    >
      <head>
        {/* Runs before first paint so a repeat visit never replays the curtain. */}
        <script dangerouslySetInnerHTML={{ __html: preloadFlagScript }} />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18451422598"
          strategy="afterInteractive"
        />
        <Script id="google-ads-gtag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-18451422598');
          `}
        </Script>
        <LocalBusinessJsonLd locale={locale} description={t("description")} />
      </head>
      <body>
        <NextIntlClientProvider>
          <Preloader />
          <TransitionOverlay />
          <Nav />
          <main>{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
