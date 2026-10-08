import type { Metadata } from "next";
import { Barlow_Condensed } from "next/font/google";

import { manrope } from "@/lib/fonts";
import "../globals.css";
import "@/components/loyalty/loyalty-pass.css";
import "./staff.css";

/**
 * A second root layout.
 *
 * `src/app/layout.tsx` deliberately renders no <html> of its own, so each
 * top-level area supplies one — the public site does it in `[locale]/layout`,
 * and this is the staff equivalent. Nothing from the marketing shell belongs
 * here: no preloader curtain, no page-transition overlay, no nav, no footer.
 * This is a tool someone uses forty times a day with wet hands.
 */
const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-barlow-condensed",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vaporix · Personal",
  robots: { index: false, follow: false },
};

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${barlow.variable} ${manrope.variable}`}>
      <body className="staff-body">{children}</body>
    </html>
  );
}
