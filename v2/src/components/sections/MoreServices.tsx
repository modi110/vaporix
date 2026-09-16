import { useTranslations } from "next-intl";
import { ButtonLink } from "@/components/ui/Button";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { services } from "@/content/services";

/**
 * The mechanics side of the business: the brand line, then every job as an
 * icon and its name, then a pointer to `/services`. The names are the same
 * strings that page lists (`pages.services.items`), so the two cannot
 * promise different things.
 *
 * The dark band between two light ones: `work` and `studio` either side are
 * both light, and a home page that is four light sections deep by this point
 * (highlights, prices, work) needs the break as much as this section needs
 * the contrast for its own button.
 */
export function MoreServices() {
  const m = useTranslations("mechanics");
  const p = useTranslations("pages.services");
  const w = useTranslations("work");

  return (
    <section className="section bg-navy text-pearl">
      <div className="wrap">
        <p className="t-sub mb-2 font-medium">{m("label")}</p>
        <h2 className="t-display mb-3 max-w-[18ch]">{m("title")}</h2>
        {/* Pearl, not muted-invert: the grey is ~3:1 on this blue at this size. */}
        <p className="t-sub mb-12 text-pearl">{m("tagline")}</p>

        <ul className="mb-12 grid grid-cols-3 gap-x-4 gap-y-8 md:grid-cols-5 lg:grid-cols-9">
          {services.map((id) => (
            <li key={id} className="flex flex-col items-start gap-3">
              <ServiceIcon id={id} className="size-9" />
              {/* Not `t-caption`: 12px of condensed uppercase is under the
                  legible floor for a name someone actually has to read. */}
              <span className="text-sm uppercase leading-snug">
                {p(`items.${id}`)}
              </span>
            </li>
          ))}
        </ul>

        <ButtonLink href="/services" variant="white">
          {w("moreServices")}
        </ButtonLink>
      </div>
    </section>
  );
}
