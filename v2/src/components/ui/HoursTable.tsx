import { useTranslations } from "next-intl";
import { site } from "@/content/site";

/**
 * The real weekly schedule, shared by the footer, the map band and the
 * contact page so the three never say three different things.
 */
export function HoursTable({ className = "" }: { className?: string }) {
  const t = useTranslations("hours");
  const { weekdays, saturday } = site.hours;

  return (
    <dl className={`grid gap-2 text-sm uppercase ${className}`}>
      <Row label={t("weekdays")} value={`${weekdays.open} – ${weekdays.close}`} />
      <Row label={t("saturday")} value={`${saturday.open} – ${saturday.close}`} />
      <Row label={t("sunday")} value={t("closed")} muted />
    </dl>
  );
}

function Row({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-hairline-dark pb-2 last:border-0">
      <dt className="text-steel">{label}</dt>
      <dd className={`tabular-nums ${muted ? "text-steel" : "text-current"}`}>
        {value}
      </dd>
    </div>
  );
}
