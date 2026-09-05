"use client";

import { useTranslations } from "next-intl";

export const THEME_KEY = "vaporix:theme";

/**
 * Blocking script for <head>. Stamps `data-theme` on the document *before
 * first paint*, so a light-mode visitor never sees a black flash. React state
 * cannot act early enough to prevent that, which is why the choice lives on
 * the element rather than in a provider.
 *
 * A stored choice wins; otherwise the page follows the operating system, and
 * falls back to dark if neither is readable. Only an explicit toggle writes
 * to storage, so a visitor who has never touched it keeps tracking their
 * system for as long as they never do.
 */
export const themeScript = `try{var t=localStorage.getItem(${JSON.stringify(
  THEME_KEY,
)});if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="dark"}`;

/**
 * Holds no React state on purpose: both icons are always in the DOM and CSS
 * decides which one shows, keyed off the same `data-theme` attribute the head
 * script wrote. Server and client markup therefore always agree, whatever the
 * stored preference.
 */
export function ThemeToggle() {
  const t = useTranslations("nav");

  const toggle = () => {
    const el = document.documentElement;
    const next = el.dataset.theme === "light" ? "dark" : "light";
    el.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Private browsing can throw; the choice just will not survive a reload.
    }
    // The beams canvas paints outside CSS, so it listens for this.
    window.dispatchEvent(new CustomEvent("vaporix:themechange"));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t("theme")}
      title={t("theme")}
      className="grid size-10 place-items-center rounded-full border border-hairline text-muted transition-colors duration-300 hover:border-ink hover:text-ink"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="size-[1.05rem]"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* moon — offered while the page is light */}
        <path
          className="theme-icon-moon"
          d="M20.2 14.2A8.4 8.4 0 0 1 9.8 3.8a8.4 8.4 0 1 0 10.4 10.4Z"
        />
        {/* sun — offered while the page is dark */}
        <g className="theme-icon-sun">
          <circle cx="12" cy="12" r="4.1" />
          <path d="M12 2.6v2.2M12 19.2v2.2M4.2 12H2M22 12h-2.2M6.5 6.5 4.9 4.9M19.1 19.1l-1.6-1.6M17.5 6.5l1.6-1.6M4.9 19.1l1.6-1.6" />
        </g>
      </svg>
    </button>
  );
}
