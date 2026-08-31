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

function Wheels({ cx1, cx2, r = 21, cy = 108 }: { cx1: number; cx2: number; r?: number; cy?: number }) {
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
      <path
        d="M36 108 L40 82 Q46 60 82 55 L142 46 Q184 24 240 26 Q298 28 330 56 L366 66 Q390 72 390 94 L388 108 Z"
        {...stroke}
      />
      <path d="M142 48 L172 30 M240 26 L258 52" {...faint} />
      <Wheels cx1={104} cx2={318} />
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
