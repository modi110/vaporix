"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import type { StaticPathname } from "@/i18n/routing";
import { Wordmark } from "@/components/brand/Wordmark";
import { ButtonLink, ButtonAnchor } from "@/components/ui/Button";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { site } from "@/content/site";

const links: { href: StaticPathname; key: string }[] = [
  { href: "/", key: "home" },
  { href: "/services", key: "services" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
];

/**
 * design.md's top bar: hamburger and label left, mark centred, actions right,
 * on the navy band and with no rule beneath it — the dark bar meets the dark
 * hero directly, and a border there would only draw a line across the seam.
 *
 * The booking button is `outlined`, not yellow. One Giallo element per
 * viewport is the rule, and on a phone this bar shares its viewport with the
 * hero's own yellow button.
 */
export function Nav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  /**
   * Only the home page has a full-bleed photo starting at y=0 under this bar
   * — every other page sits its own navy header directly against it
   * (`PageHeader`), so an opaque bar there is already seamless. Here it isn't:
   * a solid bar across the top of the hero photo is exactly what stopped it
   * reading as full-screen, so it stays transparent until the first scroll.
   */
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(!isHome);

  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const transparent = isHome && !scrolled;

  /**
   * Locking the page behind the sheet takes both properties: `overflow` alone
   * leaves iOS rubber-banding the body underneath the overlay.
   */
  useEffect(() => {
    const root = document.documentElement;
    root.style.overflow = open ? "hidden" : "";
    root.style.overscrollBehavior = open ? "none" : "";
    return () => {
      root.style.overflow = "";
      root.style.overscrollBehavior = "";
    };
  }, [open]);

  // Escape closes the sheet, the way any overlay should.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header
        // Mobile-only: the desktop hero splits into navy/photo/Giallo panels,
        // and a transparent bar over the right-hand yellow one leaves the
        // outlined RESERVAR button all but unreadable — white on white,
        // roughly. Desktop never had the "doesn't feel full-screen" problem
        // this solves, so `md:` forces it back to a plain navy bar there.
        className={`fixed inset-x-0 top-0 z-50 bg-navy transition-[background-color] duration-300 md:bg-navy md:bg-none ${
          transparent ? "max-md:bg-transparent max-md:bg-[linear-gradient(to_bottom,rgba(0,0,0,.75)_0%,rgba(0,0,0,.4)_65%,transparent_100%)]" : ""
        }`}
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center px-[var(--gutter)]">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="site-menu"
            className="flex h-11 items-center gap-2.5 justify-self-start text-xs uppercase text-pearl"
          >
            <span aria-hidden="true" className="relative block h-3 w-4">
              <span
                className={`absolute inset-x-0 top-0 h-px bg-pearl transition-transform duration-300 ${
                  open ? "translate-y-1.5 rotate-45" : ""
                }`}
              />
              <span
                className={`absolute inset-x-0 bottom-0 h-px bg-pearl transition-transform duration-300 ${
                  open ? "-translate-y-1.5 -rotate-45" : ""
                }`}
              />
            </span>
            {open ? t("close") : t("menu")}
          </button>

          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="justify-self-center py-2"
          >
            <Wordmark />
          </Link>

          <div className="justify-self-end">
            <ButtonLink
              href="/book"
              variant="outlined"
              arrow={false}
              className="hidden text-pearl sm:inline-flex"
            >
              {t("book")}
            </ButtonLink>
          </div>
        </div>
      </header>

      <div
        id="site-menu"
        // Hidden from the tree when shut, so a swipe never lands on a link
        // that is merely invisible.
        inert={!open}
        className={`fixed inset-0 z-40 flex flex-col overflow-y-auto overscroll-contain bg-navy transition-[opacity,visibility] duration-300 ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
        style={{
          paddingTop: "calc(env(safe-area-inset-top) + 5rem)",
          paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))",
        }}
      >
        <nav className="wrap flex w-full flex-1 flex-col justify-center gap-1 py-6">
          {links.map((l, i) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                style={{ transitionDelay: open ? `${80 + i * 45}ms` : "0ms" }}
                // The current page used to pick up the accent colour, but the
                // sheet itself is that same blue now — a colour swap here
                // would be invisible against it, so weight carries the
                // distinction instead: full white and dimmed white.
                className={`t-display-lg border-b border-hairline-dark py-3 transition-[opacity,transform,color] duration-500 ${
                  open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                } ${active ? "text-pearl" : "text-muted-invert"}`}
              >
                {t(l.key)}
              </Link>
            );
          })}
        </nav>

        <div className="wrap grid w-full gap-4 pt-2">
          <LocaleSwitcher />
          <ButtonLink
            href="/book"
            variant="white"
            onClick={() => setOpen(false)}
            className="w-full"
          >
            {t("book")}
          </ButtonLink>
          <ButtonAnchor href={site.whatsapp} variant="white" className="w-full">
            WhatsApp
          </ButtonAnchor>
          <a
            href={site.phoneHref}
            className="t-caption py-2 transition-colors hover:text-pearl"
          >
            {site.phone}
          </a>
        </div>
      </div>
    </>
  );
}
