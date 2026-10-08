"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/Button";
import { joinLoyalty, type JoinState } from "@/lib/loyalty/actions";

/**
 * The one form on the site.
 *
 * Hard edges and a hairline underline rather than a boxed input — the design
 * system has no radii and no shadows anywhere, and a default browser input
 * would be the only rounded thing on the page.
 */
const FIELD =
  "min-h-11 w-full rounded-none border-0 border-b border-hairline bg-transparent " +
  "px-0 py-2.5 text-base text-ink outline-none transition-colors " +
  "placeholder:text-steel focus:border-ink";

const LABEL = "t-caption text-steel";

const INITIAL: JoinState = { error: null };

export function JoinForm() {
  const t = useTranslations("loyalty");
  const [state, formAction, pending] = useActionState(joinLoyalty, INITIAL);

  return (
    <form action={formAction} className="grid max-w-md gap-7">
      <div className="grid gap-2">
        <label className={LABEL} htmlFor="name">
          {t("name")}
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          maxLength={80}
          placeholder={t("namePlaceholder")}
          className={FIELD}
        />
      </div>

      <div className="grid gap-2">
        <label className={LABEL} htmlFor="phone">
          {t("phone")}
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          inputMode="tel"
          placeholder={t("phonePlaceholder")}
          className={`${FIELD} tabular-nums`}
        />
      </div>

      <div className="grid gap-2">
        <label className={LABEL} htmlFor="email">
          {t("email")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
          className={FIELD}
        />
      </div>

      {/* Announced rather than merely coloured: the palette is one blue, so
          colour alone could not carry an error state here anyway. */}
      {state.error ? (
        <p role="alert" className="t-sub text-giallo-deep">
          {t(state.error)}
        </p>
      ) : null}

      <div className="mt-1">
        <Button type="submit" disabled={pending}>
          {pending ? t("submitting") : t("submit")}
        </Button>
      </div>

      <p className="t-caption text-steel">{t("privacy")}</p>
    </form>
  );
}
