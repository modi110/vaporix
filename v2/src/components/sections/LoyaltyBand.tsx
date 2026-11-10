import { getLocale, getTranslations } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { absoluteUrl } from "@/i18n/urls";
import { ButtonLink } from "@/components/ui/Button";
import { ComingSoonStamp } from "@/components/loyalty/ComingSoonStamp";
import { DemoPass } from "@/components/loyalty/DemoPass";
import { renderQrSvg } from "@/lib/loyalty/qr";

/**
 * The loyalty card on the home page, after the highlights and before the
 * prices (owner's choice, 10 November 2026).
 *
 * The card used to rise over the top edge into the white prices band above.
 * The band above is now the navy highlights, where it would cover their text,
 * so the card stays inside its own band. It stamps itself full when scrolled
 * to, once.
 */
export async function LoyaltyBand() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("loyaltyBand");
  const qrSvg = await renderQrSvg(absoluteUrl("/loyalty", locale));

  return (
    <section className="band-grain section relative text-pearl">
      <div className="wrap grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div className="relative justify-self-center">
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
