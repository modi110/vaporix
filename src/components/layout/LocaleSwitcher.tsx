"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/**
 * Swaps locale while staying on the current page, which means the localized
 * pathname has to be resolved again rather than string-replaced.
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
      className="flex gap-0.5 font-mono text-[0.6875rem] tracking-[0.1em]"
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
            className={`px-2 py-1.5 transition-colors duration-200 ${
              active ? "text-ink" : "text-muted-dim hover:text-muted"
            }`}
          >
            {l.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
