import { useTranslations } from "next-intl";
import { HighlightIcon, type HighlightIconId } from "@/components/ui/HighlightIcon";

const items: { key: string; icon: HighlightIconId }[] = [
  { key: "price", icon: "price" },
  { key: "reply", icon: "chat" },
  { key: "time", icon: "clock" },
  { key: "rating", icon: "star" },
];

/**
 * Four reasons to book, each one already said somewhere else on the site —
 * the flat price in `vehicles.lede`, the same-day WhatsApp reply in
 * `pages.contact.lede`, the unhurried pace in `pages.about.body`, the 5.0
 * rating in `site.rating`. This just surfaces them together, right after the
 * hero and before the price list gives the first of them a number.
 *
 * One row of four on a wide screen, two by two on a phone — all four fit in
 * one glance instead of a column you have to scroll through.
 */
export function Highlights() {
  const t = useTranslations("highlights");

  return (
    <section id="highlights" className="section bg-pearl text-ink">
      <div className="wrap">
        <header className="mb-12 max-w-[44ch]">
          <h2 className="t-display mb-4">{t("title")}</h2>
          <p className="t-body text-muted">{t("lede")}</p>
        </header>

        <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
          {items.map(({ key, icon }) => (
            <div key={key}>
              <HighlightIcon id={icon} className="mb-4 size-8 sm:mb-5 sm:size-10" />
              <h3 className="t-heading mb-2">{t(`items.${key}.title`)}</h3>
              <p className="t-body text-muted">{t(`items.${key}.body`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
