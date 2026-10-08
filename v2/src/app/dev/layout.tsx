import type { Metadata } from "next";
import { notFound } from "next/navigation";

import "../globals.css";

/**
 * Development-only previews.
 *
 * A third root layout — `src/app/layout.tsx` renders no <html> of its own, so
 * each top-level area supplies one. Everything under /dev 404s outside
 * development, so these pages cannot reach a real visitor.
 */
export const metadata: Metadata = {
  title: "Vaporix · dev",
  robots: { index: false, follow: false },
};

export default function DevLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <html lang="es">
      <body style={{ background: "#dfe6ef", margin: 0 }}>{children}</body>
    </html>
  );
}
