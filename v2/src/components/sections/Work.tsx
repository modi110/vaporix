import Image from "next/image";
import { useTranslations } from "next-intl";
import { shots } from "@/content/gallery";

/**
 * The answer to the client's first complaint: real photographs of real work,
 * on the home page, at full width.
 *
 * Three columns from `lg`, one on a phone — and one full-width photograph per
 * scroll is the right call there rather than a shrunken grid, because these
 * are dark cars and a small dark image on a page reads as texture, not as work.
 *
 * The light ground is doing real work too. v1 put these same photographs on
 * black, where they disappeared into it.
 */
export function Work() {
  const t = useTranslations("work");

  return (
    <section className="section bg-pearl text-ink">
      <div className="wrap">
        <header className="mb-10">
          <h2 className="t-display">{t("title")}</h2>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shots.map((shot) => (
            <figure key={shot.name} className="m-0">
              <picture>
                <source
                  srcSet={`/images/gallery/${shot.name}.avif`}
                  type="image/avif"
                />
                <Image
                  src={`/images/gallery/${shot.name}.webp`}
                  alt=""
                  width={shot.w}
                  height={shot.h}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="h-auto w-full"
                />
              </picture>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
