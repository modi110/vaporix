"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "@/components/ui/SplitText";
import { PillLink } from "@/components/ui/PillButton";
import { GrimeLayer } from "@/components/motion/GrimeLayer";
import { CarStage } from "./CarStage";
import { SocialIcon, type SocialIconId } from "@/components/ui/SocialIcon";
import { site } from "@/content/site";

gsap.registerPlugin(ScrollTrigger);

/**
 * The hero opens dirty and you clean it.
 *
 * Layering matters here: the car and its light sit at the back, the grime
 * covers them, and every word sits above both. Text legibility therefore
 * never depends on how much a visitor has wiped — the effect is pure payoff,
 * not a gate on the content.
 */
export function Hero() {
  const t = useTranslations("hero");
  const root = useRef<HTMLElement>(null);
  const [clean, setClean] = useState(false);

  const handleCleared = useCallback(() => setClean(true), []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({ delay: 0.2 })
          .from(".hero-rule", { scaleX: 0, duration: 0.8, ease: "expo.out" })
          .from(".hero-eyebrow-text", { opacity: 0, x: -12, duration: 0.6 }, "-=0.5")
          .from(
            [".hero-lede", ".hero-actions", ".hero-meta"],
            { opacity: 0, y: 26, duration: 0.9, stagger: 0.09, ease: "expo.out" },
            "-=0.35",
          );
      });

      mm.add(
        "(min-width: 900px) and (prefers-reduced-motion: no-preference)",
        () => {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: el,
              start: "top top",
              end: "bottom top",
              scrub: 1,
            },
          });

          tl.to(".hero-copy", { yPercent: -12, opacity: 0, ease: "none" }, 0).to(
            ".hero-stage",
            { xPercent: -26, yPercent: -4, ease: "none" },
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
                  rotation: 540,
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
      className="relative flex min-h-[100svh] items-center overflow-hidden pb-24 pt-32"
    >
      {/* what the grime is hiding */}
      <div
        aria-hidden="true"
        className="hero-stage absolute inset-0 z-0"
      >
        <div className="absolute inset-y-0 right-[-6%] flex w-[88%] items-center lg:w-[66%]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_62%_54%_at_50%_50%,rgba(var(--vapor-rgb),.18),transparent_72%)]" />
          <CarStage
            className={`w-full transition-[filter,opacity] duration-[1200ms] ${
              clean
                ? "opacity-100 drop-shadow-[0_0_70px_rgba(47,210,255,0.26)]"
                : "opacity-90"
            }`}
          />
        </div>
        {/* the copy always sits on solid ground, however far the car extends */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-void)_12%,rgba(0,0,0,.74)_38%,rgba(0,0,0,.16)_62%,transparent_84%)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/4 bg-[linear-gradient(to_top,var(--color-void),transparent)]" />
      </div>

      {/* the dirt itself */}
      <GrimeLayer
        className="absolute inset-0 z-[1] h-full w-full"
        onCleared={handleCleared}
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

      {/* every word stays above the grime */}
      <div className="hero-copy wrap relative z-[2] grid max-w-2xl gap-7">
        <p className="flex items-center gap-3.5">
          <span className="hero-rule h-px w-14 origin-left bg-vapor" />
          <span className="hero-eyebrow-text t-label">{t("eyebrow")}</span>
        </p>

        <h1 className="t-h1 max-w-[15ch]" data-split>
          <SplitText text={`${t("titleLine1")} ${t("titleLine2")}`} />
        </h1>

        <p className="hero-lede t-lede">{t("lede")}</p>

        <div className="hero-actions flex flex-wrap items-center gap-3">
          <PillLink href="/book">{t("ctaPrimary")}</PillLink>
          <PillLink href="/services" variant="ghost">
            {t("ctaSecondary")}
          </PillLink>
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
