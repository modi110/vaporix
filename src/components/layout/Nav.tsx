"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import type { StaticPathname } from "@/i18n/routing";
import { Wordmark } from "@/components/brand/Wordmark";
import { PillLink, PillAnchor } from "@/components/ui/PillButton";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { site } from "@/content/site";

const links: { href: StaticPathname; key: string }[] = [
  { href: "/", key: "home" },
  { href: "/services", key: "services" },
  { href: "/gallery", key: "gallery" },
  { href: "/about", key: "about" },
  { href: "/pricing", key: "pricing" },
  { href: "/contact", key: "contact" },
  { href: "/account", key: "account" },
];

/**
 * The phone gets the whole bar to itself: mark on the left, one button on the
 * right, nothing between them. Language and theme move into the sheet, where
 * there is room to label them, rather than crowding a 390px header with three
 * unlabelled circles.
 */
export function Nav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /**
   * Locking the page behind the sheet takes both properties: `overflow` alone
   * leaves iOS rubber-banding the body under the overlay, and the smooth
   * scroller keeps its own transform on the content either way.
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

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,backdrop-filter,border-color] duration-400 ${
          stuck || open
            ? "border-hairline bg-void/80 backdrop-blur-xl"
            : "border-transparent"
        }`}
        style={{ paddingTop: "max(0.85rem, env(safe-area-inset-top))" }}
      >
        <div className="wrap flex items-center justify-between gap-4 pb-[0.85rem]">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="relative z-10 -my-2 py-2"
          >
            <Wordmark className="animate-flicker" label={t("home_aria")} />
          </Link>

          <nav className="hidden items-center gap-0.5 rounded-pill border border-hairline tint-weak p-1.5 lg:flex">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`whitespace-nowrap rounded-pill px-3.5 py-2.5 text-[0.8125rem] font-medium uppercase tracking-[0.11em] transition-colors duration-300 xl:px-4.5 ${
                    active ? "bg-ink text-void" : "text-muted hover:text-ink"
                  }`}
                >
                  {t(l.key)}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2.5">
            <div className="hidden items-center gap-2.5 lg:flex">
              <LocaleSwitcher />
              <ThemeToggle />
              <PillLink href="/book" size="sm">
                {t("book")}
              </PillLink>
            </div>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? t("close") : t("menu")}
              className="relative z-10 grid size-11 place-items-center rounded-full border border-hairline tint-weak transition-colors duration-300 active:border-hairline-strong lg:hidden"
            >
              <span className="relative block h-3.5 w-[18px]">
                <span
                  className={`absolute inset-x-0 top-0 h-[1.5px] rounded bg-ink transition-transform duration-300 ${
                    open ? "translate-y-[6.5px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`absolute inset-x-0 bottom-0 h-[1.5px] rounded bg-ink transition-transform duration-300 ${
                    open ? "-translate-y-[6.5px] -rotate-45" : ""
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/*
        The sheet is a sibling of the header, not a child, and that is not a
        style choice: the header carries `backdrop-filter` once it sticks, and
        a backdrop filter makes the element a containing block for every
        `position: fixed` descendant. Nested, the full-screen sheet resolved
        against the 70px bar and all but disappeared.
      */}
      <div
        id="mobile-menu"
        // Hidden from the tree when shut, so a swipe never lands on a link
        // that is only invisible.
        inert={!open}
        className={`fixed inset-0 z-40 flex flex-col overflow-y-auto overscroll-contain bg-void transition-[opacity,visibility] duration-300 lg:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
        style={{
          paddingTop: "calc(max(0.85rem, env(safe-area-inset-top)) + 4.2rem)",
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
                style={{ transitionDelay: open ? `${90 + i * 45}ms` : "0ms" }}
                className={`flex items-baseline gap-4 border-b border-hairline py-3.5 text-[clamp(1.6rem,7.5vw,2.4rem)] font-medium leading-none tracking-[-0.03em] transition-[opacity,transform,color] duration-500 ${
                  open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                } ${active ? "text-vapor-ink" : "text-ink"}`}
              >
                <span className="font-mono text-xs tabular-nums text-muted-dim">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {t(l.key)}
              </Link>
            );
          })}
        </nav>

        <div
          className="wrap grid w-full gap-5 pt-2"
          style={{ transitionDelay: open ? "420ms" : "0ms" }}
        >
          <div className="flex items-center justify-between gap-4 border-t border-hairline pt-5">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <PillLink
              href="/book"
              onClick={() => setOpen(false)}
              className="justify-center"
            >
              {t("book")}
            </PillLink>
            <PillAnchor
              href={site.whatsapp}
              variant="ghost"
              className="justify-center"
            >
              WhatsApp
            </PillAnchor>
          </div>

          <a
            href={site.phoneHref}
            className="font-mono text-sm text-muted transition-colors hover:text-ink"
          >
            {site.phone}
          </a>
        </div>
      </div>
    </>
  );
}
