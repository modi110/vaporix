"use client";

import { useEffect, useRef } from "react";

/**
 * The hero opens dirty. Dragging the pointer wipes the grime away in
 * cloth-width strokes, and clearing enough of it makes the rest dissolve.
 *
 * Why a canvas: erasing is `destination-out` compositing, which no CSS mask
 * can do progressively without rebuilding a gradient every frame.
 *
 * Deliberate limits:
 *  - Interactive wiping is gated to fine pointers. On touch the layer would
 *    have to swallow vertical drags to work, which fights the page scroll, so
 *    coarse pointers get an automatic sweep instead.
 *  - Reduced motion skips the layer entirely; the shot is simply clean.
 *  - Nothing readable lives under here. The headline sits above it, so text
 *    contrast never depends on how much a visitor has wiped.
 */
type Props = {
  /** Fraction of the surface that must be cleared before it dissolves. */
  threshold?: number;
  onCleared?: () => void;
  className?: string;
};

const GRID_X = 32;
const GRID_Y = 18;

export function GrimeLayer({
  threshold = 0.5,
  onCleared,
  className = "",
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const dissolve = () => {
      canvas.style.opacity = "0";
      onCleared?.();
    };

    if (reduce) {
      // Deferred by a frame so the resolution never lands mid-render.
      const id = requestAnimationFrame(dissolve);
      return () => cancelAnimationFrame(id);
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let raf = 0;
    let finished = false;
    const cleared = new Set<number>();

    /** Grime: a dirty film, uneven, with condensation blooms and speckle. */
    const paint = () => {
      const rect = canvas.getBoundingClientRect();
      w = canvas.width = Math.max(1, Math.round(rect.width * dpr));
      h = canvas.height = Math.max(1, Math.round(rect.height * dpr));

      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, w, h);

      const base = ctx.createLinearGradient(0, 0, 0, h);
      base.addColorStop(0, "rgba(9,13,16,.94)");
      base.addColorStop(0.5, "rgba(14,20,24,.90)");
      base.addColorStop(1, "rgba(7,10,12,.95)");
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, w, h);

      // condensation blooms
      for (let i = 0; i < 26; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = (60 + Math.random() * 190) * dpr;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        const a = 0.05 + Math.random() * 0.09;
        g.addColorStop(0, `rgba(150,175,185,${a})`);
        g.addColorStop(1, "rgba(150,175,185,0)");
        ctx.fillStyle = g;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      }

      // dust speckle
      ctx.fillStyle = "rgba(190,205,212,.05)";
      const specks = Math.round((w * h) / (2400 * dpr));
      for (let i = 0; i < specks; i++) {
        ctx.fillRect(Math.random() * w, Math.random() * h, dpr, dpr);
      }
    };

    /** A cloth stroke: soft-edged, slightly wider than it is tall. */
    const wipeAt = (x: number, y: number) => {
      const r = Math.min(w, h) * 0.16;
      ctx.globalCompositeOperation = "destination-out";
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, "rgba(0,0,0,1)");
      g.addColorStop(0.55, "rgba(0,0,0,.9)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(1.25, 1);
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Mark every cell the stroke actually covers, not just the one under the
      // centre — the brush is far wider than a cell, and counting only the
      // centre made the completion threshold unreachable in practice.
      const spanX = Math.max(1, Math.round((r * 1.25) / (w / GRID_X)));
      const spanY = Math.max(1, Math.round(r / (h / GRID_Y)));
      const cx = Math.floor((x / w) * GRID_X);
      const cy = Math.floor((y / h) * GRID_Y);
      for (let gy = cy - spanY; gy <= cy + spanY; gy++) {
        if (gy < 0 || gy >= GRID_Y) continue;
        for (let gx = cx - spanX; gx <= cx + spanX; gx++) {
          if (gx < 0 || gx >= GRID_X) continue;
          cleared.add(gy * GRID_X + gx);
        }
      }
    };

    /** Interpolate so a fast drag leaves a continuous swipe, not dots. */
    const wipeLine = (x0: number, y0: number, x1: number, y1: number) => {
      const dist = Math.hypot(x1 - x0, y1 - y0);
      const step = Math.max(6 * dpr, Math.min(w, h) * 0.035);
      const n = Math.max(1, Math.ceil(dist / step));
      for (let i = 1; i <= n; i++) {
        wipeAt(x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n);
      }
    };

    const checkDone = () => {
      if (finished) return;
      if (cleared.size / (GRID_X * GRID_Y) < threshold) return;
      finished = true;
      dissolve();
    };

    paint();

    let last: [number, number] | null = null;

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * dpr;
      const y = (e.clientY - rect.top) * dpr;
      if (x < 0 || y < 0 || x > w || y > h) {
        last = null;
        return;
      }
      if (last) wipeLine(last[0], last[1], x, y);
      else wipeAt(x, y);
      last = [x, y];
      checkDone();
    };

    /** Coarse pointers get the reveal performed for them. */
    const autoSweep = () => {
      const t0 = performance.now();
      const dur = 2100;
      const tick = (t: number) => {
        const p = Math.min((t - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const y = h * (0.28 + Math.sin(eased * Math.PI * 2) * 0.16);
        wipeLine(w * (eased - 0.04), y, w * eased, y);
        if (p < 1) raf = requestAnimationFrame(tick);
        else {
          finished = true;
          dissolve();
        }
      };
      raf = requestAnimationFrame(tick);
    };

    const onResize = () => {
      if (finished) return;
      cleared.clear();
      paint();
    };

    if (fine) {
      window.addEventListener("pointermove", onMove);
    } else {
      const id = window.setTimeout(autoSweep, 700);
      return () => {
        window.clearTimeout(id);
        cancelAnimationFrame(raf);
      };
    }
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, [threshold, onCleared]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`${className} pointer-events-none transition-opacity duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)]`}
    />
  );
}
