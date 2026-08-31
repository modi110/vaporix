import type { VehicleId } from "@/content/vehicles";

/**
 * Line-art silhouettes for the four size brackets, drawn in the same
 * hairline style as the bay illustration so the set reads as one family.
 * Front of the vehicle faces right in every drawing.
 */
const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const faint = { ...stroke, strokeOpacity: 0.45 };

function Wheels({
  cx1,
  cx2,
  r = 21,
  cy = 108,
}: {
  cx1: number;
  cx2: number;
  r?: number;
  cy?: number;
}) {
  return (
    <>
      <circle cx={cx1} cy={cy} r={r} {...stroke} />
      <circle cx={cx2} cy={cy} r={r} {...stroke} />
    </>
  );
}

const art: Record<VehicleId, React.ReactNode> = {
  moto: (
    <>
      <circle cx="88" cy="100" r="32" {...stroke} />
      <circle cx="312" cy="100" r="32" {...stroke} />
      <path d="M88 100 L168 66 L246 66 L312 100" {...stroke} />
      <path d="M150 62 Q186 46 232 52" {...stroke} />
      <path d="M246 66 L268 34 L300 30" {...stroke} />
      <path d="M168 74 L214 74 L222 98 L172 98 Z" {...faint} />
      <path d="M312 100 L272 44" {...faint} />
      <path d="M88 100 L120 62" {...faint} />
    </>
  ),
  urbano: (
    <>
      <path
        d="M62 108 L66 86 Q72 66 102 62 L152 54 Q182 36 220 38 Q258 40 282 62 L322 70 Q346 76 346 96 L344 108 Z"
        {...stroke}
      />
      <path d="M152 56 L176 40 M220 38 L236 58" {...faint} />
      <Wheels cx1={118} cx2={288} />
    </>
  ),
  berlina: (
    <>
      {/*
        A real SUV profile, not a tall saloon: near-vertical tailgate, a long
        flat roof, deep glass, a short high bonnet, and wheels big enough to
        leave clearance under the sill.
      */}
      <path
        d="M44 112 L44 72 L46 40 Q48 26 66 24 L228 22 Q250 24 264 42 L292 56 L326 62 Q348 68 348 92 L348 112 Z"
        {...stroke}
      />
      <path d="M50 60 L292 56" {...faint} />
      <path d="M112 24 L112 59 M178 23 L178 58 M228 22 L242 57" {...faint} />
      <path d="M72 108 A30 30 0 0 1 132 108 M262 108 A30 30 0 0 1 322 108" {...faint} />
      <Wheels cx1={102} cx2={292} r={28} cy={112} />
    </>
  ),
  furgoneta: (
    <>
      <path
        d="M34 108 L34 48 Q34 34 54 32 L246 28 Q276 28 296 48 L338 70 Q366 78 366 98 L364 108 Z"
        {...stroke}
      />
      <path d="M246 30 L246 74 L330 74" {...faint} />
      <path d="M120 32 L120 74 L34 74" {...faint} />
      <Wheels cx1={96} cx2={310} />
    </>
  ),
  camion: (
    <>
      {/* box body behind, cab set forward and lower, chassis running through */}
      <path d="M26 94 L26 26 Q26 20 36 20 L246 20 L246 94 Z" {...stroke} />
      <path
        d="M252 94 L252 56 Q252 46 264 46 L306 46 Q318 46 326 58 L344 76 L358 80 Q372 84 372 94 Z"
        {...stroke}
      />
      <path d="M26 94 L372 94" {...stroke} />
      <path d="M42 26 L42 88" {...faint} />
      <path d="M266 56 L316 56 L316 68 L266 68 Z" {...faint} />
      <Wheels cx1={172} cx2={318} r={22} cy={102} />
    </>
  ),
};

export function VehicleArt({
  id,
  className = "",
}: {
  id: VehicleId;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 400 150" aria-hidden="true" className={className}>
      {art[id]}
    </svg>
  );
}
