import { defineRouting } from "next-intl/routing";

/**
 * Spanish is the primary market, so `es` is the default locale.
 * `localePrefix: "always"` keeps both languages on canonical, shareable
 * URLs, which is what lets hreflang work properly for either audience.
 */
export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
  localePrefix: "always",
  pathnames: {
    "/": "/",
    "/services": {
      es: "/servicios",
      en: "/services",
    },
    "/services/[slug]": {
      es: "/servicios/[slug]",
      en: "/services/[slug]",
    },
    "/gallery": {
      es: "/galeria",
      en: "/gallery",
    },
    "/account": {
      es: "/mi-cuenta",
      en: "/account",
    },
    "/about": {
      es: "/nosotros",
      en: "/about",
    },
    "/pricing": {
      es: "/precios",
      en: "/pricing",
    },
    "/contact": {
      es: "/contacto",
      en: "/contact",
    },
    "/book": {
      es: "/reservar",
      en: "/book",
    },
  },
});

export type Locale = (typeof routing.locales)[number];
export type AppPathname = keyof typeof routing.pathnames;

/** Routes with no dynamic segments — safe to pass to <Link href> as a bare string. */
export type StaticPathname = Exclude<AppPathname, `${string}[${string}`>;
