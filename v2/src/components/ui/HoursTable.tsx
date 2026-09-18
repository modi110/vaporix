import { useTranslations } from "next-intl";
import { site } from "@/content/site";

/**
 * The real weekly schedule, shared by the footer, the map band and the
 * contact page so the three never say three different things.
 *
 * `dark` swaps the de-emphasised grey for the one that reads on a dark
 * surface — steel manages 1.4:1 against the site's blue and is close to
 * illegible there, but 4.0:1 on the light sections this also renders on.
 */
export function HoursTable({
  className = "",
  dark = false,
}: {
  className?: string;
  dark?: boolean;
}) {
  const t = useTranslations("hours");
  const { weekdays, saturday, sunday } = site.hours;
  const mutedClass = dark ? "text-muted-invert" : "text-steel";

  return (
    <div className={`grid gap-3 ${className}`}>
      <dl className="grid gap-2 text-sm uppercase">
        <Row
          label={t("weekdays")}
          value={`${weekdays.open} – ${weekdays.close}`}
          mutedClass={mutedClass}
        />
        <Row
          label={t("saturday")}
          value={`${saturday.open} – ${saturday.close}`}
          mutedClass={mutedClass}
        />
        <Row
          label={t("sunday")}
          value={`${sunday.open} – ${sunday.close}`}
          mutedClass={mutedClass}
        />
      </dl>

      {/*
        The one line the schedule cannot say by itself. Row by row, three open
        windows read as three separate facts; a visitor scanning for "are they
        open on a Sunday" needs the answer stated, not inferred.
      */}
      <p className={`text-sm ${mutedClass}`}>{t("everyday")}</p>
    </div>
  );
}

function Row({
  label,
  value,
  mutedClass,
}: {
  label: string;
  value: string;
  mutedClass: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-hairline-dark pb-2 last:border-0">
      <dt className={mutedClass}>{label}</dt>
      <dd className="tabular-nums text-current">{value}</dd>
    </div>
  );
}
