import { useTranslations } from "next-intl";
import { ButtonAnchor } from "@/components/ui/Button";
import { HoursTable } from "@/components/ui/HoursTable";
import { site } from "@/content/site";

/**
 * Where the studio actually is.
 *
 * The map is Google's keyless embed rather than the Maps JavaScript API: no
 * key to leak, no billing account to keep alive, nothing to break when a key
 * rotates. The trade is that it cannot be restyled, so a CSS filter inverts it
 * to sit on the navy band instead of punching a white hole in it.
 *
 * `loading="lazy"` matters: this is near the end of the page and would
 * otherwise pull Google's payload into the initial load.
 */
export function MapBand() {
  const t = useTranslations("map");

  return (
    <section className="section bg-navy text-pearl" id="map">
      <div className="wrap">
        <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-stretch lg:gap-14">
          <div className="grid content-start gap-7">
            <h2 className="t-display max-w-[13ch]">{t("title")}</h2>

            <div className="grid gap-1">
              <p className="t-sub">{site.address.street}</p>
              <p className="t-sub text-muted-invert">
                {site.address.postcode} {site.address.city},{" "}
                {site.address.region}
              </p>
            </div>

            <div className="grid gap-5 border-t border-hairline-dark pt-6">
              <HoursTable dark />
              <p className="flex items-baseline justify-between gap-6 text-sm uppercase">
                <span className="text-steel">{t("phone")}</span>
                <a
                  href={site.phoneHref}
                  // Opacity, not a colour shift: this section is the accent
                  // colour, so `hover:text-giallo` would step from white to
                  // the same blue as the band behind it.
                  className="tabular-nums transition-opacity hover:opacity-70"
                >
                  {site.phone}
                </a>
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <ButtonAnchor
                href={site.mapsUrl}
                variant="outlined"
                className="text-pearl"
              >
                {t("directions")}
              </ButtonAnchor>
              <ButtonAnchor href={site.whatsapp} variant="ghost">
                WhatsApp
              </ButtonAnchor>
            </div>
          </div>

          <div className="relative min-h-[340px] overflow-hidden border border-hairline-dark lg:min-h-[440px]">
            <iframe
              src={site.mapEmbedUrl}
              title={t("iframeTitle", { name: site.legalName })}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="map-embed absolute inset-0 size-full border-0"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
