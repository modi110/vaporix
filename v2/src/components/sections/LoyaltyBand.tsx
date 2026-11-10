import { getLocale, getTranslations } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { absoluteUrl } from "@/i18n/urls";
import { ButtonLink } from "@/components/ui/Button";
import { ComingSoonStamp } from "@/components/loyalty/ComingSoonStamp";
import { DemoPass } from "@/components/loyalty/DemoPass";
import { renderQrSvg } from "@/lib/loyalty/qr";

/**
 * The loyalty card on the home page, right after the prices — the moment a
 * visitor has just read what a wash costs is the moment "the fifth is free"
 * means something.
 *
 * The card is the picture, and it does not stay inside the band: on a wide
 * screen it rises over the top edge into the white above, so the home page
 * stops reading as a stack of same-width boxes. It stamps itself full when
 * scrolled to, once.
 *
 * Blue with grain between two white sections (prices, the work), which is
 * also the break that run of white needed.
 */
export async function LoyaltyBand() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("loyaltyBand");
  const qrSvg = await renderQrSvg(absoluteUrl("/loyalty", locale));

  return (
    <section className="band-grain section relative text-pearl">
      <div className="wrap grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div className="relative justify-self-center lg:-mt-[calc(var(--pad-section)+10.5rem)]">
          <DemoPass
            qrSvg={qrSvg}
            className="w-[min(72vw,300px)] rotate-[4deg] lg:w-[330px]"
          />
          <ComingSoonStamp
            label={t("soon")}
            className="absolute -left-4 top-[38%] bg-giallo-deep/85 shadow-[0_10px_24px_rgba(0,25,70,0.35)] sm:-left-8"
          />
        </div>

        <div className="max-lg:row-start-1">
          <h2 className="t-display-lg max-w-[14ch] text-balance">{t("title")}</h2>
          <p className="mt-6 max-w-[42ch] text-lg leading-relaxed tracking-normal text-muted-invert">
            {t("body")}
          </p>
          <ButtonLink href="/loyalty" variant="white" className="mt-9">
            {t("cta")}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
