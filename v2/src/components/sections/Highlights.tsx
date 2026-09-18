import { useTranslations } from "next-intl";
import { HighlightIcon, type HighlightIconId } from "@/components/ui/HighlightIcon";

const items: { key: string; icon: HighlightIconId }[] = [
  { key: "price", icon: "price" },
  { key: "reply", icon: "chat" },
  { key: "time", icon: "clock" },
  { key: "everyday", icon: "calendar" },
];

/**
 * Four reasons to book, each one already said somewhere else on the site —
 * the flat price in `vehicles.lede`, the same-day WhatsApp reply in
 * `pages.contact.lede`, the unhurried pace in `pages.about.body`, the seven-day
 * week in `site.hours`. This just surfaces them together, right after the hero
 * and before the price list gives the first of them a number.
 *
 * The Google rating used to be the fourth card. It is not a claim any more —
 * `Reviews` further down carries the score with the reviews it comes from —
 * so the slot went to the fact a visitor cannot get anywhere else on this
 * screen: that Sunday is a working day here.
 *
 * Blue band, white type. It is the first thing under the hero photograph, and
 * on white it read as preamble; on the accent it reads as the site's own
 * voice, and it hands the page back to white at the price list.
 *
 * One row of four on a wide screen, two by two on a phone — all four fit in
 * one glance instead of a column you have to scroll through.
 */
export function Highlights() {
  const t = useTranslations("highlights");

  return (
    <section id="highlights" className="section bg-navy text-pearl">
      <div className="wrap">
        <header className="mb-12 max-w-[44ch]">
          <h2 className="t-display">{t("title")}</h2>
        </header>

        <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
          {items.map(({ key, icon }) => (
            <div key={key}>
              <HighlightIcon id={icon} className="mb-4 size-8 sm:mb-5 sm:size-10" />
              <h3 className="t-heading mb-2">{t(`items.${key}.title`)}</h3>
              <p className="t-body text-muted-invert">{t(`items.${key}.body`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
