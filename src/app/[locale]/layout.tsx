import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Onest, DM_Mono } from "next/font/google";

import { routing } from "@/i18n/routing";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { Preloader, preloadFlagScript } from "@/components/motion/Preloader";
import { VaporBeams } from "@/components/motion/VaporBeams";
import { SmoothScrollProvider } from "@/components/motion/SmoothScrollProvider";
import "../globals.css";

/** Swap for the real domain once it is registered. */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vaporix.es";

const onest = Onest({
  subsets: ["latin"],
  variable: "--font-onest",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
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
      className={`${onest.variable} ${dmMono.variable}`}
      // The pre-paint script below stamps data-preloaded on this element.
      suppressHydrationWarning
    >
      <head>
        {/* Runs before first paint so a repeat visit never flashes the curtain. */}
        <script dangerouslySetInnerHTML={{ __html: preloadFlagScript }} />
      </head>
      <body>
        <NextIntlClientProvider>
          <Preloader />
          <VaporBeams />
          <Nav />
          <SmoothScrollProvider>
            <main>{children}</main>
            <Footer />
          </SmoothScrollProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
