"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ButtonLink } from "@/components/ui/Button";
import { useDragRail } from "@/components/ui/useDragRail";
import { vehicles, DEFAULT_VEHICLE } from "@/content/vehicles";

/**
 * The price list as a rail you drag, opening on the middle card.
 *
 * Native scroll-snap does the work rather than a JS-driven track: it gives
 * real momentum and a real snap on a phone, it stays interruptible, and it
 * needs no library. The pointer handlers only add mouse dragging on top,
 * because touch already scrolls and a desktop visitor otherwise has nothing
 * to grab.
 *
 * The card either side stays partly visible on purpose. That peek is what
 * says the rail continues — it does the job Lamborghini's arrows do, without
 * putting two more controls on a 390px screen.
 */
export function Prices() {
  const v = useTranslations("vehicles");
  const rail = useRef<HTMLDivElement>(null);
  const dragHandlers = useDragRail(rail);
  const [active, setActive] = useState(
    vehicles.findIndex((x) => x.id === DEFAULT_VEHICLE),
  );

  /**
   * Open centred on the middle card, before paint. `useLayoutEffect` would be
   * the instinct, but it warns during SSR — and because the rail is a scroll
   * container the browser has not painted a scrolled frame yet, so setting
   * `scrollLeft` here is not visible as a jump.
   */
  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    const card = el.children[active] as HTMLElement | undefined;
    if (!card) return;
    el.scrollLeft = card.offsetLeft - (el.clientWidth - card.clientWidth) / 2;
  }, [active]);

  // Keep the indicator honest while the rail is scrolled by any means.
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
        setActive(nearest);
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section id="prices" className="section bg-marble text-ink">
      <div className="wrap">
        <header className="mb-10 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <h2 className="t-display max-w-[16ch]">{v("title")}</h2>
          <p className="t-body text-muted">{v("lede")}</p>
        </header>
      </div>

      {/*
        The rail is full-bleed rather than inside `.wrap`: a card has to be
        able to sit half off the screen for the peek to work, and a padded
        container would clip it. The gutter is restored as scroll padding so
        the first and last cards still line up with the heading above.
      */}
      <div
        ref={rail}
        // The grab cursor is CSS, not state: a ref cannot drive a re-render,
        // so reading it here would have left the cursor stuck on "grab".
        className="flex cursor-grab snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-2 active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ paddingInline: "max(var(--gutter), calc((100% - 30rem) / 2))" }}
        {...dragHandlers}
      >
        {vehicles.map((vehicle) => (
          <article
            key={vehicle.id}
            className="flex w-[min(78vw,26rem)] shrink-0 snap-center flex-col gap-5"
          >
            {/*
              No frame fill: the vehicle artwork is on its own white ground,
              which meets the white section with no seam.
            */}
            <div className="relative aspect-[16/9] w-full overflow-hidden">
              <div className="absolute inset-0 grid place-items-center">
                <picture className="block w-full">
                  <source
                    srcSet={`/images/vehicles/${vehicle.id}.avif`}
                    type="image/avif"
                  />
                  <Image
                    src={`/images/vehicles/${vehicle.id}.webp`}
                    alt=""
                    width={1600}
                    height={900}
                    sizes="(min-width: 640px) 26rem, 78vw"
                    className="h-auto w-full"
                  />
                </picture>
              </div>
            </div>

            {/* Prices get their own row under the name: at this size they no
                longer share one line with it on a phone-width card. */}
            <div className="grid gap-1">
              <h3 className="t-heading">{v(`items.${vehicle.id}.name`)}</h3>
              <span className="flex items-baseline gap-3">
                <span className="text-[clamp(1.25rem,2.6vw,1.75rem)] leading-none text-muted line-through decoration-2 tabular-nums">
                  {vehicle.price} €
                </span>
                <b className="text-[clamp(2.75rem,7vw,5.5rem)] font-medium leading-none tabular-nums">
                  {vehicle.salePrice} €
                </b>
              </span>
            </div>

            {/* White on the fill, not the accent colour on marble — giallo and
                the site's blue are the same hue now, so text in it would
                vanish against the surface behind the badge. */}
            <p className="t-caption -mt-3 inline-block w-fit bg-giallo px-1.5 py-0.5 text-pearl">
              {v("discount")}
            </p>

            <ButtonLink href="/book" className="self-start">
              {v("cta")}
            </ButtonLink>
          </article>
        ))}
      </div>

      {/* Which of the three is centred. Mirrors the hero's pips. */}
      <div className="wrap mt-8 flex gap-2.5">
        {vehicles.map((vehicle, i) => (
          <span
            key={vehicle.id}
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
