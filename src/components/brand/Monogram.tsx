/**
 * The VRK monogram, reconstructed as filled angular letterforms with the
 * forward lean of the original sign. Authored by hand rather than traced:
 * the geometry is simple, and hand paths stay crisp at favicon sizes.
 *
 * Colour comes from `currentColor` on the wrapper, so one class recolours
 * the mark — cyan on black, ink on the inverted accent block.
 */
export const MONOGRAM_PATHS = [
  "M6 8 H34 L60 76 L86 8 H114 L74 108 H46 Z",
  "M124 8 H188 L208 28 V50 L190 68 L212 108 H180 L160 68 H146 V108 H124 Z M146 30 H180 L186 36 V42 L180 48 H146 Z",
  "M222 8 H246 V48 L286 8 H318 L272 56 L320 108 H288 L246 64 V108 H222 Z",
] as const;

export const MONOGRAM_VIEWBOX = "0 0 350 116";

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
      <g transform="skewX(-8) translate(14,0)" fill="currentColor">
        {MONOGRAM_PATHS.map((d, i) => (
          <path key={i} d={d} fillRule={i === 1 ? "evenodd" : undefined} />
        ))}
      </g>
    </svg>
  );
}
