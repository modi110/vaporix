import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { routing, type Locale } from "@/i18n/routing";
import { absoluteUrl, alternatesFor } from "@/i18n/urls";
import { ButtonAnchor } from "@/components/ui/Button";
import { DemoPass } from "@/components/loyalty/DemoPass";
import { JoinForm } from "@/components/loyalty/JoinForm";
import { renderQrSvg } from "@/lib/loyalty/qr";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.loyalty" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: alternatesFor("/loyalty", locale),
  };
}

/** The three steps, each drawn with the card's own sprite for that moment. */
const STEPS = [
  { key: "join", image: "/images/card/stamp-off.png" },
  { key: "show", image: "/images/card/stamp-on.png" },
  { key: "free", image: "/images/card/gift-on.png" },
] as const;

function Check() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
      className="size-4 shrink-0"
    >
      <path d="M3 8.5l3.2 3L13 4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * The loyalty programme: what you get, how it works, sign up.
 *
 * Led by the card itself. The earlier page asked for a name and a phone
 * number before showing anything, and the card — the best picture the
 * programme has — only appeared after signing up. Now it is the first thing
 * on screen, stamping its way to the free wash, and it hangs over the edge
 * of the blue into the steps below so the page reads as one piece rather
 * than a stack of bands.
 *
 * Nothing here reads the database, so the page stays static. The sample card
 * names its reward from the messages, not from `reward_definitions` — see
 * `changing-the-offer.md` for the strings to update with the offer.
 */
export default async function LoyaltyPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "loyalty" });

  // The sample card's QR opens this page: scanning it lands where it should.
  const qrSvg = await renderQrSvg(absoluteUrl("/loyalty", locale));

  return (
    <>
      {/* z-10 so the card hanging off the bottom paints over the next band,
          which comes later in the document and would otherwise cover it. */}
      <section className="band-grain relative z-10 text-pearl">
        <div
          className="wrap grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10"
          style={{ paddingTop: "calc(env(safe-area-inset-top) + 7.5rem)" }}
        >
          <div className="lg:pb-[var(--pad-section)]">
            <h1 className="t-display-lg max-w-[13ch] text-balance text-pearl/80">
              {t.rich("title", {
                // The payoff gets its own line and full white; the setup
                // steps back a shade so the eye lands on "free".
                b: (chunks) => (
                  <span className="mt-1 block text-pearl">{chunks}</span>
                ),
              })}
            </h1>
            <p className="mt-7 max-w-[44ch] text-lg leading-relaxed tracking-normal text-muted-invert">
              {t("lede")}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonAnchor href="#join" variant="white">
                {t("ctaJoin")}
              </ButtonAnchor>
              <ButtonAnchor
                href="#how"
                variant="outlined"
                arrow={false}
                className="border-pearl/50 text-pearl"
              >
                {t("ctaHow")}
              </ButtonAnchor>
            </div>
          </div>

          <div className="-mb-44 justify-self-center lg:-mb-40 lg:self-end lg:justify-self-end">
            <DemoPass
              qrSvg={qrSvg}
              className="w-[min(76vw,340px)] -rotate-[5deg] lg:w-[360px]"
            />
          </div>
        </div>
      </section>

      <section
        id="how"
        // The extra top padding clears the card hanging into this band.
        className="section scroll-mt-20 bg-pearl !pt-[calc(var(--pad-section)+12rem)] text-ink lg:!pt-[calc(var(--pad-section)+11rem)]"
      >
        <div className="wrap">
          <h2 className="t-display max-w-[16ch]">{t("howTitle")}</h2>

          <ol className="relative mt-14 grid gap-12 md:grid-cols-3 md:gap-10">
            {/* One rail through all three stamps: the steps are a sequence,
                and the line says so without numbering them. */}
            <span
              aria-hidden="true"
              className="absolute bottom-9 left-9 top-9 w-px bg-hairline md:bottom-auto md:left-9 md:right-9 md:top-9 md:h-px md:w-auto"
            />
            {STEPS.map(({ key, image }) => (
              <li
                key={key}
                className="relative grid grid-cols-[4.5rem_1fr] items-start gap-5 md:grid-cols-1 md:gap-7"
              >
                {/* The card's sprites are drawn for its blue, so each sits on
                    a disc of that blue rather than on the white page. */}
                <span className="grid size-[4.5rem] place-items-center rounded-full bg-navy">
                  <Image
                    src={image}
                    alt=""
                    width={140}
                    height={140}
                    className="size-12"
                  />
                </span>
                <div>
                  <h3 className="t-heading">{t(`steps.${key}.title`)}</h3>
                  <p className="t-body mt-2 text-muted">
                    {t(`steps.${key}.body`)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="join" className="scroll-mt-16 bg-pearl pb-[var(--pad-section)] text-ink">
        <div className="wrap">
          <div className="grid border border-hairline/40 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="band-grain relative px-6 py-10 text-pearl sm:px-10 lg:px-12 lg:py-14">
              <h2 className="t-display">{t("formTitle")}</h2>
              <p className="mt-3 text-lg tracking-normal text-muted-invert">
                {t("formLede")}
              </p>
              <ul className="mt-9 grid gap-4">
                {(["free", "noApp", "instant"] as const).map((perk) => (
                  <li key={perk} className="t-sub flex items-center gap-3">
                    <span className="grid size-7 place-items-center rounded-full border border-pearl/50">
                      <Check />
                    </span>
                    {t(`perks.${perk}`)}
                  </li>
                ))}
              </ul>
              {/* The free wash, breaking out of the panel's corner. */}
              <Image
                src="/images/card/gift-on.png"
                alt=""
                width={140}
                height={140}
                className="pointer-events-none absolute -right-5 -top-8 size-20 rotate-12 drop-shadow-[0_10px_14px_rgba(0,25,70,0.35)] sm:size-24 lg:-right-8 lg:-top-10"
              />
            </div>

            <div className="bg-pearl px-6 py-10 sm:px-10 lg:px-12 lg:py-14">
              <JoinForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
