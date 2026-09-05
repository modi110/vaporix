"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Next remounts `template.tsx` on every navigation within this segment
 * (unlike `layout.tsx`, which persists) — that is exactly the hook a page
 * entrance animation needs, and the only one the App Router offers without a
 * routing library. The new page rises and settles in; the matching cyan
 * sweep that covers the swap lives in `TransitionOverlay`, mounted once in
 * the layout so it is never itself remounted mid-transition.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.from(el, {
        opacity: 0,
        y: 18,
        duration: 0.6,
        ease: "expo.out",
        delay: 0.08,
      });
    });

    return () => ctx.revert();
  }, []);

  return <div ref={root}>{children}</div>;
}
