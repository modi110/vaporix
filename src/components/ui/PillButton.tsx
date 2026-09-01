"use client";

import { useEffect, useRef, type ComponentProps, type ReactNode } from "react";
import { Link } from "@/i18n/navigation";

type Variant = "solid" | "ghost";
type Size = "md" | "sm";

const base =
  "group relative isolate inline-flex items-center gap-2.5 overflow-hidden rounded-pill " +
  "text-xs font-bold uppercase tracking-[0.13em] will-change-transform " +
  "transition-[box-shadow,transform] duration-500 ease-[cubic-bezier(.22,1,.36,1)] " +
  "active:scale-[0.97] motion-reduce:transition-none";

const variants: Record<Variant, string> = {
  solid:
    "bg-vapor text-on-accent hover:shadow-[0_0_46px_-8px_rgba(var(--vapor-rgb),0.75)]",
  ghost:
    "border border-hairline-strong text-ink hover:border-vapor " +
    "hover:shadow-[0_0_34px_-12px_rgba(var(--vapor-rgb),0.6)]",
};

const sizes: Record<Size, string> = {
  md: "px-8 py-4",
  sm: "px-5 py-3 text-[0.6875rem]",
};

/**
 * Cursor-tracking glow plus a magnetic pull toward the pointer.
 *
 * Listeners are attached in an effect rather than as JSX handlers so the ref
 * is never read during render, and so the whole behaviour can be skipped
 * outright when the user asks for reduced motion.
 */
function useMagnetic<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const mx = e.clientX - r.left;
      const my = e.clientY - r.top;
      el.style.setProperty("--mx", `${mx}px`);
      el.style.setProperty("--my", `${my}px`);
      const dx = ((mx - r.width / 2) / r.width) * 12;
      const dy = ((my - r.height / 2) / r.height) * 8;
      el.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0)`;
    };

    const onLeave = () => {
      el.style.transform = "translate3d(0,0,0)";
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return ref;
}

function Inner({ children }: { children: ReactNode }) {
  return (
    <>
      {/* cursor-tracking highlight */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(180px circle at var(--mx,50%) var(--my,50%), rgba(var(--sheen-rgb),.55), transparent 65%)",
        }}
      />
      {/* arc of light travelling the rim */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 rounded-[inherit] p-[1.5px] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:animate-[vaporix-arc_1.4s_linear_infinite] motion-reduce:hidden"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, var(--color-bolt) 12deg, var(--color-vapor) 26deg, transparent 60deg)",
          WebkitMask:
            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
      <span className="inline-block transition-transform duration-300 group-hover:-translate-y-px">
        {children}
      </span>
      <span
        aria-hidden="true"
        className="w-0 overflow-hidden opacity-0 transition-all duration-300 group-hover:w-3.5 group-hover:opacity-100"
      >
        →
      </span>
    </>
  );
}

type LinkProps = ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: Size;
};

export function PillLink({
  children,
  variant = "solid",
  size = "md",
  className = "",
  ...rest
}: LinkProps) {
  const ref = useMagnetic<HTMLAnchorElement>();
  return (
    <Link
      {...rest}
      ref={ref}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      <Inner>{children}</Inner>
    </Link>
  );
}

type AnchorProps = ComponentProps<"a"> & { variant?: Variant; size?: Size };

export function PillAnchor({
  children,
  variant = "solid",
  size = "md",
  className = "",
  ...rest
}: AnchorProps) {
  const ref = useMagnetic<HTMLAnchorElement>();
  return (
    <a
      {...rest}
      ref={ref}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      <Inner>{children}</Inner>
    </a>
  );
}
