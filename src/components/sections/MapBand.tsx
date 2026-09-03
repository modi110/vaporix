import { useTranslations } from "next-intl";
import { PillAnchor } from "@/components/ui/PillButton";
import { HoursTable } from "@/components/ui/HoursTable";
import { site } from "@/content/site";

/**
 * Where the studio actually is, closing the home page.
 *
 * The map is Google's keyless embed rather than the Maps JavaScript API: no
 * key to leak, no billing account to keep alive, and nothing to break when a
 * key rotates. The trade is that it cannot be restyled, so a dark-theme CSS
 * filter inverts it and a thin cyan wash sits on top. The wash lifts on
 * hover: the map reads as part of the page until you reach for it.
 *
 * `loading="lazy"` matters here: this is the last thing on the page and it
 * would otherwise pull Google's payload into the initial load.
 */
export function MapBand() {
  const t = useTranslations("map");

  return (
    <section className="section pt-0" id="map">
      <div className="wrap">
        <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-stretch lg:gap-14">
          <div className="grid content-start gap-7" data-reveal>
            <p className="t-label">{t("label")}</p>
            <h2 className="t-h2 max-w-[13ch]">{t("title")}</h2>

            <div className="grid gap-1.5">
              <p className="text-lg leading-snug">{site.address.street}</p>
              <p className="text-lg leading-snug text-muted">
                {site.address.postcode} {site.address.city},{" "}
                {site.address.region}
              </p>
            </div>

            <div className="grid gap-4 border-t border-hairline pt-6">
              <HoursTable />
              <p className="flex items-baseline justify-between gap-6 text-sm">
                <span className="t-label">{t("phone")}</span>
                <a
                  href={site.phoneHref}
                  className="font-mono text-ink hover:text-vapor-ink"
                >
                  {site.phone}
                </a>
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <PillAnchor href={site.mapsUrl}>{t("directions")}</PillAnchor>
              <PillAnchor href={site.whatsapp} variant="ghost">
                WhatsApp
              </PillAnchor>
            </div>
          </div>

          <div
            data-clip
            className="group relative min-h-[340px] overflow-hidden rounded-card border border-hairline lg:min-h-[440px]"
          >
            <iframe
              src={site.mapEmbedUrl}
              title={t("iframeTitle", { name: site.legalName })}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="map-embed absolute inset-0 size-full border-0"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[rgba(var(--vapor-rgb),0.12)] transition-opacity duration-500 group-hover:opacity-0"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
