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
    <dl className={`grid gap-2 text-sm ${className}`}>
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
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd
        className={`font-mono tabular-nums ${muted ? "text-muted-dim" : "text-ink"}`}
      >
        {value}
      </dd>
    </div>
  );
}
