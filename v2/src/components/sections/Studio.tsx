import Image from "next/image";
import { useTranslations } from "next-intl";

/**
 * One full-bleed photograph of the unit itself and one line about it.
 *
 * The quiet section, and deliberately so: it sits between the work grid and
 * the map to let the page breathe, and every other band on the page is either
 * loud or transactional.
 */
export function Studio() {
  const t = useTranslations("studio");

  return (
    <section className="section bg-marble text-ink" id="studio">
      <div className="wrap grid items-center gap-10 md:grid-cols-[1.15fr_0.85fr] md:gap-14">
        {/* A hairline border with a navy mat inside it — a frame, not a
            shadow, since the design system has no shadows to reach for. */}
        <div className="border border-hairline bg-navy p-3 md:p-4">
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <picture>
              <source srcSet="/images/gallery/bmw-serie3.avif" type="image/avif" />
              <Image
                src="/images/gallery/bmw-serie3.webp"
                alt={t("photoAlt")}
                fill
                sizes="(min-width: 768px) 55vw, 100vw"
                className="object-cover"
              />
            </picture>
          </div>
        </div>

        <h2 className="t-display">{t("title")}</h2>
      </div>
    </section>
  );
}
