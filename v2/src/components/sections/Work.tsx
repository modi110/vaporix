"use client";

import Image from "next/image";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { useDragRail } from "@/components/ui/useDragRail";
import { shots } from "@/content/gallery";

/**
 * The answer to the client's first complaint: real photographs of real work,
 * on the home page, large.
 *
 * A rail you swipe, like the price list above it, rather than a stack — one
 * photograph per scroll made this the longest section on a phone. Each frame
 * is the same portrait crop so the row reads as a set, and the next one
 * peeks in from the edge to say there is more.
 *
 * The light ground is doing real work too. v1 put these same photographs on
 * black, where they disappeared into it.
 */
export function Work() {
  const t = useTranslations("work");
  const ref = useRef<HTMLDivElement>(null);
  const dragHandlers = useDragRail(ref);

  return (
    <section className="section bg-pearl text-ink">
      <div className="wrap">
        <header className="mb-10">
          <h2 className="t-display">{t("title")}</h2>
          <p className="t-sub mt-2">{t("lede")}</p>
        </header>
      </div>

      {/* Full-bleed for the same reason as the price rail: a photo has to be
          able to sit half off the screen for the peek to work. */}
      <div
        ref={ref}
        // The rail holds nothing focusable, so without these a keyboard could
        // not reach the photographs at all: `tabIndex` makes the scroller
        // itself a stop, and arrow keys scroll it from there.
        tabIndex={0}
        role="group"
        aria-label={t("title")}
        className="flex cursor-grab snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-2 active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{
          paddingInline: "max(var(--gutter), calc((100% - var(--maxw)) / 2 + var(--gutter)))",
          scrollPaddingInline: "max(var(--gutter), calc((100% - var(--maxw)) / 2 + var(--gutter)))",
        }}
        {...dragHandlers}
      >
        {shots.map((shot) => (
          <figure
            key={shot.name}
            className="relative m-0 aspect-[3/4] w-[min(78vw,26rem)] shrink-0 snap-start overflow-hidden"
          >
            <picture>
              <source
                srcSet={`/images/gallery/${shot.name}.avif`}
                type="image/avif"
              />
              <Image
                src={`/images/gallery/${shot.name}.webp`}
                alt=""
                fill
                sizes="(min-width: 640px) 26rem, 78vw"
                className="object-cover"
                draggable={false}
              />
            </picture>
          </figure>
        ))}
      </div>
    </section>
  );
}
