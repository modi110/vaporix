import type { ReactNode } from "react";

/**
 * The real shell lives in `[locale]/layout.tsx`; this root exists only because
 * Next requires one. It deliberately renders no <html> of its own.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
