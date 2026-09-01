import { Monogram } from "./Monogram";

type Props = {
  /** "nav" sits inline in the header; "stacked" is for the footer and OG image. */
  variant?: "nav" | "stacked";
  className?: string;
};

/**
 * Full lockup: the cyan VRK monogram beside (or above) VAPORIX set in the
 * site's own display face. Setting the wordmark rather than tracing it keeps
 * it consistent with every heading and lets it scale and recolour freely.
 */
export function Wordmark({ variant = "nav", className = "" }: Props) {
  if (variant === "stacked") {
    return (
      <span className={`inline-grid justify-items-center gap-3 ${className}`}>
        <Monogram className="w-20 text-vapor-ink drop-shadow-[0_0_14px_rgba(var(--vapor-rgb),0.45)]" />
        <span className="text-lg font-extrabold tracking-[0.02em] leading-none">
          VAPORIX
        </span>
        <span className="t-label text-[0.5625rem] tracking-[0.3em]">
          Detailing &amp; Care
        </span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Monogram className="w-[52px] shrink-0 text-vapor-ink drop-shadow-[0_0_10px_rgba(var(--vapor-rgb),0.5)]" />
      <span className="text-[1.0625rem] font-extrabold tracking-[0.01em] leading-none">
        VAPORIX
      </span>
    </span>
  );
}
