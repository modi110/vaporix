import { useTranslations } from "next-intl";
import { SplitText } from "@/components/ui/SplitText";
import { PillLink, PillAnchor } from "@/components/ui/PillButton";
import { site } from "@/content/site";

export function CtaBand() {
  const t = useTranslations("cta");

  return (
    <section className="section py-[clamp(4rem,8vw,7rem)]">
      <div
        aria-hidden="true"
        className="glow-vapor pointer-events-none absolute left-1/2 top-1/2 size-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70"
        data-speed="0.92"
      />
      <div className="wrap grid items-center gap-10 md:grid-cols-[1.2fr_0.8fr]">
        <h2 className="t-h2" data-split>
          <SplitText text={t("title")} />
        </h2>
        <div className="flex flex-wrap gap-3 md:justify-self-start" data-reveal>
          <PillLink href="/book">{t("book")}</PillLink>
          <PillAnchor href={site.phoneHref} variant="ghost">
            {t("call")}
          </PillAnchor>
        </div>
      </div>
    </section>
  );
}
