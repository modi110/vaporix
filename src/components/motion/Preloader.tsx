"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { BrandMark } from "@/components/brand/BrandMark";

export const PRELOAD_KEY = "vaporix:preloaded";

/**
 * Blocking script for <head>. Stamps the document *before first paint* when
 * the curtain has already been shown this session, so a repeat visit never
 * flashes it. Same pattern a theme script uses, and for the same reason:
 * React state cannot act early enough to prevent the flash.
 */
export const preloadFlagScript = `try{if(sessionStorage.getItem(${JSON.stringify(
  PRELOAD_KEY,
)})==="1")document.documentElement.dataset.preloaded="1"}catch(e){}`;

/**
 * First paint: the lockup wipes in from the left, the bar fills, and the
 * curtain lifts into the hero.
 *
 * Holds no React state — the element is always rendered so server and client
 * markup agree, and the effect either plays the timeline or steps aside. That
 * keeps hydration honest and avoids a cascading render on every mount.
 */
export function Preloader() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    // Already seen this session: the head script has hidden it via CSS.
    if (document.documentElement.dataset.preloaded === "1") return;

    document.documentElement.style.overflow = "hidden";

    const release = () => {
      document.documentElement.style.overflow = "";
      document.documentElement.dataset.preloaded = "1";
      try {
        sessionStorage.setItem(PRELOAD_KEY, "1");
      } catch {
        // Private browsing can throw; worst case the curtain plays again.
      }
    };

    const ctx = gsap.context(() => {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const tl = gsap.timeline({ onComplete: release });

      if (reduce) {
        tl.set(".preloader-mark", { clipPath: "inset(0 0% 0 0)" }).to(
          el,
          { autoAlpha: 0, duration: 0.2 },
          "+=0.1",
        );
        return;
      }

      tl.fromTo(
        ".preloader-mark",
        { clipPath: "inset(0 100% 0 0)" },
        { clipPath: "inset(0 0% 0 0)", duration: 0.9, ease: "power3.inOut" },
      )
        .from(".preloader-tag", { autoAlpha: 0, y: 8, duration: 0.4 }, "-=0.3")
        .to(
          ".preloader-bar-fill",
          { scaleX: 1, duration: 0.7, ease: "power2.inOut" },
          "-=0.75",
        )
        .to(el, { yPercent: -101, duration: 0.9, ease: "expo.inOut" }, "+=0.15");
    }, root);

    return () => {
      ctx.revert();
      document.documentElement.style.overflow = "";
    };
  }, []);

  return (
    <div
      ref={root}
      id="preloader"
      aria-hidden="true"
      className="fixed inset-0 z-[100] grid place-items-center bg-void"
    >
      <div className="grid w-[min(280px,66vw)] justify-items-center gap-7">
        <BrandMark className="preloader-mark w-full text-vapor-ink drop-shadow-[0_0_18px_rgba(var(--vapor-rgb),0.55)]" />

        <div className="preloader-tag t-label text-[0.5625rem] tracking-[0.34em]">
          Detailing &amp; Care
        </div>

        <div className="h-0.5 w-full overflow-hidden bg-hairline">
          <div className="preloader-bar-fill h-full origin-left scale-x-0 bg-vapor-ink" />
        </div>
      </div>
    </div>
  );
}
