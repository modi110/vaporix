"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "@/components/ui/SplitText";
import { PillLink, PillAnchor } from "@/components/ui/PillButton";
import { CarStage } from "./CarStage";
import { SocialIcon, type SocialIconId } from "@/components/ui/SocialIcon";
import { site } from "@/content/site";

gsap.registerPlugin(ScrollTrigger);

/**
 * The car sits lit at the back of the stage, the copy in front of it.
 *
 * A left-to-right scrim between the two means the text never depends on the
 * artwork behind it for legibility, however far the car extends.
 */
export function Hero() {
  const t = useTranslations("hero");
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({ delay: 0.2 })
          .from(".hero-car-mobile", {
            opacity: 0,
            x: 64,
            duration: 0.85,
            ease: "expo.out",
          })
          .from(
            [".hero-lede", ".hero-actions", ".hero-meta"],
            { opacity: 0, y: 26, duration: 0.9, stagger: 0.09, ease: "expo.out" },
            "-=0.4",
          );
      });

      /**
       * The car drives off on scroll at every width. A phone gets a shorter
       * throw and no vertical drift, because the frame is narrow and the copy
       * is already sitting on top of it; a wide screen can afford the full
       * exit. Wheels turn in both.
       */
      mm.add(
        {
          wide: "(min-width: 900px) and (prefers-reduced-motion: no-preference)",
          narrow: "(max-width: 899px) and (prefers-reduced-motion: no-preference)",
        },
        (context) => {
          const wide = Boolean(context.conditions?.wide);
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: el,
              start: "top top",
              end: "bottom top",
              scrub: 1,
            },
          });

          tl.to(
            ".hero-copy",
            { yPercent: wide ? -12 : -7, opacity: 0, ease: "none" },
            0,
          ).to(
            ".hero-stage",
            {
              xPercent: wide ? -26 : -46,
              yPercent: wide ? -4 : 0,
              ease: "none",
            },
            0,
          );

          /**
           * The wheels turn with the car. Each one needs its own pivot, so
           * they are tweened individually with an explicit `svgOrigin` rather
           * than a shared `transformOrigin` — a bounding box would drift as
           * the spokes rotate. The car is mirrored inside the SVG, so a
           * positive rotation here renders counter-clockwise on screen, which
           * is what rolling to the left looks like.
           */
          gsap.utils
            .toArray<SVGGElement>(".v-wheel")
            .forEach((wheel) =>
              tl.to(
                wheel,
                {
                  rotation: wide ? 540 : 760,
                  svgOrigin: `${wheel.dataset.spin} 300`,
                  ease: "none",
                },
                0,
              ),
            );
        },
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      className="relative overflow-hidden pb-16 pt-28 sm:flex sm:min-h-[100svh] sm:items-center sm:justify-center sm:pb-24 sm:pt-32"
    >
      {/*
        Two different compositions, not one scaled down. Wide screens put the
        car full-bleed behind the copy, right side; a phone has no room for
        that, so the car becomes a contained visual sitting in the text flow,
        directly under the headline — nothing floats behind the words.
      */}
      <div
        aria-hidden="true"
        className="hero-stage absolute inset-0 z-0 hidden sm:block"
      >
        <div className="absolute inset-y-0 right-[-6%] flex w-[88%] items-center lg:w-[66%]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_62%_54%_at_50%_50%,rgba(var(--vapor-rgb),.18),transparent_72%)]" />
          <CarStage className="w-full drop-shadow-[0_0_70px_rgba(var(--vapor-rgb),0.26)]" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-void)_12%,rgba(var(--scrim-rgb),var(--scrim-a1))_38%,rgba(var(--scrim-rgb),var(--scrim-a2))_62%,transparent_84%)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/4 bg-[linear-gradient(to_top,var(--color-void),transparent)]" />
      </div>

      {/* mobile: a quiet ambient glow, no background car to hide behind it */}
      <div
        aria-hidden="true"
        className="glow-vapor pointer-events-none absolute -right-[20%] -top-[8%] size-[86vw] rounded-full opacity-80 sm:hidden"
      />

      {/* social rail */}
      <div className="absolute left-[var(--gutter)] top-1/2 z-[3] hidden -translate-y-1/2 flex-col gap-2.5 xl:flex">
        {site.social.map((s) => (
          <a
            key={s.label}
            href={s.href}
            aria-label={s.label}
            className="grid size-10 place-items-center rounded-full border border-hairline text-muted transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-void"
          >
            <SocialIcon id={s.icon as SocialIconId} className="size-[1.05rem]" />
          </a>
        ))}
      </div>

      <div className="hero-copy wrap relative z-[2] grid gap-7 sm:max-w-2xl">
        <h1 className="t-h1 max-w-[15ch]" data-split>
          <SplitText text={`${t("titleLine1")} ${t("titleLine2")}`} />
        </h1>

        {/* phone only: the car, right under the headline — no frame around
            it, so it reads as the same floating graphic the desktop stage
            uses, just brought into the text column instead of the background */}
        <div
          className="hero-car-mobile relative sm:hidden"
          style={{ aspectRatio: "1000 / 460" }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_62%_54%_at_50%_50%,rgba(var(--vapor-rgb),.24),transparent_72%)]"
          />
          <CarStage className="absolute inset-0 h-full w-full drop-shadow-[0_0_40px_rgba(var(--vapor-rgb),0.22)]" />
        </div>

        <p className="hero-lede t-lede">{t("lede")}</p>

        <div className="hero-actions flex flex-wrap items-center gap-3">
          <PillLink href="/book">{t("ctaPrimary")}</PillLink>
          {/* Services live on this page now, so this scrolls rather than
              navigates — there is no separate services route any more. */}
          <PillAnchor href="#services" variant="ghost">
            {t("ctaSecondary")}
          </PillAnchor>
        </div>

        <div className="hero-meta flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="t-label text-ink">{t("priceFrom")}</span>
        </div>
      </div>

      {/* scroll cue */}
      <div className="absolute bottom-6 left-1/2 z-[2] hidden -translate-x-1/2 flex-col items-center gap-2.5 md:flex">
        <span className="t-label text-[0.6875rem]">{t("scroll")}</span>
        <span className="relative block h-10 w-px overflow-hidden bg-hairline">
          <span
            className="absolute inset-0 block bg-vapor motion-reduce:hidden"
            style={{ animation: "vaporix-scroll-cue 2.4s ease-in-out infinite" }}
          />
        </span>
      </div>
    </section>
  );
}
