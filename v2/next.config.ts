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
  allowedDevOrigins: ["100.65.251.29"],

  // The repo sits inside OneDrive, where a stray lockfile further up the tree
  // confuses workspace detection. Pin the root to this project.
  turbopack: {
    root: __dirname,
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default withNextIntl(nextConfig);
