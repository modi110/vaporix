"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

/**
 * A quiet cross-fade over every route change, on phone and desktop alike.
 *
 * Mounted once in the layout — never remounted, unlike `template.tsx` — so it
 * can watch `usePathname()` across the whole session and tell a real
 * navigation from the first render. It has to sit outside
 * `SmoothScrollProvider`: that provider gives its content wrapper a
 * `transform` on desktop, and a transformed ancestor becomes the containing
 * block for any `position: fixed` descendant, which would pin this overlay
 * to the scrolling content instead of the viewport.
 *
 * The App Router swaps a route's content in one commit, with no exit phase
 * to animate — so this covers immediately on the pathname change already
 * having happened, then wipes away, which reads as a deliberate transition
 * rather than a raw swap. `template.tsx` handles the incoming page's own
 * rise-and-settle underneath it.
 */
export function TransitionOverlay() {
  const ref = useRef<HTMLDivElement>(null);
  const prevPathname = useRef<string | null>(null);

  const pathname = usePathname();

  useEffect(() => {
    // First render: nothing has navigated yet, so there is nothing to wipe.
    if (prevPathname.current === null) {
      prevPathname.current = pathname;
      return;
    }
    if (prevPathname.current === pathname) return;
    prevPathname.current = pathname;

    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.set(el, { visibility: "visible", opacity: 1 });
    gsap.to(el, {
      opacity: 0,
      duration: 0.25,
      ease: "power2.out",
      onComplete: () => gsap.set(el, { visibility: "hidden" }),
    });
  }, [pathname]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[95] bg-navy opacity-0"
      style={{ visibility: "hidden" }}
    />
  );
}
