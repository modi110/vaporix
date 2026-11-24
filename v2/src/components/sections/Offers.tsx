"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { ButtonAnchor, ButtonLink } from "@/components/ui/Button";
import { site, whatsappWith } from "@/content/site";

const items = ["oil", "filter", "check", "itv", "wash"] as const;
const facts = ["week", "noAppointment", "fast"] as const;

/**
 * The workshop's two standing offers: the 99 € maintenance and pre-ITV pack,
 * and half price on batteries with two years' full warranty, both in the
 * client's own words (proposal and flyer; nothing promised here that they
 * did not write). Used on the home page
 * (before the prices), on `/services` and on `/business`.
 *
 * Deep blue (`giallo-deep`, #003474), not the brand blue: on the home page
 * this band sits between the bright-blue loyalty band and the white prices,
 * and a second bright-blue band would merge into the one above it.
 *
 * Rounded panels on the deep blue, one per offer: the pack on white (its
 * price in the brand blue, its contents beside it as a numbered list), the
 * battery offer as a slim strip on the brand blue under it and, on the home
 * variant (home and `/services`), the on-site business wash as an outlined
 * panel beside the battery strip. Kept compact on purpose: the whole band
 * fits about one desktop screen, and the 99 is still its largest thing.
 * This band is the one
 * place on the site with rounded corners, by the owner's call: one scale,
 * `--offer-r` on the panels, a smaller concentric radius inside them, and
 * pills for everything you can press or read as a tag. No photo, no
 * drawing, no shadows.
 *
 * Its entrance is its own (the site-wide reveal skips it, see
 * `data-motion="own"`): once, when scrolled to, the white panel rises, the
 * figure lifts out of a mask, the list stagger follows and the battery
 * panel wipes open. Nothing moves for `prefers-reduced-motion`, and
 * nothing is hidden if the script never runs or the band is already on
 * screen at load.
 */
export function Offers({ variant = "home" }: { variant?: "home" | "business" }) {
  const t = useTranslations("offers");
  const biz = useTranslations("pages.business");
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Already in view at load: show it as it is rather than blink it out.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.85) return;

    el.classList.add("is-armed");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.classList.add("is-in");
        io.disconnect();
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const label = variant === "business" ? t("business.label") : t("label");
  const cta = variant === "business" ? t("business.cta") : t("home.cta");
  const waText =
    variant === "business" ? t("business.waText") : t("home.waText");

  return (
    <section
      ref={ref}
      id="offers"
      data-motion="own"
      className="offers section relative overflow-hidden bg-giallo-deep text-pearl"
    >
      <div className="wrap">
        {/* The band's name on the left, the three facts as tags on the right. */}
        <header className="offer-fade flex flex-col gap-3 pb-4 lg:flex-row lg:items-end lg:justify-between lg:pb-6">
          <div>
            <p className="t-sub font-medium">{label}</p>
            <p className="t-caption text-muted-invert">{t("kicker")}</p>
          </div>
          <ul className="flex flex-wrap gap-2">
            {facts.map((id) => (
              <li
                key={id}
                className="rounded-full border border-pearl/30 px-3 py-1.5 text-xs uppercase leading-tight sm:px-4 sm:py-2"
              >
                {t(`facts.${id}`)}
              </li>
            ))}
          </ul>
        </header>

        {/*
          The pack, on white. Phone and tablet: name, figure, lede, the list,
          then the two ways to ask. Desktop: the list moves beside the figure
          and the buttons stay under it.
        */}
        <div className="offer-pack offer-panel grid bg-pearl p-5 text-giallo sm:p-8 lg:grid-cols-12 lg:gap-x-10 lg:p-10">
          <div className="lg:col-span-6">
            <h2 className="offer-fade t-heading max-w-[24ch] text-balance">
              {t("packName")}
            </h2>

            <p className="offer-price mt-2 flex items-start font-medium leading-[0.8] tabular-nums">
              <span className="offer-digits block text-[clamp(7.5rem,34vw,10rem)] tracking-[-0.03em] lg:text-[clamp(9rem,12.5vw,12rem)]">
                {t("price")}
              </span>
              <span className="offer-cur mt-[0.3em] block text-[clamp(2.25rem,8vw,3.5rem)]">
                {t("currency")}
              </span>
            </p>

            <p className="offer-fade t-sub mt-3 max-w-[38ch] text-muted">
              {t("packLede")}
            </p>
          </div>

          {/* What the 99 € covers: beside the figure from lg up. */}
          <div className="mt-5 lg:col-span-6 lg:row-span-2 lg:mt-0 lg:self-center">
            <p className="offer-fade mb-1 text-sm uppercase text-muted">
              {t("includes")}
            </p>
            <ol>
              {items.map((id, i) => (
                <li
                  key={id}
                  className="offer-item relative grid grid-cols-[2rem_1fr] items-center gap-3 py-2 sm:py-2.5 lg:py-2"
                  style={{ "--i": i } as React.CSSProperties}
                >
                  <span className="grid size-8 place-items-center rounded-full bg-giallo text-xs font-medium tabular-nums text-pearl">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-base uppercase leading-snug sm:text-lg">
                    {t(`items.${id}`)}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="offer-fade mt-5 flex flex-wrap gap-3 lg:col-span-6 lg:mt-6">
            <ButtonAnchor href={whatsappWith(waText)} variant="giallo">
              {cta}
            </ButtonAnchor>
            <ButtonAnchor
              href={site.phoneHref}
              variant="outlined"
              arrow={false}
              className="border-giallo/40"
            >
              {t("call")} {site.phone}
            </ButtonAnchor>
          </div>
        </div>

        {/*
          Under the pack: the battery offer as a slim strip on the brand blue
          and, on the home page, the business wash beside it from 80rem up.
        */}
        <div className="mt-4 grid gap-4 min-[80rem]:grid-cols-12">
          <div
            className={`offer-battery-panel offer-panel flex flex-col justify-between gap-4 bg-giallo p-5 text-pearl sm:p-8 ${
              variant === "home" ? "min-[80rem]:col-span-7" : "min-[80rem]:col-span-12"
            }`}
          >
            <p className="text-sm uppercase text-muted-invert">
              {t("battery.label")}
            </p>
            <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
              <p className="text-[clamp(4.5rem,18vw,6.5rem)] font-medium leading-[0.8] tracking-[-0.03em] tabular-nums">
                {t("battery.value")}
              </p>
              <p className="t-heading max-w-[14ch] leading-tight">
                {t("battery.text")}
              </p>
              <p className="offer-tile flex flex-wrap items-baseline gap-x-2 border border-pearl/35 px-4 py-3">
                <span className="t-heading leading-none">
                  {t("battery.warrantyValue")}
                </span>
                <span className="text-sm uppercase leading-tight">
                  {t("battery.warrantyText")}
                </span>
              </p>
            </div>
          </div>

          {/* Washing at a company's own premises, with the free demo as the
              way in. Outlined, not filled: it is the third thing in the band,
              not a rival to the 99 €. Home and services only. */}
          {variant === "home" ? (
            <div className="offer-fade offer-panel flex flex-col gap-3 border border-pearl/35 p-5 sm:p-8 min-[80rem]:col-span-5">
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <p className="text-sm uppercase text-muted-invert">
                  {biz("label")}
                </p>
                <p className="rounded-full bg-pearl px-3 py-1.5 text-xs uppercase leading-tight text-giallo-deep">
                  {biz("proof.demo")}
                </p>
              </div>
              <h3 className="t-heading leading-tight text-balance">
                {t("home.businessTitle")}
              </h3>
              <p className="max-w-[60ch] text-base leading-snug text-pearl/85">
                {t("home.businessText")}
              </p>
              <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
                <ButtonLink href="/business" variant="white">
                  {t("home.businessLink")}
                </ButtonLink>
                <a
                  href={whatsappWith(biz("waText"))}
                  className="inline-flex min-h-11 items-center text-sm uppercase text-pearl underline decoration-pearl/40 underline-offset-4 transition-colors hover:decoration-pearl"
                >
                  {biz("cta")}
                </a>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
