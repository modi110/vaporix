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
  { href: "/loyalty", key: "loyalty" },
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
        // Both heroes are full-bleed photographs now (the cars on a phone,
        // the studio at dusk from `md` up), so the bar is transparent over
        // either, with a dark fade keeping the white controls readable
        // against a bright sky.
        className={`fixed inset-x-0 top-0 z-50 bg-navy transition-[background-color] duration-300 ${
          transparent ? "bg-transparent bg-[linear-gradient(to_bottom,rgba(0,0,0,.75)_0%,rgba(0,0,0,.4)_65%,transparent_100%)]" : ""
        }`}
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center px-[var(--gutter)]">
          <div className="flex items-center gap-1 justify-self-start">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="site-menu"
              className="flex h-11 items-center gap-2.5 text-xs uppercase text-pearl"
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
            {/* On a phone the right side has no room for a third control
                beside the language and booking buttons, so the card sits by
                the menu instead. From `sm` up it moves beside the language
                button. */}
            <LoyaltyLink
              active={pathname === "/loyalty"}
              label={t("loyaltyCard")}
              onClick={() => setOpen(false)}
              className="sm:hidden"
            />
          </div>

          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="justify-self-center py-2"
          >
            <Wordmark />
          </Link>

          <div className="flex items-center gap-1.5 justify-self-end sm:gap-2">
            <LoyaltyLink
              active={pathname === "/loyalty"}
              label={t("loyaltyCard")}
              onClick={() => setOpen(false)}
              className="max-sm:hidden"
            />
            <LocaleSwitcher />
            <ButtonLink
              href="/book"
              variant="outlined"
              arrow={false}
              className="hidden text-pearl max-sm:px-3.5 max-sm:py-2 max-sm:text-[0.6875rem] sm:inline-flex"
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
                // would be invisible against it, so brightness carries the
                // distinction instead: full white and dimmed white. 60% white
                // still clears 3:1, which is the bar for type this large.
                className={`t-display-lg border-b border-hairline-dark py-3 transition-[opacity,transform,color] duration-500 ${
                  open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                } ${active ? "text-pearl" : "text-pearl/60"}`}
              >
                {t(l.key)}
              </Link>
            );
          })}
        </nav>

        <div className="wrap grid w-full gap-4 pt-2">
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

/**
 * The loyalty card, one tap from anywhere: the programme was only reachable
 * through the menu, and a visitor who never opened the menu never learned it
 * existed. Same ring as the language button, so the bar gains a control, not
 * a new shape.
 */
function LoyaltyLink({
  active,
  label,
  onClick,
  className = "",
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <Link
      href="/loyalty"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-current={active ? "page" : undefined}
      className={`group grid min-h-11 min-w-11 place-items-center text-pearl ${className}`}
    >
      <span
        className={`grid size-9 place-items-center rounded-full border transition-colors duration-150 group-hover:border-pearl group-active:border-pearl ${
          active ? "border-pearl" : "border-steel"
        }`}
      >
        <GiftIcon />
      </span>
    </Link>
  );
}

/** A wrapped gift: the reward the loyalty card earns. */
function GiftIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-4"
    >
      <path d="M3.5 9.5h13v7h-13zM2.5 6.5h15v3h-15zM10 6.5v10" />
      <path d="M10 6.5C8.8 3.6 5.6 3.4 5.6 5.1c0 1.1 1.9 1.4 4.4 1.4zM10 6.5c1.2-2.9 4.4-3.1 4.4-1.4 0 1.1-1.9 1.4-4.4 1.4z" />
    </svg>
  );
}
