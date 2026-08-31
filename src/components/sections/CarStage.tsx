/**
 * What the grime hides: a car under studio lighting, drawn as vector so it
 * stays crisp at any size and costs nothing to load. Replace with the client's
 * photography later — the layering and the wipe above it stay identical.
 */
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

      <g id="v-car">
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
        {/* headlight */}
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
        {/* wheels */}
        <g fill="#04080a" stroke="#2fd2ff">
          <circle cx="248" cy="300" r="62" strokeWidth="1.5" opacity=".45" />
          <circle cx="782" cy="300" r="62" strokeWidth="1.5" opacity=".45" />
          <circle cx="248" cy="300" r="26" strokeWidth="1" opacity=".22" />
          <circle cx="782" cy="300" r="26" strokeWidth="1" opacity=".22" />
        </g>
        {/* only the lit top arc of each wheel catches the studio light */}
        <g fill="none" stroke="#2fd2ff" strokeLinecap="round" opacity=".9">
          <path d="M196 282 A62 62 0 0 1 300 282" strokeWidth="2.5" />
          <path d="M730 282 A62 62 0 0 1 834 282" strokeWidth="2.5" />
        </g>
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
