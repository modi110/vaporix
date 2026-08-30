"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

/**
 * Owns the single ScrollSmoother instance and the site-wide reveal triggers.
 *
 * Everything lives in one gsap.context() that is reverted on unmount, which is
 * what keeps App Router navigation from stacking duplicate ScrollTriggers —
 * the classic bug in GSAP + Next integrations.
 *
 * Smoothing and parallax are desktop-only and switch off entirely under
 * prefers-reduced-motion, where the reveals resolve to their final state.
 */
export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // Smoothing: desktop, full motion only. Touch keeps native scrolling.
      mm.add(
        "(min-width: 900px) and (prefers-reduced-motion: no-preference)",
        () => {
          document.documentElement.classList.add("smooth-on");
          const smoother = ScrollSmoother.create({
            wrapper: "#smooth-wrapper",
            content: "#smooth-content",
            smooth: 1.15,
            effects: true, // enables data-speed / data-lag parallax
            normalizeScroll: true,
          });
          return () => {
            smoother.kill();
            document.documentElement.classList.remove("smooth-on");
          };
        },
      );

      // Reveals: one trigger per element, fired once, in every media context.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const items = gsap.utils.toArray<HTMLElement>(
          "[data-reveal],[data-split],[data-clip]",
        );
        items.forEach((el) => {
          ScrollTrigger.create({
            trigger: el,
            start: "top 88%",
            once: true,
            onEnter: () => el.classList.add("is-in"),
          });
        });
      });

      // Reduced motion: nothing animates, everything is simply present.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.utils
          .toArray<HTMLElement>("[data-reveal],[data-split],[data-clip]")
          .forEach((el) => el.classList.add("is-in"));
      });
    }, root);

    return () => ctx.revert();
  }, [pathname]);

  return (
    <div ref={root} id="smooth-wrapper">
      <div id="smooth-content">{children}</div>
    </div>
  );
}
