"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useDragRail } from "@/components/ui/useDragRail";
import { reviews } from "@/content/reviews";
import { site } from "@/content/site";

/** How long a review holds before the rail moves itself on to the next one. */
const DWELL_MS = 5600;

/**
 * What customers wrote on the Google listing, on the same drag rail the price
 * list uses — the site already has one carousel idiom and a second one would
 * only be a second thing to learn. Native scroll-snap does the scrolling, the
 * pointer handlers add mouse dragging on top, and the card either side stays
 * half in frame so the rail reads as continuing.
 *
 * The score sits in the header rather than on every card: all five reviews are
 * five stars, so a row of stars per card says nothing the heading has not
 * already said, and repeating it five times reads as decoration. What the
 * cards carry is the one thing that differs between them — the words.
 *
 * It runs after `Work`, which is the argument in photographs; this is the same
 * argument in other people's words, and it hands over to the workshop's other
 * services immediately after.
 *
 * The cards are the one rounded, filled thing on the site, at the client's
 * explicit request — everywhere else the design system is hard edges and no
 * fills. Left as an exception on purpose, not an oversight to tidy away.
 */
export function Reviews() {
  const t = useTranslations("reviews");
  const locale = useLocale();
  const rail = useRef<HTMLDivElement>(null);
  const dragHandlers = useDragRail(rail);
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  /*
    The same index as `active`, readable without re-subscribing: the advance
    interval needs to know where the rail is, and depending on the state would
    tear the timer down and start it again on every scroll frame — the rail
    would then never sit still long enough to advance.
  */
  const activeRef = useRef(0);

  // Keep the indicator honest however the rail is scrolled — drag, swipe,
  // keyboard or scrollbar.
  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const mid = el.scrollLeft + el.clientWidth / 2;
        let nearest = 0;
        let best = Infinity;
        [...el.children].forEach((child, i) => {
          const c = child as HTMLElement;
          const d = Math.abs(c.offsetLeft + c.clientWidth / 2 - mid);
          if (d < best) {
            best = d;
            nearest = i;
          }
        });
        activeRef.current = nearest;
        setActive(nearest);
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  /**
   * It moves on by itself, and it stops the moment anyone touches it —
   * hovering, dragging, or tabbing into it all count. That press is the pause
   * control, which is why there is no button for one.
   *
   * `scrollTo` rather than a transform: the rail is a real scroll container,
   * so this is the same motion a swipe produces and a swipe mid-animation
   * interrupts it instead of fighting it.
   */
  useEffect(() => {
    const el = rail.current;
    if (!el || held) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setInterval(() => {
      const next = (activeRef.current + 1) % reviews.length;
      const card = el.children[next] as HTMLElement | undefined;
      if (!card) return;
      el.scrollTo({
        left: card.offsetLeft - (el.clientWidth - card.clientWidth) / 2,
        behavior: "smooth",
      });
    }, DWELL_MS);

    return () => window.clearInterval(id);
  }, [held]);

  const rating = site.rating.toLocaleString(locale, {
    minimumFractionDigits: 1,
  });

  return (
    <section id="reviews" className="section bg-pearl text-ink">
      <div className="wrap">
        <header className="mb-10 grid gap-8 md:grid-cols-[1fr_auto] md:items-end md:gap-14">
          <div>
            <h2 className="t-display mb-4 max-w-[16ch]">{t("title")}</h2>
            <p className="t-body text-muted">{t("lede")}</p>
          </div>

          {/*
            The score, once, at full size — it is the number the rest of the
            section is evidence for, so it gets the weight the price list gives
            a price rather than a caption somewhere.
          */}
          <p className="flex items-center gap-4 md:justify-end">
            <b className="text-[clamp(2.75rem,7vw,4.5rem)] font-medium leading-none tabular-nums">
              {rating}
            </b>
            <Stars className="size-5" label={t("stars", { n: rating })} />
          </p>
        </header>
      </div>

      {/*
        Full-bleed for the same reason the price rail is: a card has to be able
        to sit half off the screen, and `.wrap`'s padding would clip it. The
        gutter comes back as scroll padding so the first card still lines up
        with the heading above it.
      */}
      <div
        ref={rail}
        aria-label={t("railLabel")}
        className="flex cursor-grab snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-2 active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ paddingInline: "max(var(--gutter), calc((100% - 30rem) / 2))" }}
        {...dragHandlers}
        // Spread after the drag handlers, not before: these wrap the ones that
        // share a name rather than replacing them.
        onPointerEnter={() => setHeld(true)}
        onPointerDown={(e) => {
          dragHandlers.onPointerDown(e);
          setHeld(true);
        }}
        onPointerUp={() => {
          dragHandlers.onPointerUp();
          setHeld(false);
        }}
        onPointerLeave={() => {
          dragHandlers.onPointerLeave();
          setHeld(false);
        }}
        onFocusCapture={() => setHeld(true)}
        onBlurCapture={() => setHeld(false)}
      >
        {reviews.map((review) => (
          <figure
            key={review.id}
            className="flex w-[min(80vw,25rem)] shrink-0 snap-center flex-col gap-6 rounded-[1.75rem] bg-navy p-7 text-pearl sm:p-8"
          >
            <blockquote className="text-[1.0625rem] leading-[1.65] tracking-normal sm:text-[1.1875rem]">
              {review.quote}
            </blockquote>

            <figcaption className="mt-auto flex items-baseline justify-between gap-4 border-t border-hairline-dark pt-4 text-sm uppercase">
              <span>{review.author ?? t("anonymous")}</span>
              {review.author ? (
                <span className="t-caption text-muted-invert">Google</span>
              ) : null}
            </figcaption>
          </figure>
        ))}
      </div>

      {/* Which card is centred. The same indicator the price rail uses. */}
      <div className="wrap mt-8 flex gap-2.5">
        {reviews.map((review, i) => (
          <span
            key={review.id}
            aria-hidden="true"
            className={`block h-0.5 w-10 transition-colors duration-300 ${
              i === active ? "bg-ink" : "bg-hairline"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

/**
 * Five filled stars. Filled, not the hairline outline `HighlightIcon` draws —
 * at this size an outline star reads as an empty one, which is the opposite of
 * what it is here for.
 */
function Stars({ className = "", label }: { className?: string; label: string }) {
  return (
    <span role="img" aria-label={label} className="flex gap-1.5 text-giallo">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
          <path d="M12 3.5 14.5 9.3 20.8 9.9 16.1 14.1 17.5 20.3 12 17 6.5 20.3 7.9 14.1 3.2 9.9 9.5 9.3Z" />
        </svg>
      ))}
    </span>
  );
}
