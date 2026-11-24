import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  /**
   * Hosts allowed to pull `/_next/*` from the dev server.
   *
   * Next blocks cross-origin dev requests by default. Testing on a phone
   * means loading the page from this machine's network address rather than
   * localhost, and without this the HTML renders while every JavaScript
   * chunk is refused — the page looks built but nothing on it responds: no
   * menu, no swipe, no carousel. Dev only; production is unaffected.
   *
   * Add whatever address `next dev` prints as "Network" if it changes.
   */
  allowedDevOrigins: ["100.65.251.29", "*.trycloudflare.com"],

  // The repo sits inside OneDrive, where a stray lockfile further up the tree
  // confuses workspace detection. Pin the root to this project.
  turbopack: {
    root: __dirname,
  },
  // The Apple pass routes read their images with fs at runtime, which the
  // build's file tracing cannot see on its own.
  outputFileTracingIncludes: {
    "/api/wallet/apple": ["./src/lib/wallet/apple-assets/**/*"],
    "/api/wallet/apple/v1/passes/[passTypeId]/[serial]": [
      "./src/lib/wallet/apple-assets/**/*",
    ],
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  /**
   * Contact was folded into Book (22 November 2026): one page for calling,
   * WhatsApp, the address, hours and the map. The old addresses stay alive
   * as permanent redirects so shared links and search results still land.
   * Unprefixed `/contacto` and `/contact` need no rule of their own: the
   * proxy adds the locale first and the result lands on one of these.
   * Redirects run before the proxy, so these win over locale handling.
   */
  async redirects() {
    return [
      { source: "/es/contacto", destination: "/es/reservar", permanent: true },
      { source: "/es/contact", destination: "/es/reservar", permanent: true },
      { source: "/en/contact", destination: "/en/book", permanent: true },
      { source: "/en/contacto", destination: "/en/book", permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);
