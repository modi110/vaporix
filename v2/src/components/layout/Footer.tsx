import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { StaticPathname } from "@/i18n/routing";
import { Wordmark } from "@/components/brand/Wordmark";
import { SocialIcon, type SocialIconId } from "@/components/ui/SocialIcon";
import { site, addressLine } from "@/content/site";
import { HoursTable } from "@/components/ui/HoursTable";

const links: { href: StaticPathname; key: string }[] = [
  { href: "/", key: "home" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
  { href: "/book", key: "book" },
];

/**
 * The navy band again, closing the page the way the nav opened it.
 *
 * No accent down here — the closing CTA above it already spent the page's
 * last Giallo, and an accent-coloured link in the footer would compete with
 * it from the same viewport.
 */
export function Footer() {
  const t = useTranslations();

  return (
    <footer className="bg-navy text-pearl">
      <div className="wrap grid gap-12 py-16 md:grid-cols-[1.2fr_1fr_1.1fr]">
        <div className="grid content-start gap-5">
          <Wordmark variant="stacked" />
          <p className="t-body max-w-[28ch] text-sm text-muted-invert">
            {addressLine}
          </p>
        </div>

        <div className="grid content-start gap-5">
          <h3 className="t-caption text-muted-invert">{t("footer.main")}</h3>
          <nav className="grid text-sm uppercase">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="flex min-h-11 items-center text-muted-invert transition-colors hover:text-pearl"
              >
                {t(`nav.${l.key}`)}
              </Link>
            ))}
          </nav>
        </div>

        <div className="grid content-start gap-5">
          <h3 className="t-caption text-muted-invert">{t("footer.hours")}</h3>
          <HoursTable dark />
          <div className="flex gap-2">
            {site.social.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="grid size-11 place-items-center border border-hairline-dark text-muted-invert transition-colors duration-150 hover:border-pearl hover:text-pearl active:border-pearl"
              >
                <SocialIcon id={s.icon as SocialIconId} className="size-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="wrap flex flex-wrap items-center justify-between gap-4 border-t border-hairline-dark py-6 text-xs uppercase text-muted-invert">
        <span>
          © {new Date().getFullYear()} {site.name}. {t("footer.rights")}
        </span>
        <a
          href={site.phoneHref}
          className="flex min-h-11 items-center tabular-nums transition-colors hover:text-pearl"
        >
          {site.phone}
        </a>
      </div>
    </footer>
  );
}
