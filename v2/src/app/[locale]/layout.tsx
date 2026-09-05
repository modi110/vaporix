import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Barlow_Condensed } from "next/font/google";

import { routing } from "@/i18n/routing";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { Preloader, preloadFlagScript } from "@/components/motion/Preloader";
import { TransitionOverlay } from "@/components/motion/TransitionOverlay";
import "../globals.css";

/** Swap for the real domain once it is registered. */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vaporix.es";

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
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.home" });

  return {
    metadataBase: new URL(SITE_URL),
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}`,
      // Absolute URLs — search engines ignore relative hreflang.
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}`])),
    },
    openGraph: {
      type: "website",
      locale,
      url: `/${locale}`,
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
