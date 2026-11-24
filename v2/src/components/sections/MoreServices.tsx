import { useTranslations } from "next-intl";
import { ButtonLink } from "@/components/ui/Button";

/**
 * The mechanics side of the business, in one line and a link to `/services`.
 *
 * It used to list every job with an icon, but the offers band higher up now
 * carries the mechanics pack, and the full list lives on `/services` — a third
 * copy here was the home page repeating itself. What is left is the pointer.
 *
 * A strip, not a full section: deep blue between the white reviews and the
 * navy map, the same step-darker device the offers band uses, so it reads as
 * its own band without the padding of one.
 */
export function MoreServices() {
  const m = useTranslations("mechanics");
  const w = useTranslations("work");

  return (
    <section className="bg-giallo-deep py-10 text-pearl md:py-12">
      <div className="wrap flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-10">
        <p className="t-heading">
          {m("title")}
          {/* Pearl at 80%, not muted-invert: the grey is too faint on this
              blue for a line someone is meant to read. */}
          <span className="text-pearl/80"> · {m("tagline")}</span>
        </p>
        <ButtonLink href="/services" variant="white" className="self-start md:self-auto">
          {w("moreServices")}
        </ButtonLink>
      </div>
    </section>
  );
}
