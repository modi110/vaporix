import Image from "next/image";
import { useTranslations } from "next-intl";
import { SplitText } from "@/components/ui/SplitText";
import { studioShot } from "@/content/gallery";

export function Studio() {
  const t = useTranslations("studio");

  return (
    <section className="section" id="studio">
      <div
        aria-hidden="true"
        className="glow-vapor pointer-events-none absolute -left-[14%] top-[6%] size-[640px] rounded-full"
        data-speed="0.85"
      />

      <div className="wrap">
        <div className="grid items-end gap-[clamp(2.5rem,5vw,5rem)] md:grid-cols-[0.85fr_1.15fr]">
          <div
            data-clip
            className="relative overflow-hidden rounded-card border border-hairline"
            style={{ aspectRatio: `${studioShot.w} / ${studioShot.h}` }}
          >
            <Image
              src={studioShot.src}
              alt={t("photoAlt")}
              fill
              sizes="(min-width: 768px) 40vw, 92vw"
              className="object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(to_top,rgba(0,0,0,.75),transparent)]"
            />
            <p className="t-label absolute bottom-4 left-5 text-white">
              {t("bay")}
            </p>
          </div>

          <div>
            <p className="t-label mb-6" data-reveal>
              {t("label")}
            </p>
            <h2 className="t-h2" data-split>
              <SplitText text={t("title")} />
            </h2>
            <p className="t-lede mt-6" data-reveal>
              {t("lede")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
