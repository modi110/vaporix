"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import type { StaticPathname } from "@/i18n/routing";
import { Wordmark } from "@/components/brand/Wordmark";
import { PillLink } from "@/components/ui/PillButton";
import { LocaleSwitcher } from "./LocaleSwitcher";

const links: { href: StaticPathname; key: string }[] = [
  { href: "/services", key: "services" },
  { href: "/gallery", key: "gallery" },
  { href: "/about", key: "about" },
  { href: "/pricing", key: "pricing" },
  { href: "/contact", key: "contact" },
];

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

  // Lock the page behind the overlay while it is open.
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b py-[1.15rem] transition-[background-color,backdrop-filter,border-color] duration-400 ${
        stuck
          ? "border-hairline bg-void/70 backdrop-blur-xl"
          : "border-transparent"
      }`}
    >
      <div className="wrap flex items-center justify-between gap-6">
        <Link href="/" aria-label={t("home_aria")}>
          <Wordmark className="animate-flicker" />
        </Link>

        <nav className="hidden items-center gap-0.5 rounded-pill border border-hairline bg-white/[0.06] p-1.5 lg:flex">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-pill px-4.5 py-2.5 text-[0.8125rem] font-medium uppercase tracking-[0.11em] transition-colors duration-300 ${
                  active
                    ? "bg-ink text-void"
                    : "text-muted hover:text-ink"
                }`}
              >
                {t(l.key)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2.5">
          <LocaleSwitcher />
          <PillLink href="/book" size="sm" className="hidden sm:inline-flex">
            {t("book")}
          </PillLink>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? t("close") : t("menu")}
            className="grid size-10 place-items-center rounded-full border border-hairline lg:hidden"
          >
            <span className="relative block h-3 w-4">
              <span
                className={`absolute inset-x-0 top-0 h-px bg-ink transition-transform duration-300 ${
                  open ? "translate-y-1.5 rotate-45" : ""
                }`}
              />
              <span
                className={`absolute inset-x-0 bottom-0 h-px bg-ink transition-transform duration-300 ${
                  open ? "-translate-y-1.5 -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* full-screen overlay menu */}
      <div
        className={`fixed inset-0 top-0 z-40 grid bg-void/97 backdrop-blur-2xl transition-opacity duration-400 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <nav className="wrap flex flex-col justify-center gap-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="t-h2 border-b border-hairline py-4 transition-colors duration-300 hover:text-vapor"
            >
              {t(l.key)}
            </Link>
          ))}
          <PillLink
            href="/book"
            onClick={() => setOpen(false)}
            className="mt-8 justify-self-start"
          >
            {t("book")}
          </PillLink>
        </nav>
      </div>
    </header>
  );
}
