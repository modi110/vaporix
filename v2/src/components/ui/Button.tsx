import { Link } from "@/i18n/navigation";
import type { StaticPathname } from "@/i18n/routing";

/**
 * Three treatments, one shape: a hard rectangle, uppercase, engineered
 * tracking, arrow on the right.
 *
 * `giallo` is the only coloured element the design system allows, and only one
 * of them may share a viewport — on a phone that is a real constraint, which
 * is why the nav's booking button is `outlined` rather than yellow.
 *
 * Every hover treatment has an `:active` twin. The primary device here has no
 * hover at all, so a hover-only effect would be invisible to most visitors.
 */
type Variant = "giallo" | "ghost" | "outlined";

const BASE =
  "group inline-flex min-h-11 items-center justify-center gap-2.5 whitespace-nowrap " +
  "rounded-none px-5 py-3.5 text-xs font-medium uppercase tracking-[0.023em] " +
  "transition-colors duration-150 ease-[cubic-bezier(0.22,1,0.36,1)]";

const VARIANTS: Record<Variant, string> = {
  // #1a1f28 on #ffc000 is 9.5:1. design.md specs white here, which is 1.9:1
  // and fails AA outright.
  giallo:
    "bg-giallo text-navy hover:bg-giallo-deep hover:text-pearl active:bg-giallo-deep active:text-pearl",
  ghost: "text-current hover:text-giallo active:text-giallo",
  outlined:
    "border border-steel text-current hover:border-current active:border-current",
};

/** The arrow travels a few pixels on hover and press. That is the whole gesture. */
function Arrow() {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-3.5 shrink-0 transition-transform duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1 group-active:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
    >
      <path d="M2 8h11M9 4l4 4-4 4" />
    </svg>
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
      {children}
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
      {children}
      {arrow ? <Arrow /> : null}
    </a>
  );
}
