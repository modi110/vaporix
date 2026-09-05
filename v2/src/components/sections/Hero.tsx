"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { ButtonLink } from "@/components/ui/Button";
import { heroSlides } from "@/content/hero";

const DWELL_MS = 3000;
/** Below this a horizontal drag was a tap, not a swipe. */
const SWIPE_PX = 44;

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/**
 * Read the motion preference as an external store rather than copying it into
 * state from an effect. The server has no `matchMedia`, so it reports "reduce"
 * — meaning the markup React sends is the still one, and someone who wants no
 * motion never sees a frame of it before the client catches up.
 */
function subscribeMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function useReducedMotion() {
  return useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => true,
  );
}

/**
 * The opener: on a phone, a full-screen photograph with the name and the
 * booking button stacked low over a deep fade. From `md` up the photograph
 * stops stretching and holds its own phone-like proportions instead — it
 * sits centred, navy fills the space to its left and Giallo the space to its
 * right, and the name and button move onto that navy rather than riding on
 * the picture.
 *
 * It advances on its own, it takes a swipe, and it holds while a finger is
 * down — put your thumb on a photograph you like and it stays there. That
 * press is the pause control, which is why there is no button for one. On a
 * desktop the same job is done by hovering, and by focusing anything inside
 * it, so a keyboard is not left without a way to stop it either.
 */
export function Hero() {
  const t = useTranslations("hero");
  const [index, setIndex] = useState(0);
  const [held, setHeld] = useState(false);

  const reduced = useReducedMotion();
  const playing = !reduced && !held;

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % heroSlides.length),
      DWELL_MS,
    );
    return () => window.clearInterval(id);
  }, [playing]);

  const goTo = (next: number) =>
    setIndex((next + heroSlides.length) % heroSlides.length);

  const down = useRef<{ x: number; y: number } | null>(null);

  const endHold = () => {
    down.current = null;
    setHeld(false);
  };

  const pips = (
    <div className="pointer-events-auto absolute bottom-5 right-[var(--gutter)] flex items-center gap-3">
      {heroSlides.map((slide, i) => (
        <button
          key={slide.name}
          type="button"
          onClick={() => goTo(i)}
          aria-label={t("goTo", { n: i + 1 })}
          aria-current={i === index}
          // Renders as design.md's 40x2px line but keeps a 44px target.
          className="grid h-11 w-10 place-items-center"
        >
          <span
            className={`block h-0.5 w-full transition-colors duration-300 ${
              i === index ? "bg-pearl" : "bg-pearl/35"
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <section
      aria-roledescription="carousel"
      aria-label={t("carouselLabel")}
      // `h-*`, not `min-h-*`. The centre box's only content is the
      // absolutely-positioned photo layers, which contribute nothing to its
      // own height — with `min-height` on the row, that leaves nothing to
      // resolve `h-full` against, and every image reports height 0. An
      // explicit height gives the row a size that never depends on its
      // children, which is what makes their percentage heights resolve.
      className="relative isolate flex h-[100svh] overflow-hidden bg-void"
      // Vertical stays with the browser so the page still scrolls; horizontal
      // is ours, which is what stops a swipe being swallowed by the scroller.
      style={{ touchAction: "pan-y" }}
      onPointerDown={(e) => {
        down.current = { x: e.clientX, y: e.clientY };
        setHeld(true);
      }}
      onPointerUp={(e) => {
        const start = down.current;
        endHold();
        if (!start) return;
        const dx = e.clientX - start.x;
        // Ignore a mostly-vertical drag: that was a scroll, not a swipe.
        if (
          Math.abs(dx) > SWIPE_PX &&
          Math.abs(dx) > Math.abs(e.clientY - start.y)
        ) {
          goTo(index + (dx < 0 ? 1 : -1));
        }
      }}
      onPointerCancel={endHold}
      // Desktop equivalents of holding a finger on it.
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={endHold}
      onFocusCapture={() => setHeld(true)}
      onBlurCapture={() => setHeld(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") goTo(index + 1);
        if (e.key === "ArrowLeft") goTo(index - 1);
      }}
    >
      {/*
        Left panel: navy, and — from `md` up only — where the name and the
        booking button actually live. Collapsed to nothing on a phone, where
        the photograph is full-bleed and there is no panel to speak of.
        The hover tint is desktop-only for the obvious reason: touch has no
        hover, and a `:hover` left stuck after a tap reads as a visual bug.
      */}
      <div className="hidden md:flex md:flex-1 md:items-end md:justify-start md:bg-navy md:transition-colors md:duration-150 md:hover:bg-navy-lift">
        <div className="wrap pb-[max(2.5rem,env(safe-area-inset-bottom))]">
          <h1 className="t-hero mb-6 text-pearl">{t("title")}</h1>
          <ButtonLink href="/book">{t("cta")}</ButtonLink>
        </div>
      </div>

      {/*
        Centre: the photograph. One crop everywhere — on a phone it fills the
        screen edge to edge; from `md` up it holds its own phone-like
        proportions instead of stretching to fill the space either side of it.
      */}
      <div className="relative h-full w-full shrink-0 overflow-hidden md:aspect-[9/16] md:w-auto">
        {heroSlides.map((slide, i) => (
          <div
            key={slide.name}
            aria-hidden={i !== index}
            className="group/photo absolute inset-0 transition-opacity duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
            style={{ opacity: i === index ? 1 : 0 }}
          >
            <picture className="absolute inset-0 block h-full w-full">
              <source
                srcSet={`/images/hero/${slide.name}-portrait.avif`}
                type="image/avif"
              />
              <Image
                src={`/images/hero/${slide.name}-portrait.webp`}
                alt={t(`slides.${slide.alt}`)}
                fill
                // Only the opening slide is worth the bandwidth up front; it
                // is the LCP element and the rest are a few seconds away.
                priority={i === 0}
                loading={i === 0 ? "eager" : "lazy"}
                sizes="(min-width: 768px) 56vh, 100vw"
                className="object-cover transition-transform duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none md:group-hover/photo:scale-[1.04]"
                style={{ objectPosition: slide.focus }}
                // A drag starting on the photograph must swipe, not lift the
                // browser's own image-drag ghost.
                draggable={false}
              />
            </picture>
          </div>
        ))}

        {/* Phone only: the name and button ride on the photograph itself,
            over a scrim, exactly as before. */}
        <div className="md:hidden">
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 z-[2] h-[58%] bg-[linear-gradient(to_top,rgba(0,0,0,.94)_16%,rgba(0,0,0,.58)_46%,transparent)]"
          />
          <div className="wrap pointer-events-auto absolute inset-x-0 bottom-0 z-[3] pb-[max(2.5rem,env(safe-area-inset-bottom))]">
            <h1 className="t-hero mb-6 text-pearl">{t("title")}</h1>
            <ButtonLink href="/book">{t("cta")}</ButtonLink>
          </div>
        </div>

        {/* Which slide, and a tap target for each. No play control: holding
            the photograph is the pause. Stays on the photo at every width. */}
        {pips}
      </div>

      {/*
        Right panel: Giallo, empty but for the hover. `md`-only for the same
        reason the left one is — no equivalent on a phone, nothing to hover.
      */}
      <div className="hidden md:block md:flex-1 md:bg-giallo md:transition-colors md:duration-150 md:hover:bg-giallo-deep" />

      {/* Announces the change for anyone who cannot see it happen. */}
      <p aria-live="polite" className="sr-only">
        {t("slideOf", { n: index + 1, total: heroSlides.length })}
      </p>
    </section>
  );
}
