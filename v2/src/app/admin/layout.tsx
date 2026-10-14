import type { Metadata } from "next";
import { Barlow_Condensed } from "next/font/google";

import { manrope } from "@/lib/fonts";
import "../globals.css";
import "../staff/staff.css";
import "./admin.css";

/**
 * A third root layout, for the same reason as the staff one: `app/layout.tsx`
 * renders no <html>, so each top-level area supplies its own. The admin view
 * borrows the staff tool's stylesheet rather than copying its tokens — one
 * product, one palette, one definition.
 */
const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-barlow-condensed",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vaporix · Administración",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
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
