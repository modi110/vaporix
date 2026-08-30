"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { MONOGRAM_PATHS, MONOGRAM_VIEWBOX } from "@/components/brand/Monogram";

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
 * First paint: the VRK monogram draws itself, floods with cyan, and the
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

      const paths = gsap.utils.toArray<SVGPathElement>(".preloader-path");
      paths.forEach((p) => {
        const len = p.getTotalLength();
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      });

      const tl = gsap.timeline({ onComplete: release });

      if (reduce) {
        tl.set(paths, { strokeDashoffset: 0, fill: "var(--color-vapor)" }).to(
          el,
          { autoAlpha: 0, duration: 0.2 },
          "+=0.1",
        );
        return;
      }

      tl.to(paths, {
        strokeDashoffset: 0,
        duration: 1,
        ease: "power2.inOut",
        stagger: 0.08,
      })
        .to(paths, { fill: "var(--color-vapor)", duration: 0.45 }, "-=0.25")
        .to(".preloader-word", { autoAlpha: 1, y: 0, duration: 0.5 }, "-=0.3")
        .to(
          ".preloader-bar-fill",
          { scaleX: 1, duration: 0.7, ease: "power2.inOut" },
          "-=0.85",
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
      <div className="grid justify-items-center gap-8">
        <svg
          viewBox={MONOGRAM_VIEWBOX}
          className="w-[min(240px,56vw)] drop-shadow-[0_0_18px_rgba(47,210,255,0.55)]"
        >
          <g transform="skewX(-8) translate(14,0)">
            {MONOGRAM_PATHS.map((d, i) => (
              <path
                key={i}
                d={d}
                fillRule={i === 1 ? "evenodd" : undefined}
                className="preloader-path"
                fill="rgba(47,210,255,0)"
                stroke="var(--color-vapor)"
                strokeWidth={2.5}
                strokeLinejoin="miter"
              />
            ))}
          </g>
        </svg>

        <div className="preloader-word translate-y-2 text-[0.8125rem] font-bold tracking-[0.62em] indent-[0.62em] opacity-0">
          VAPORIX
        </div>

        <div className="h-0.5 w-[min(220px,52vw)] overflow-hidden bg-hairline">
          <div className="preloader-bar-fill h-full origin-left scale-x-0 bg-vapor" />
        </div>
      </div>
    </div>
  );
}
