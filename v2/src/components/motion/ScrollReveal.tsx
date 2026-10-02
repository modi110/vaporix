"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Fades every section's blocks in as they scroll into view, site-wide,
 * without each section having to opt in.
 *
 * Targets the top-level blocks of each `<section>` inside `<main>` — the
 * children of its `.wrap` when it has one, plus anything sitting beside the
 * wrap (the full-bleed photo rails). The hero is skipped: it is a full-screen
 * carousel with its own motion.
 *
 * Only blocks still *below* the fold get hidden. Hiding something already on
 * screen would make it blink out and back in after hydration; those are
 * covered by `template.tsx`'s page entrance instead. Blocks that enter
 * together are staggered so a row reads as a sequence, not a flash.
 *
 * Re-runs on every pathname change, since `layout.tsx` keeps this mounted
 * while the page content underneath it is replaced.
 */
export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const targets: HTMLElement[] = [];
    document
      .querySelectorAll<HTMLElement>(
        'main section:not([aria-roledescription="carousel"])',
      )
      .forEach((section) => {
        for (const child of Array.from(section.children) as HTMLElement[]) {
          if (child.classList.contains("wrap")) {
            targets.push(...(Array.from(child.children) as HTMLElement[]));
          } else {
            targets.push(child);
          }
        }
      });

    const fold = window.innerHeight;
    const pending = targets.filter(
      (el) => el.getBoundingClientRect().top > fold,
    );

    const io = new IntersectionObserver(
      (entries) => {
        let i = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          el.style.transitionDelay = `${Math.min(i, 4) * 90}ms`;
          el.classList.add("is-in");
          io.unobserve(el);
          // Hand the element back once it has settled, so the reveal's
          // `transition` stops overriding the block's own hover transitions.
          window.setTimeout(() => {
            el.removeAttribute("data-reveal");
            el.classList.remove("is-in");
            el.style.transitionDelay = "";
          }, 1300);
          i++;
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );

    for (const el of pending) {
      el.setAttribute("data-reveal", "");
      io.observe(el);
    }

    return () => {
      io.disconnect();
      for (const el of pending) {
        el.removeAttribute("data-reveal");
        el.classList.remove("is-in");
        el.style.transitionDelay = "";
      }
    };
  }, [pathname]);

  return null;
}
