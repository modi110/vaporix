"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/**
 * Swaps locale while staying on the current page, which means the localized
 * pathname has to be resolved again rather than string-replaced.
 *
 * Lives in the menu sheet, not the top bar — the bar is already a hamburger,
 * a centred mark and a booking button, and ES/EN is a rarer choice than any
 * of those. Sized to match the sheet's own buttons rather than the compact
 * treatment a top-bar spot would need.
 */
export function LocaleSwitcher() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [pending, startTransition] = useTransition();

  return (
    <div
      role="group"
      aria-label={t("language")}
      className="grid grid-cols-2 gap-3"
    >
      {routing.locales.map((l) => {
        const active = l === locale;
        return (
          <button
            key={l}
            type="button"
            disabled={active || pending}
            aria-current={active ? "true" : undefined}
            onClick={() =>
              startTransition(() => {
                router.replace(
                  // @ts-expect-error -- params carry the dynamic segments for
                  // whichever route is current; next-intl re-resolves them.
                  { pathname, params },
                  { locale: l },
                );
              })
            }
            className={`min-h-11 border py-3 text-xs font-medium uppercase tracking-[0.023em] transition-colors duration-150 ${
              active
                ? "border-pearl text-pearl"
                : "border-hairline-dark text-steel hover:border-pearl hover:text-pearl"
            }`}
          >
            {l.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
