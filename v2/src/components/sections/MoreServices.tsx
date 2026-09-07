import { useTranslations } from "next-intl";
import { ButtonLink } from "@/components/ui/Button";

/**
 * A pointer to `/services`, not a preview of it — title and lede are the
 * same two lines that page opens with (`pages.services.title/lede`), so
 * nobody reads a promise here that the page itself doesn't keep.
 *
 * The dark band between two light ones: `work` and `studio` either side are
 * both light, and a home page that is four light sections deep by this point
 * (highlights, prices, work) needs the break as much as this section needs
 * the contrast for its own button.
 */
export function MoreServices() {
  const p = useTranslations("pages.services");
  const w = useTranslations("work");

  return (
    <section className="section bg-navy text-pearl">
      <div className="wrap">
        <h2 className="t-display mb-4 max-w-[18ch]">{p("title")}</h2>
        <p className="t-body mb-8 max-w-[50ch] text-muted-invert">
          {p("lede")}
        </p>
        <ButtonLink href="/services">{w("moreServices")}</ButtonLink>
      </div>
    </section>
  );
}
