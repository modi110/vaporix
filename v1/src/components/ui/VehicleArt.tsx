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
        A Prado-shaped box: flat roof carried the whole length, upright
        tailgate and windscreen, squared wheel arches, roof rails and a side
        step. Boxiness is what separates it from the saloon at a glance.
      */}
      <path
        d="M46 112 L44 58 L46 30 Q48 21 60 20 L250 20 L286 42 L344 44 L356 60 L356 112 Z"
        {...stroke}
      />
      <path d="M52 56 L286 54" {...faint} />
      <path d="M118 21 L118 55 M186 20 L186 55 M244 20 L246 54" {...faint} />
      <path d="M70 16 L242 15 M78 16 L78 20 M234 15 L234 20" {...faint} />
      <path d="M74 108 L74 92 L136 92 L136 108 M262 108 L262 92 L324 92 L324 108" {...faint} />
      <path d="M140 104 L258 104" {...faint} />
      <Wheels cx1={105} cx2={293} r={28} cy={112} />
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
      {/* pick-up: open bed behind, cab and bonnet forward */}
      <path
        d="M28 100 L28 58 L192 58 L192 40 Q192 27 206 26 L266 24 Q282 24 292 36 L306 58 L352 62 Q372 66 372 88 L370 100 Z"
        {...stroke}
      />
      <path d="M40 58 L40 100 M40 76 L186 76" {...faint} />
      <path d="M202 42 L202 56 L286 54 L286 40" {...faint} />
      <path d="M214 56 L214 100" {...faint} />
      <path d="M66 96 L66 82 L118 82 L118 96 M286 96 L286 82 L338 82 L338 96" {...faint} />
      <Wheels cx1={92} cx2={312} r={24} cy={100} />
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
