"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Ambient field of cyan light falling past the page.
 *
 * Drawn on a single canvas rather than as DOM nodes: forty elements each
 * carrying their own gradient would thrash the compositor, whereas one canvas
 * resolves the whole field in a single pass.
 *
 * Scroll velocity feeds the fall speed, so fast scrolling stretches the light
 * into streaks and coming to rest lets it settle back to a drift.
 */
type Streak = {
  x: number;
  y: number;
  len: number;
  w: number;
  sp: number;
  a: number;
};

export function VaporBeams() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const mm = gsap.matchMedia();

    mm.add(
      "(min-width: 900px) and (prefers-reduced-motion: no-preference)",
      () => {
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const rgb =
          getComputedStyle(document.documentElement)
            .getPropertyValue("--vapor-rgb")
            .trim() || "47,210,255";

        let w = 0;
        let h = 0;
        let streaks: Streak[] = [];
        let velocity = 0;

        const size = () => {
          w = canvas.width = window.innerWidth * dpr;
          h = canvas.height = window.innerHeight * dpr;
          canvas.style.width = `${window.innerWidth}px`;
          canvas.style.height = `${window.innerHeight}px`;

          const count = Math.round(window.innerWidth / 46);
          streaks = Array.from({ length: count }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            len: (70 + Math.random() * 250) * dpr,
            w: (0.5 + Math.random() * 2) * dpr,
            sp: 0.22 + Math.random() * 0.85,
            a: 0.1 + Math.random() * 0.34,
          }));
        };

        const trigger = ScrollTrigger.create({
          onUpdate: (self) => {
            velocity = self.getVelocity();
          },
        });

        const render = () => {
          // Velocity arrives in px/s; damp it into a per-frame boost.
          const boost = gsap.utils.clamp(-6, 26, velocity / 90);
          velocity *= 0.92;

          ctx.clearRect(0, 0, w, h);
          ctx.globalCompositeOperation = "lighter";

          for (const s of streaks) {
            s.y += (s.sp + boost) * dpr;
            if (s.y - s.len > h) {
              s.y = -s.len;
              s.x = Math.random() * w;
            }
            if (s.y + s.len < 0) {
              s.y = h + s.len;
              s.x = Math.random() * w;
            }

            const len = s.len * (1 + Math.min(Math.abs(boost) * 0.1, 3.4));
            const grad = ctx.createLinearGradient(0, s.y - len, 0, s.y);
            grad.addColorStop(0, `rgba(${rgb},0)`);
            grad.addColorStop(0.55, `rgba(${rgb},${s.a * 0.5})`);
            grad.addColorStop(1, `rgba(${rgb},0)`);
            ctx.fillStyle = grad;
            ctx.fillRect(s.x, s.y - len, s.w, len);
          }
        };

        size();
        window.addEventListener("resize", size);
        gsap.ticker.add(render);

        return () => {
          gsap.ticker.remove(render);
          window.removeEventListener("resize", size);
          trigger.kill();
        };
      },
    );

    return () => mm.revert();
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 opacity-85 max-[899px]:hidden motion-reduce:hidden"
    />
  );
}
