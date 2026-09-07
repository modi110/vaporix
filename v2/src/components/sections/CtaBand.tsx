import { useTranslations } from "next-intl";
import { ButtonLink, ButtonAnchor } from "@/components/ui/Button";
import { site } from "@/content/site";

/**
 * The last thing on every page: one line, two ways to act on it.
 *
 * White, so it reads as the floor of the page and the navy footer beneath it
 * steps back up. This carries the page's final Giallo — the call button
 * beside it is deliberately outlined, because two yellow elements in one
 * viewport is exactly what design.md forbids.
 */
export function CtaBand() {
  const t = useTranslations("cta");

  return (
    <section className="section bg-pearl text-ink">
      <div className="wrap grid items-end gap-10 md:grid-cols-[1.2fr_0.8fr]">
        <h2 className="t-display max-w-[18ch]">{t("title")}</h2>
        <div className="flex flex-wrap gap-3 md:justify-self-start">
          <ButtonLink href="/book">{t("book")}</ButtonLink>
          <ButtonAnchor href={site.phoneHref} variant="outlined">
            {t("call")}
          </ButtonAnchor>
        </div>
      </div>
    </section>
  );
}
