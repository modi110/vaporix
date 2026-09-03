/**
 * The VRK / VAPORIX lockup, taken straight from the studio's own logo.
 *
 * The artwork is used as a CSS mask rather than an <img>, so the shape is the
 * client's exactly while the colour is entirely ours: `currentColor` paints
 * it, which means one utility class recolours the mark, it inverts cleanly on
 * the accent block, and it needs no second file for the light theme.
 */
export const LOGO_SRC = "/images/logo-lockup.png";
export const LOGO_RATIO = "996 / 198";

export function BrandMark({
  className = "",
  label,
}: {
  className?: string;
  /** Only the lockup that acts as a link needs a name; decorative uses omit it. */
  label?: string;
}) {
  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`brand-mark ${className}`}
      style={{ aspectRatio: LOGO_RATIO }}
    />
  );
}
