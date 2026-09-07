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
  const { weekdays, saturday } = site.hours;
  const mutedClass = dark ? "text-muted-invert" : "text-steel";

  return (
    <dl className={`grid gap-2 text-sm uppercase ${className}`}>
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
      <Row label={t("sunday")} value={t("closed")} mutedClass={mutedClass} muted />
    </dl>
  );
}

function Row({
  label,
  value,
  mutedClass,
  muted = false,
}: {
  label: string;
  value: string;
  mutedClass: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-hairline-dark pb-2 last:border-0">
      <dt className={mutedClass}>{label}</dt>
      <dd className={`tabular-nums ${muted ? mutedClass : "text-current"}`}>
        {value}
      </dd>
    </div>
  );
}
