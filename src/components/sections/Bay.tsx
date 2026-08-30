"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * The detailing bay: a perspective light tunnel built entirely in CSS.
 *
 * This stands in for the cinematic photography the client will supply. It is
 * not filler — it establishes the depth the hero composition depends on, and
 * when a real render replaces it the layers and their scroll behaviour stay
 * exactly the same.
 *
 * Three things move here:
 *   1. the pointer tilts the tunnel, so the space feels physical
 *   2. light bars sweep down its length on a loop
 *   3. scrolling pushes the whole bay away and dims it
 */
export function Bay() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add(
        "(min-width: 900px) and (prefers-reduced-motion: no-preference)",
        () => {
          // Pointer tilt — damped with quickTo so it trails the cursor
          // instead of snapping to it.
          const tiltX = gsap.quickTo(".bay-stage", "rotateX", {
            duration: 0.9,
            ease: "power3",
          });
          const tiltY = gsap.quickTo(".bay-stage", "rotateY", {
            duration: 0.9,
            ease: "power3",
          });
          const shiftX = gsap.quickTo(".bay-parallax", "xPercent", {
            duration: 1.1,
            ease: "power3",
          });

          const onMove = (e: PointerEvent) => {
            const nx = e.clientX / window.innerWidth - 0.5;
            const ny = e.clientY / window.innerHeight - 0.5;
            tiltX(66 - ny * 5);
            tiltY(nx * 7);
            shiftX(nx * -2.5);
          };
          window.addEventListener("pointermove", onMove);

          // Leaving the hero pushes the bay back and fades it out.
          const exit = gsap.timeline({
            scrollTrigger: {
              trigger: el.parentElement,
              start: "top top",
              end: "bottom top",
              scrub: 1,
            },
          });
          exit
            .to(".bay-stage", { scale: 1.35, ease: "none" }, 0)
            .to(el, { opacity: 0.25, ease: "none" }, 0);

          return () => window.removeEventListener("pointermove", onMove);
        },
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="absolute inset-0 z-0 overflow-hidden bg-void"
      style={{ perspective: "760px" }}
    >
      {/* the tunnel itself, laid flat and tilted into depth */}
      <div
        className="bay-stage absolute left-1/2 top-[44%] h-[120vmax] w-[190vmax] -translate-x-1/2 -translate-y-1/2 will-change-transform"
        style={{
          transform:
            "translate(-50%,-50%) rotateX(66deg) rotateY(0deg) scale(1)",
          transformStyle: "preserve-3d",
        }}
      >
        <div
          className="bay-parallax absolute inset-0"
          style={{
            background: `
              repeating-linear-gradient(90deg, transparent 0 7.2%, rgba(var(--vapor-rgb),.5) 7.2% 7.9%, transparent 7.9% 15%),
              repeating-linear-gradient(0deg, transparent 0 9%, rgba(var(--vapor-rgb),.16) 9% 9.5%, transparent 9.5% 18%)
            `,
            maskImage:
              "radial-gradient(ellipse 62% 52% at 50% 42%, #000 0%, transparent 76%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 62% 52% at 50% 42%, #000 0%, transparent 76%)",
          }}
        />

        {/* light sweeping down the length of the bay */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute inset-x-0 h-[18%] motion-reduce:hidden"
            style={{
              background:
                "linear-gradient(to bottom, transparent, rgba(var(--vapor-rgb),.22), transparent)",
              animation: `vaporix-sweep ${11 + i * 3}s linear ${i * 3.6}s infinite`,
              maskImage:
                "radial-gradient(ellipse 60% 100% at 50% 50%, #000, transparent 78%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 60% 100% at 50% 50%, #000, transparent 78%)",
            }}
          />
        ))}
      </div>

      {/* the hot core at the end of the tunnel */}
      <div className="absolute left-1/2 top-[42%] aspect-square w-[min(760px,72vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(var(--vapor-rgb),.34)_0%,rgba(var(--vapor-rgb),.08)_40%,transparent_68%)]" />

      {/* steam drifting through the frame */}
      <div className="animate-drift absolute left-[12%] top-[30%] aspect-square w-[42vw] rounded-full bg-[radial-gradient(circle,rgba(var(--vapor-rgb),.10),transparent_65%)] blur-[60px]" />
      <div
        className="animate-drift absolute right-[8%] top-[46%] aspect-square w-[34vw] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.05),transparent_62%)] blur-[70px]"
        style={{ animationDelay: "-13s" }}
      />

      {/* floor bounce + vignette that carries the type */}
      <div className="absolute inset-x-0 bottom-0 h-[52%] bg-[linear-gradient(to_top,rgba(var(--vapor-rgb),.13),transparent_72%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_top,var(--color-void)_4%,transparent_46%),linear-gradient(to_right,var(--color-void)_0%,transparent_26%,transparent_74%,var(--color-void)_100%)]" />
    </div>
  );
}
