"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Bay } from "./Bay";
import { SplitText } from "@/components/ui/SplitText";
import { PillLink, PillAnchor } from "@/components/ui/PillButton";
import { site } from "@/content/site";

gsap.registerPlugin(ScrollTrigger);

/**
 * The hero is the thesis: a car disappearing down a lit bay, the studio name
 * carved across the back wall, and a headline that assembles itself.
 *
 * The wow is layered rather than dumped in one effect — depth from the tunnel,
 * scale from the oversized wordmark, life from the pointer tilt, and a
 * scroll-scrubbed exit that hands the page to the next section instead of
 * just scrolling off.
 */
export function Hero() {
  const t = useTranslations("hero");
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Entrance. Runs on mount; the preloader curtain is still lifting,
        // so the two read as a single move.
        const tl = gsap.timeline({ delay: 0.15 });
        tl.from(".hero-backdrop-word", {
          yPercent: 18,
          opacity: 0,
          duration: 1.4,
          ease: "expo.out",
        })
          .from(
            ".hero-rule",
            { scaleX: 0, duration: 0.8, ease: "expo.out" },
            "-=1.1",
          )
          .from(
            ".hero-eyebrow-text",
            { opacity: 0, x: -12, duration: 0.6 },
            "-=0.7",
          )
          .from(
            [".hero-lede", ".hero-actions", ".hero-strip", ".hero-cue"],
            { opacity: 0, y: 24, duration: 0.9, stagger: 0.09, ease: "expo.out" },
            "-=0.45",
          );
      });

      mm.add(
        "(min-width: 900px) and (prefers-reduced-motion: no-preference)",
        () => {
          // Exit: content lifts away faster than the backdrop, which opens
          // depth between them as the section leaves.
          gsap
            .timeline({
              scrollTrigger: {
                trigger: root.current,
                start: "top top",
                end: "bottom top",
                scrub: 1,
              },
            })
            .to(".hero-content", { yPercent: -18, opacity: 0, ease: "none" }, 0)
            .to(".hero-backdrop-word", { yPercent: -34, ease: "none" }, 0);
        },
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      className="relative flex min-h-[100svh] items-end overflow-hidden pb-[clamp(2.5rem,5vw,4.5rem)]"
    >
      <Bay />

      {/* the studio name carved across the back of the bay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[16%] z-[1] flex justify-center"
      >
        <span className="hero-backdrop-word text-outline whitespace-nowrap font-extrabold leading-none tracking-[-0.05em] text-[clamp(5rem,19vw,20rem)]">
          VAPORIX
        </span>
      </div>

      {/* social rail */}
      <div className="absolute left-[var(--gutter)] top-1/2 z-[3] hidden -translate-y-1/2 flex-col gap-2.5 xl:flex">
        {site.social.map((s) => (
          <a
            key={s.label}
            href={s.href}
            aria-label={s.label}
            className="grid size-9 place-items-center rounded-full border border-hairline font-mono text-[0.625rem] text-muted transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-void"
          >
            {s.short}
          </a>
        ))}
      </div>

      <div className="wrap hero-content relative z-[2] grid gap-10">
        <div>
          <p className="mb-6 flex items-center gap-3.5">
            <span className="hero-rule h-px w-14 origin-left bg-vapor" />
            <span className="hero-eyebrow-text t-label">{t("eyebrow")}</span>
          </p>

          <div className="grid max-w-[19ch] gap-6">
            <h1 className="t-h1" data-split>
              <SplitText text={`${t("titleLine1")} ${t("titleLine2")}`} />
            </h1>

            <p className="hero-lede t-lede">{t("lede")}</p>

            <div className="hero-actions mt-1 flex flex-wrap items-center gap-3">
              <PillLink href="/book">{t("ctaPrimary")}</PillLink>
              <PillLink href="/services" variant="ghost">
                {t("ctaSecondary")}
              </PillLink>
            </div>
          </div>
        </div>

        <div className="hero-strip flex flex-wrap items-end justify-between gap-10">
          <div className="flex flex-wrap gap-[clamp(1.75rem,4vw,3.5rem)]">
            <Stat value={String(site.stats.locations)} label={t("stats.locations")} />
            <Stat
              value={site.stats.carsTreated.toLocaleString("es-ES")}
              label={t("stats.cars")}
            />
            <Stat value={String(site.stats.rating)} label={t("stats.rating")} />
          </div>

          <PillAnchor
            href={site.whatsapp}
            variant="ghost"
            size="sm"
            className="shrink-0"
          >
            {t("watch")}
          </PillAnchor>
        </div>
      </div>

      {/* scroll cue */}
      <div className="hero-cue absolute bottom-6 left-1/2 z-[2] hidden -translate-x-1/2 flex-col items-center gap-2.5 md:flex">
        <span className="t-label text-[0.5625rem]">{t("scroll")}</span>
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

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <b className="block text-[clamp(1.6rem,3vw,2.6rem)] font-medium leading-none tracking-[-0.03em] tabular-nums">
        {value}
      </b>
      <p className="t-label mt-2 border-t border-hairline pt-2">{label}</p>
    </div>
  );
}
