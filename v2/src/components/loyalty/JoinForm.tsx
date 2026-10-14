"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/Button";
import {
  joinLoyalty,
  type JoinField,
  type JoinState,
} from "@/lib/loyalty/actions";

/**
 * The one form on the site.
 *
 * Hard edges and a hairline underline rather than a boxed input — the design
 * system has no radii and no shadows, and a default browser input would be
 * the only rounded thing on the panel.
 *
 * Every field keeps what was typed when the server refuses it, and the
 * refusal sits under the field it is about, not in a line at the bottom the
 * visitor has to map back to a field themselves.
 */
const FIELD =
  "min-h-12 w-full rounded-none border-0 border-b-2 border-hairline bg-transparent " +
  "px-0 py-2.5 text-lg text-ink outline-none transition-colors " +
  // #6b6b6b: light enough to read as an example, still 5.3:1 on white.
  "placeholder:text-[#6b6b6b] focus:border-ink aria-[invalid=true]:border-giallo-deep";

const LABEL = "t-caption font-medium text-muted";

const INITIAL: JoinState = { error: null };

function AlertIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
      className="mt-[0.2em] size-4 shrink-0"
    >
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 4.5v4.2M8 11v.5" strokeLinecap="round" />
    </svg>
  );
}

export function JoinForm() {
  const t = useTranslations("loyalty");
  const [state, formAction, pending] = useActionState(joinLoyalty, INITIAL);

  const errorFor = (field: JoinField) =>
    state.error && state.field === field ? t(state.error) : null;

  // Errors that belong to no field — the server could not be reached.
  const generalError = state.error && !state.field ? t(state.error) : null;

  return (
    // Keyed on the refused values: React resets a form after its action, and
    // a fresh mount is what puts the typed values back as the defaults.
    <form
      key={JSON.stringify(state.values ?? null)}
      action={formAction}
      noValidate
      className="grid gap-7"
    >
      <Field
        id="name"
        label={t("name")}
        error={errorFor("name")}
      >
        {(describedBy, invalid) => (
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            maxLength={80}
            defaultValue={state.values?.name}
            placeholder={t("namePlaceholder")}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className={FIELD}
          />
        )}
      </Field>

      <Field
        id="phone"
        label={t("phone")}
        hint={t("phoneHint")}
        error={errorFor("phone")}
      >
        {(describedBy, invalid) => (
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            inputMode="tel"
            defaultValue={state.values?.phone}
            placeholder={t("phonePlaceholder")}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className={`${FIELD} tabular-nums`}
          />
        )}
      </Field>

      <Field id="email" label={t("email")} error={errorFor("email")}>
        {(describedBy, invalid) => (
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={state.values?.email}
            placeholder={t("emailPlaceholder")}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className={FIELD}
          />
        )}
      </Field>

      {generalError ? (
        <p role="alert" className="flex gap-2 text-base text-giallo-deep">
          <AlertIcon />
          {generalError}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="w-full sm:w-auto sm:justify-self-start">
        {pending ? t("submitting") : t("submit")}
      </Button>

      {/* Sentence case and the readable grey: this is the one paragraph on
          the form a careful visitor actually reads. */}
      <p className="max-w-[52ch] text-sm leading-relaxed tracking-normal text-muted">
        {t("privacy")}
      </p>
    </form>
  );
}

/** Label, input, then either the hint or the refusal in the same place. */
function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error: string | null;
  children: (describedBy: string | undefined, invalid: boolean) => React.ReactNode;
}) {
  const noteId = `${id}-note`;
  const note = error ?? hint;

  return (
    <div className="grid gap-2">
      <label className={LABEL} htmlFor={id}>
        {label}
      </label>
      {children(note ? noteId : undefined, Boolean(error))}
      {note ? (
        <p
          id={noteId}
          role={error ? "alert" : undefined}
          className={`flex gap-2 text-sm leading-snug tracking-normal ${
            error ? "font-medium text-giallo-deep" : "text-muted"
          }`}
        >
          {error ? <AlertIcon /> : null}
          {note}
        </p>
      ) : null}
    </div>
  );
}
