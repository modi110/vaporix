import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { StaticPathname } from "@/i18n/routing";
import { Wordmark } from "@/components/brand/Wordmark";
import { SocialIcon, type SocialIconId } from "@/components/ui/SocialIcon";
import { site, addressLine } from "@/content/site";
import { HoursTable } from "@/components/ui/HoursTable";

const main: { href: StaticPathname; key: string }[] = [
  { href: "/", key: "home" },
  { href: "/gallery", key: "gallery" },
  { href: "/contact", key: "contact" },
];

const more: { href: StaticPathname; key: string }[] = [
  { href: "/book", key: "book" },
  { href: "/account", key: "account" },
];

export function Footer() {
  const t = useTranslations();

  return (
    <footer className="relative z-[2] border-t border-hairline">
      <div className="wrap grid gap-12 py-16 md:grid-cols-[1.2fr_1fr_1fr_1.1fr]">
        <div className="grid content-start gap-5">
          <Wordmark variant="stacked" className="justify-items-start" />
          <p className="t-lede max-w-[28ch] text-sm">{addressLine}</p>
        </div>

        <FooterCol title={t("footer.main")}>
          {main.map((l) => (
            <Link key={l.href} href={l.href} className="-my-1 py-1 hover:text-ink">
              {t(`nav.${l.key}`)}
            </Link>
          ))}
        </FooterCol>

        <FooterCol title={t("footer.more")}>
          {more.map((l) => (
            <Link key={l.href} href={l.href} className="-my-1 py-1 hover:text-ink">
              {t(`nav.${l.key}`)}
            </Link>
          ))}
        </FooterCol>

        <div className="grid content-start gap-5">
          <h3 className="t-label">{t("footer.hours")}</h3>
          <HoursTable />
          <div className="flex gap-2">
            {site.social.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="grid size-9 place-items-center rounded-full border border-hairline text-muted transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-void"
              >
                <SocialIcon id={s.icon as SocialIconId} className="size-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="wrap flex flex-wrap items-center justify-between gap-4 border-t border-hairline py-6 text-[0.8125rem] text-muted-dim">
        <span>
          © {new Date().getFullYear()} {site.name}. {t("footer.rights")}
        </span>
        <a href={site.phoneHref} className="-my-1 py-1 font-mono hover:text-ink">
          {site.phone}
        </a>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid content-start gap-5">
      <h3 className="t-label">{title}</h3>
      <nav className="grid gap-1.5 text-sm text-muted">{children}</nav>
    </div>
  );
}
