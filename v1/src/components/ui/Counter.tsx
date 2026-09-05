"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Counts up once, when the number first enters the viewport. */
export function Counter({ to, className }: { to: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        el.textContent = String(to);
        return;
      }
      const obj = { n: 0 };
      gsap.to(obj, {
        n: to,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
        onUpdate: () => {
          el.textContent = String(Math.round(obj.n));
        },
      });
    }, ref);

    return () => ctx.revert();
  }, [to]);

  return (
    <span ref={ref} className={className}>
      0
    </span>
  );
}
