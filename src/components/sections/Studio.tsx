import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { SplitText } from "@/components/ui/SplitText";

/**
 * The photograph of the bay, if it has been dropped in yet.
 *
 * Checked on disk at build time rather than hardcoded, because a missing
 * <Image> src is a broken picture in production, not a build error. Until the
 * file exists the vector bay stands in; the moment it does, the same slot
 * renders the real thing at the same aspect ratio and nothing else moves.
 */
const PHOTO = "/images/studio-bay.jpg";
const hasPhoto = fs.existsSync(
  path.join(process.cwd(), "public", PHOTO.slice(1)),
);

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
            className={`relative grid place-items-center overflow-hidden rounded-card border border-hairline ${
              hasPhoto
                ? "aspect-[3/4]"
                : "aspect-[16/10] bg-[radial-gradient(ellipse_70%_46%_at_50%_62%,rgba(var(--vapor-rgb),.22),transparent_70%),linear-gradient(160deg,var(--color-surface-2),var(--color-surface))]"
            }`}
          >
            {hasPhoto ? (
              <>
                <Image
                  src={PHOTO}
                  alt={t("photoAlt")}
                  fill
                  sizes="(min-width: 768px) 38vw, 90vw"
                  className="object-cover"
                  priority={false}
                />
                {/* the caption needs a floor to sit on whatever the photo does */}
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(to_top,rgba(0,0,0,.72),transparent)]"
                />
                <p className="t-label absolute bottom-4 left-5 text-white">
                  {t("bay")}
                </p>
              </>
            ) : (
              <>
                <CarOutline />
                <p className="t-label absolute bottom-4 left-5">{t("bay")}</p>
              </>
            )}
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

function CarOutline() {
  return (
    <svg viewBox="0 0 400 150" aria-hidden="true" className="w-[72%] opacity-90">
      <path
        d="M40 108 L44 84 Q52 62 84 56 L150 48 Q186 30 232 32 Q286 34 318 58 L352 66 Q380 74 380 96 L378 108 Z"
        fill="none"
        stroke="var(--color-ink)" strokeOpacity=".55"
        strokeWidth="2"
      />
      <path
        d="M150 50 L176 34 M232 33 L246 52"
        stroke="var(--color-ink)" strokeOpacity=".28"
        strokeWidth="2"
      />
      <circle cx="116" cy="108" r="21" fill="none" stroke="var(--color-ink)" strokeOpacity=".55" strokeWidth="2" />
      <circle cx="312" cy="108" r="21" fill="none" stroke="var(--color-ink)" strokeOpacity=".55" strokeWidth="2" />
    </svg>
  );
}
