import Image from "next/image";
import { useTranslations } from "next-intl";
import { SplitText } from "@/components/ui/SplitText";
import { PillLink } from "@/components/ui/PillButton";
import { homeShots } from "@/content/gallery";

/**
 * Four cars from the studio, between the closing call and the map.
 *
 * On a phone this is a snapping horizontal rail bleeding to both edges: four
 * frames you swipe through, which beats four cropped thumbnails stacked in a
 * column nobody scrolls past. From `md` the same four elements become a
 * two-by-two mosaic with the first frame running tall, so the block has a
 * shape rather than being a plain row. One set of markup, one set of image
 * requests, two layouts.
 */
export function Work() {
  const t = useTranslations("work");

  return (
    <section className="section pb-[clamp(3rem,6vw,5rem)]" id="work">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-6">
          <div>
            <p className="t-label mb-5" data-reveal>
              {t("label")}
            </p>
            <h2 className="t-h2 max-w-[16ch]" data-split>
              <SplitText text={t("title")} />
            </h2>
          </div>
          <PillLink href="/gallery" variant="ghost">
            {t("all")}
          </PillLink>
        </div>
      </div>

      <div className="no-scrollbar mt-9 flex snap-x snap-mandatory gap-3 overflow-x-auto px-[var(--gutter)] md:mx-auto md:mt-14 md:grid md:max-w-[var(--maxw)] md:grid-cols-3 md:grid-rows-2 md:gap-4 md:overflow-visible">
        {homeShots.map((shot, i) => {
          const tall = i === 0;
          // the last frame takes the two cells the tall one leaves over
          const wide = i === homeShots.length - 1;
          return (
            <figure
              key={shot.src}
              data-reveal
              style={{ transitionDelay: `${i * 70}ms` }}
              className={`relative w-[76vw] shrink-0 snap-center overflow-hidden rounded-card border border-hairline bg-surface sm:w-[46vw] md:w-auto md:shrink ${
                tall ? "md:row-span-2" : ""
              } ${wide ? "md:col-span-2" : ""}`}
            >
              <div
                className={
                  tall
                    ? "aspect-[3/4]"
                    : wide
                      ? "aspect-[4/3] md:aspect-[16/7]"
                      : "aspect-[4/3]"
                }
              >
                <Image
                  src={shot.src}
                  alt={t(`alt.${shot.alt}`)}
                  fill
                  sizes="(min-width: 768px) 45vw, 76vw"
                  className="object-cover"
                />
              </div>
            </figure>
          );
        })}
      </div>
    </section>
  );
}
