/**
 * The studio's own photographs.
 *
 * `w` and `h` are the real pixel dimensions, so `next/image` reserves the
 * right box before the file arrives and nothing on the page jumps. `alt`
 * values are i18n keys under `pages.gallery.alt`, never prose.
 *
 * Every legible number plate in these frames was pixelated before the files
 * were committed. A Spanish plate is personal data, and these are customers'
 * cars, not the studio's.
 */
export type Shot = {
  src: string;
  alt: string;
  w: number;
  h: number;
  /** Shown in the "recent work" strip on the home page, in this order. */
  home?: number;
};

export const shots: Shot[] = [
  { src: "/images/kona-front.png", alt: "konaFront", w: 717, h: 532, home: 1 },
  { src: "/images/x4-interior.png", alt: "x4Interior", w: 1230, h: 646, home: 2 },
  { src: "/images/x4-side.png", alt: "x4Side", w: 1082, h: 512, home: 3 },
  { src: "/images/corsa-front.png", alt: "corsaFront", w: 1151, h: 822, home: 4 },
  { src: "/images/x4-rear.png", alt: "x4Rear", w: 947, h: 565 },
  { src: "/images/corsa-side.png", alt: "corsaSide", w: 1156, h: 730 },
  { src: "/images/polo-front.png", alt: "poloFront", w: 647, h: 796 },
  { src: "/images/kona-rear.png", alt: "konaRear", w: 720, h: 537 },
  { src: "/images/leon-front.png", alt: "leonFront", w: 450, h: 437 },
  { src: "/images/peugeot-rear.png", alt: "peugeotRear", w: 527, h: 560 },
  { src: "/images/studio-bay.png", alt: "studioBay", w: 442, h: 647 },
  { src: "/images/unit-exterior.png", alt: "unitExterior", w: 492, h: 357 },
];

export const homeShots = shots
  .filter((s): s is Shot & { home: number } => s.home !== undefined)
  .sort((a, b) => a.home - b.home);

export const studioShot = shots.find((s) => s.alt === "studioBay")!;
