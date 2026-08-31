"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "@/components/ui/SplitText";
import { PillLink } from "@/components/ui/PillButton";
import { site } from "@/content/site";

gsap.registerPlugin(ScrollTrigger);

/**
 * The hero is the thesis: the studio name at architectural scale, unlit until
 * you move across it.
 *
 * Two stacked copies of the wordmark do the work — a dim engraved one always
 * present, and a bright one revealed through a radial mask that follows the
 * pointer. The light reads as a work lamp sweeping a panel, which is exactly
 * what the studio does for a living.
 *
 * With no pointer (touch, or before the first move) the lamp drifts on its own
 * so the mark is never dead on arrival.
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
          .timeline({ delay: 0.15 })
          .from(".hero-word", {
            yPercent: 14,
            opacity: 0,
            duration: 1.5,
            ease: "expo.out",
          })
          .from(".hero-rule", { scaleX: 0, duration: 0.8, ease: "expo.out" }, "-=1.15")
          .from(".hero-eyebrow-text", { opacity: 0, x: -12, duration: 0.6 }, "-=0.7")
          .from(
            [".hero-lede", ".hero-actions", ".hero-cue"],
            { opacity: 0, y: 24, duration: 0.9, stagger: 0.1, ease: "expo.out" },
            "-=0.5",
          );
      });

      // The lamp. Idle drift first; a real pointer takes over on first move.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const drift = gsap.to(el, {
          "--lx": 74,
          "--ly": 58,
          duration: 5.5,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });

        const toX = gsap.quickTo(el, "--lx", { duration: 0.75, ease: "power3" });
        const toY = gsap.quickTo(el, "--ly", { duration: 0.75, ease: "power3" });

        const onMove = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          drift.kill();
          toX(((e.clientX - r.left) / r.width) * 100);
          toY(((e.clientY - r.top) / r.height) * 100);
        };
        window.addEventListener("pointermove", onMove);
        return () => {
          drift.kill();
          window.removeEventListener("pointermove", onMove);
        };
      });

      mm.add(
        "(min-width: 900px) and (prefers-reduced-motion: no-preference)",
        () => {
          gsap
            .timeline({
              scrollTrigger: {
                trigger: el,
                start: "top top",
                end: "bottom top",
                scrub: 1,
              },
            })
            .to(".hero-word", { yPercent: -22, opacity: 0.15, ease: "none" }, 0)
            .to(".hero-copy", { yPercent: -10, opacity: 0, ease: "none" }, 0);
        },
      );
    }, root);

    return () => ctx.revert();
  }, []);

  const lamp = "calc(var(--lx) * 1%) calc(var(--ly) * 1%)";

  return (
    <section
      ref={root}
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden pb-28 pt-32"
      style={{ ["--lx" as string]: 26, ["--ly" as string]: 44 }}
    >
      {/* ambience: steam and the pool of light under the lamp */}
      <div aria-hidden="true" className="absolute inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle 30vw at ${lamp}, rgba(var(--vapor-rgb),.16), transparent 70%)`,
          }}
        />
        <div className="animate-drift absolute left-[8%] top-[24%] aspect-square w-[40vw] rounded-full bg-[radial-gradient(circle,rgba(var(--vapor-rgb),.09),transparent_66%)] blur-[70px]" />
        <div
          className="animate-drift absolute right-[6%] top-[46%] aspect-square w-[34vw] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.05),transparent_62%)] blur-[80px]"
          style={{ animationDelay: "-13s" }}
        />
        <div className="absolute inset-x-0 bottom-0 h-[38%] bg-[linear-gradient(to_top,rgba(var(--vapor-rgb),.10),transparent_80%)]" />
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

      {/* the name, at architectural scale */}
      <div
        className="hero-word relative z-[1] w-full select-none px-[var(--gutter)] text-center"
        role="img"
        aria-label={t("brandAlt")}
      >
        <span className="relative block font-extrabold leading-[0.82] tracking-[-0.055em] text-[clamp(3.5rem,17.5vw,17rem)]">
          {/* engraved, always there */}
          <span
            aria-hidden="true"
            className="block text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.13)]"
          >
            VAPORIX
          </span>
          {/* lit, revealed only where the lamp falls */}
          <span
            aria-hidden="true"
            className="absolute inset-0 block text-vapor"
            style={{
              textShadow: "0 0 38px rgba(47,210,255,.55)",
              maskImage: `radial-gradient(circle 26vw at ${lamp}, #000 0%, rgba(0,0,0,.55) 42%, transparent 72%)`,
              WebkitMaskImage: `radial-gradient(circle 26vw at ${lamp}, #000 0%, rgba(0,0,0,.55) 42%, transparent 72%)`,
            }}
          >
            VAPORIX
          </span>
        </span>
      </div>

      {/* and the pitch beneath it */}
      <div className="hero-copy wrap relative z-[2] mt-10 grid max-w-3xl justify-items-center gap-6 text-center">
        <p className="flex items-center gap-3.5">
          <span className="hero-rule h-px w-14 origin-left bg-vapor" />
          <span className="hero-eyebrow-text t-label">{t("eyebrow")}</span>
        </p>

        <h1 className="t-h2 max-w-[20ch]" data-split>
          <SplitText text={`${t("titleLine1")} ${t("titleLine2")}`} />
        </h1>

        <p className="hero-lede t-lede mx-auto">{t("lede")}</p>

        <div className="hero-actions flex flex-wrap items-center justify-center gap-3">
          <PillLink href="/book">{t("ctaPrimary")}</PillLink>
          <PillLink href="/services" variant="ghost">
            {t("ctaSecondary")}
          </PillLink>
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
