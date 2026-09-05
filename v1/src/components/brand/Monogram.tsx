/**
 * The VRK monogram: upright geometric letterforms, kerned tight, matching
 * the client's engraved-metal reference rather than the earlier forward-lean
 * sign trace. Authored by hand rather than traced: the geometry is simple,
 * and hand paths stay crisp at favicon sizes.
 *
 * Colour comes from `currentColor` on the wrapper, so one class recolours
 * the mark — cyan on black, ink on the inverted accent block.
 */
export const MONOGRAM_PATHS = [
  "M6 8 H34 L60 76 L86 8 H114 L74 108 H46 Z",
  "M118 8 H182 L202 28 V50 L184 68 L206 108 H174 L154 68 H140 V108 H118 Z M140 30 H174 L180 36 V42 L174 48 H140 Z",
  "M210 8 H234 V48 L274 8 H306 L260 56 L308 108 H276 L234 64 V108 H210 Z",
] as const;

export const MONOGRAM_VIEWBOX = "0 0 316 116";

type Props = {
  className?: string;
  title?: string;
};

export function Monogram({ className, title }: Props) {
  return (
    <svg
      viewBox={MONOGRAM_VIEWBOX}
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <g fill="currentColor">
        {MONOGRAM_PATHS.map((d, i) => (
          <path key={i} d={d} fillRule={i === 1 ? "evenodd" : undefined} />
        ))}
      </g>
    </svg>
  );
}
