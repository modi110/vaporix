/**
 * What the grime hides: a car under studio lighting, drawn as vector so it
 * stays crisp at any size and costs nothing to load. Replace with the client's
 * photography later — the layering and the wipe above it stay identical.
 *
 * The whole car is mirrored inside `#v-car` so the nose points left, which is
 * the direction the hero drives it on scroll. Drawing it nose-right and
 * flipping once keeps every path readable in normal reading order; the only
 * consequence is that a positive rotation applied to a wheel reads as
 * counter-clockwise on screen — which is exactly what a car rolling left does.
 */
const SPOKES = [0, 72, 144, 216, 288];

function Wheel({ cx }: { cx: number }) {
  return (
    <g>
      <circle
        cx={cx}
        cy={300}
        r={62}
        fill="#04080a"
        stroke="#2fd2ff"
        strokeWidth={1.5}
        opacity={0.45}
      />
      {/* only the spokes turn — the tyre and the lit arc stay put */}
      <g className="v-wheel" data-spin={cx}>
        {SPOKES.map((a) => (
          <line
            key={a}
            x1={cx}
            y1={276}
            x2={cx}
            y2={246}
            transform={`rotate(${a} ${cx} 300)`}
            stroke="#2fd2ff"
            strokeWidth={2}
            strokeLinecap="round"
            opacity={0.5}
          />
        ))}
        {/* an off-centre stub, so the rotation is legible at any speed */}
        <circle cx={cx + 34} cy={300} r={3} fill="#2fd2ff" opacity={0.55} />
      </g>
      <circle
        cx={cx}
        cy={300}
        r={26}
        fill="none"
        stroke="#2fd2ff"
        strokeWidth={1}
        opacity={0.22}
      />
      {/* only the lit top arc of each wheel catches the studio light */}
      <path
        d={`M${cx - 52} 282 A62 62 0 0 1 ${cx + 52} 282`}
        fill="none"
        stroke="#2fd2ff"
        strokeWidth={2.5}
        strokeLinecap="round"
        opacity={0.9}
      />
    </g>
  );
}

export function CarStage({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1000 460"
      aria-hidden="true"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="v-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1d2a30" />
          <stop offset="45%" stopColor="#0d1418" />
          <stop offset="100%" stopColor="#05090b" />
        </linearGradient>
        <linearGradient id="v-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(47,210,255,.34)" />
          <stop offset="60%" stopColor="rgba(47,210,255,.06)" />
          <stop offset="100%" stopColor="rgba(47,210,255,.02)" />
        </linearGradient>
        <linearGradient id="v-sheen" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="45%" stopColor="rgba(220,247,255,.55)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <radialGradient id="v-lamp" cx="50%" cy="50%">
          <stop offset="0%" stopColor="rgba(220,247,255,.75)" />
          <stop offset="45%" stopColor="rgba(47,210,255,.22)" />
          <stop offset="100%" stopColor="rgba(47,210,255,0)" />
        </radialGradient>
        <radialGradient id="v-pool" cx="50%" cy="50%">
          <stop offset="0%" stopColor="rgba(47,210,255,.30)" />
          <stop offset="55%" stopColor="rgba(47,210,255,.07)" />
          <stop offset="100%" stopColor="rgba(47,210,255,0)" />
        </radialGradient>
        <linearGradient id="v-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity=".30" />
          <stop offset="70%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="v-reflect">
          <rect x="0" y="0" width="1000" height="460" fill="url(#v-fade)" />
        </mask>
      </defs>

      {/* pool of light on the floor */}
      <ellipse cx="500" cy="330" rx="430" ry="96" fill="url(#v-pool)" />

      <g id="v-car" transform="translate(1000,0) scale(-1,1)">
        {/* body */}
        <path
          d="M58 300 L68 252 Q78 202 140 190 L330 162 Q420 98 560 102 Q702 106 792 170 L900 192 Q952 208 952 262 L946 300 Z"
          fill="url(#v-body)"
        />
        {/* greenhouse */}
        <path
          d="M348 160 L404 114 Q436 100 502 100 L560 102 Q622 106 662 132 L706 162 Z"
          fill="url(#v-glass)"
        />
        {/* rim light along the roof and shoulder */}
        <path
          d="M348 160 L404 114 Q436 100 502 100 L560 102 Q622 106 662 132 L706 162"
          fill="none"
          stroke="#2fd2ff"
          strokeWidth="3"
          strokeLinecap="round"
          opacity=".95"
        />
        <path
          d="M140 190 L330 162 L706 162 L792 170"
          fill="none"
          stroke="rgba(47,210,255,.5)"
          strokeWidth="2"
        />
        {/* specular sweep down the flank */}
        <path
          d="M180 222 L700 208 L880 226 L700 236 L180 246 Z"
          fill="url(#v-sheen)"
          opacity=".5"
        />
        {/* headlight — the nose, which the mirror above puts on the left */}
        <ellipse cx="932" cy="228" rx="96" ry="58" fill="url(#v-lamp)" />
        <path
          d="M886 210 Q930 216 940 240 L892 244 Z"
          fill="#dcf7ff"
          opacity=".55"
        />
        <path
          d="M886 210 Q930 216 940 240"
          fill="none"
          stroke="#dcf7ff"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        <Wheel cx={248} />
        <Wheel cx={782} />
      </g>

      {/* reflection on the wet floor */}
      <g transform="translate(0,662) scale(1,-1)" mask="url(#v-reflect)" opacity=".45">
        <use href="#v-car" />
      </g>

      {/* the floor line itself */}
      <rect x="0" y="331" width="1000" height="1" fill="rgba(47,210,255,.28)" />
    </svg>
  );
}
