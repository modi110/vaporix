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
 * One button in the top bar, labelled with the language it switches *to* —
 * with only two locales a pair of buttons spends half its space on the one
 * you are already reading. The accessible name is written in the target
 * language, so a screen reader announces it the way its speaker would.
 */
export function LocaleSwitcher({ className = "" }: { className?: string }) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [pending, startTransition] = useTransition();

  const next = routing.locales.find((l) => l !== locale) ?? locale;

  return (
    <button
      type="button"
      disabled={pending}
      lang={next}
      aria-label={t("switchLocale")}
      onClick={() =>
        startTransition(() => {
          router.replace(
            // @ts-expect-error -- params carry the dynamic segments for
            // whichever route is current; next-intl re-resolves them.
            { pathname, params },
            { locale: next },
          );
        })
      }
      // The ring is 36px but the button around it stays a 44px target: the
      // bar cannot afford a control that looks as heavy as the booking
      // button, and a thumb still should not have to aim.
      className={`group grid min-h-11 min-w-11 place-items-center text-[0.6875rem] font-medium uppercase tracking-[0.023em] text-pearl transition-opacity duration-150 disabled:opacity-50 ${className}`}
    >
      <span className="grid size-9 place-items-center rounded-full border border-steel transition-colors duration-150 group-hover:border-pearl group-active:border-pearl">
        {next.toUpperCase()}
      </span>
    </button>
  );
}
