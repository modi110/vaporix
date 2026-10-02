"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";

import { Monogram } from "@/components/brand/Monogram";

function uncover(
  el: HTMLDivElement | null,
  covering: { current: boolean },
) {
  if (!el || !covering.current) return;
  covering.current = false;

  gsap.to(el, {
    yPercent: -100,
    duration: 0.55,
    ease: "power3.inOut",
    delay: 0.05,
    onComplete: () => gsap.set(el, { visibility: "hidden" }),
  });
}

/**
 * A blue panel that sweeps up over the page on every internal link click,
 * navigates while the screen is covered, then lifts off the new page.
 *
 * Mounted once in the layout — never remounted, unlike `template.tsx` — so
 * it survives the route swap it is covering. It has to sit outside
 * `SmoothScrollProvider`: that provider gives its content wrapper a
 * `transform` on desktop, and a transformed ancestor becomes the containing
 * block for any `position: fixed` descendant, which would pin this overlay
 * to the scrolling content instead of the viewport.
 *
 * The App Router has no exit phase, so this makes one: a capture-phase click
 * listener calls `preventDefault()` on same-origin link clicks, which makes
 * Next's `<Link>` skip its own navigation while still running the link's
 * `onClick` (the mobile menu still closes). Once covered, it pushes the
 * route itself. Back/forward never pass through here and swap instantly,
 * with `template.tsx`'s rise as the only motion.
 */
export function TransitionOverlay() {
  const ref = useRef<HTMLDivElement>(null);
  const covering = useRef(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const a = (e.target as Element).closest("a");
      if (!a || a.hasAttribute("download")) return;
      if (a.target && a.target !== "_self") return;

      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      // Same page (a hash jump, or the link to where you already are):
      // nothing is being replaced, so there is nothing to cover.
      if (url.pathname === location.pathname) return;

      const el = ref.current;
      if (!el || covering.current) return;

      e.preventDefault();
      covering.current = true;

      gsap.killTweensOf(el);
      gsap.fromTo(
        el,
        { yPercent: 100, visibility: "visible" },
        {
          yPercent: 0,
          duration: 0.45,
          ease: "power3.inOut",
          onComplete: () => {
            router.push(url.pathname + url.search + url.hash);
            // If the route never changes (an error, a redirect back here),
            // never leave the site stuck behind the panel.
            window.setTimeout(() => uncover(el, covering), 2500);
          },
        },
      );
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  useEffect(() => {
    uncover(ref.current, covering);
  }, [pathname]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[95] grid place-items-center bg-navy"
      style={{ visibility: "hidden" }}
    >
      <span className="block w-20">
        <Monogram />
      </span>
    </div>
  );
}
