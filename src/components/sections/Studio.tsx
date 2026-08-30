import { useTranslations } from "next-intl";
import { Counter } from "@/components/ui/Counter";
import { SplitText } from "@/components/ui/SplitText";
import { site } from "@/content/site";

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
            className="relative grid aspect-[16/10] place-items-center overflow-hidden rounded-card border border-hairline bg-[radial-gradient(ellipse_70%_46%_at_50%_62%,rgba(var(--vapor-rgb),.22),transparent_70%),linear-gradient(160deg,var(--color-surface-2),var(--color-surface))]"
          >
            <CarOutline />
            <p className="t-label absolute bottom-4 left-5">{t("bay")}</p>
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

        <div className="mt-[clamp(2.5rem,5vw,4rem)] grid gap-10 sm:grid-cols-3">
          <BigNum n={site.stats.locations} label={t("nums.locations")} />
          <BigNum n={site.stats.years} label={t("nums.years")} />
          <BigNum n={site.stats.serviceTypes} label={t("nums.types")} />
        </div>
      </div>
    </section>
  );
}

function BigNum({ n, label }: { n: number; label: string }) {
  return (
    <div data-reveal>
      <Counter to={n} className="t-num block" />
      <p className="t-label mt-3.5 border-t border-hairline pt-3">{label}</p>
    </div>
  );
}

function CarOutline() {
  return (
    <svg viewBox="0 0 400 150" aria-hidden="true" className="w-[72%] opacity-90">
      <path
        d="M40 108 L44 84 Q52 62 84 56 L150 48 Q186 30 232 32 Q286 34 318 58 L352 66 Q380 74 380 96 L378 108 Z"
        fill="none"
        stroke="rgba(255,255,255,.55)"
        strokeWidth="2"
      />
      <path
        d="M150 50 L176 34 M232 33 L246 52"
        stroke="rgba(255,255,255,.28)"
        strokeWidth="2"
      />
      <circle cx="116" cy="108" r="21" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="2" />
      <circle cx="312" cy="108" r="21" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="2" />
    </svg>
  );
}
