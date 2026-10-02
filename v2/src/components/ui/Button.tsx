import { Link } from "@/i18n/navigation";
import type { StaticPathname } from "@/i18n/routing";

/**
 * Three treatments, one shape: a pill, uppercase, engineered tracking, arrow
 * on the right.
 *
 * `giallo` is the only filled, coloured button the design system allows, and
 * only one of them may share a viewport — on a phone that is a real
 * constraint, which is why the nav's booking button is `outlined` rather
 * than filled.
 *
 * Every hover treatment has an `:active` twin. The primary device here has no
 * hover at all, so a hover-only effect would be invisible to most visitors.
 */
type Variant = "giallo" | "ghost" | "outlined" | "white";

const BASE =
  "btn group inline-flex min-h-11 items-center justify-center gap-2.5 whitespace-nowrap " +
  "rounded-full px-6 py-3.5 text-xs font-medium uppercase tracking-[0.023em] " +
  "transition-colors duration-150 ease-[cubic-bezier(0.22,1,0.36,1)]";

const VARIANTS: Record<Variant, string> = {
  // White throughout, not just on hover: the accent and the surface are the
  // same blue now, so a navy ink label on this fill would vanish into it.
  giallo:
    "btn-shine bg-giallo text-pearl [--btn-fill:var(--color-giallo-deep)]",
  // Opacity, not a colour swap: `hover:text-giallo` used to shift toward the
  // one accent, but ghost is used via `text-current` in whatever context it
  // lands in, and on a blue surface `text-giallo` is now the same colour as
  // the text underneath it.
  ghost: "text-current hover:opacity-70 active:opacity-70",
  outlined:
    "border border-steel text-current hover:border-current active:border-current " +
    "[--btn-fill:color-mix(in_srgb,currentColor_14%,transparent)]",
  // For a spot the giallo fill would otherwise disappear into — the mobile
  // menu sheet is the one place on the site that's a solid blue surface with
  // nothing else on it, so giallo and its own background are literally the
  // same colour there.
  white:
    "bg-pearl text-navy [--btn-fill:color-mix(in_srgb,var(--color-navy)_14%,white)]",
};

/**
 * The label rolls: a second copy waits below and slides up as the first
 * leaves. Motion lives in globals.css under BUTTONS.
 */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="btn-roll">
      <span>{children}</span>
      <span aria-hidden="true">{children}</span>
    </span>
  );
}

/** Two arrows in a clipped box: one exits right as the next enters left. */
function Arrow() {
  const path = <path d="M2 8h11M9 4l4 4-4 4" />;
  return (
    <span className="btn-arrow" aria-hidden="true">
      {[0, 1].map((i) => (
        <svg
          key={i}
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="size-3.5"
        >
          {path}
        </svg>
      ))}
    </span>
  );
}

type CommonProps = {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  /** Set false for a button whose meaning does not involve going somewhere. */
  arrow?: boolean;
};

export function ButtonLink({
  href,
  children,
  variant = "giallo",
  className = "",
  arrow = true,
  onClick,
}: CommonProps & { href: StaticPathname; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`${BASE} ${VARIANTS[variant]} ${className}`}
    >
      <Label>{children}</Label>
      {arrow ? <Arrow /> : null}
    </Link>
  );
}

export function ButtonAnchor({
  href,
  children,
  variant = "giallo",
  className = "",
  arrow = true,
}: CommonProps & { href: string }) {
  return (
    <a href={href} className={`${BASE} ${VARIANTS[variant]} ${className}`}>
      <Label>{children}</Label>
      {arrow ? <Arrow /> : null}
    </a>
  );
}

