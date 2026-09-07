/**
 * Turns the retouched studio photographs into the files the site actually
 * serves, and writes the content manifests that point at them.
 *
 *   node scripts/process-images.mjs            build everything
 *   node scripts/process-images.mjs --contact  contact sheet only
 *   node scripts/process-images.mjs --centres  percentage grid, for reading
 *                                              the focal points off a photo
 *
 * Re-runnable: the next batch of client photos costs one command. Nothing is
 * edited by hand afterwards, so `src/content/hero.ts` and `gallery.ts` are
 * generated files — change this script, not them.
 *
 * `sharp` ships with Next, so there is no dependency to install.
 */
import sharp from "sharp";
import { mkdir, writeFile, readFile, readdir } from "node:fs/promises";
import path from "node:path";

const ROOT = path.join(import.meta.dirname, "..");
const SRC = path.join(ROOT, "public/images/edited");
const OUT = path.join(ROOT, "public/images");

/**
 * The retouched set, with the names the site uses.
 *
 * `focusX` / `focusY` are the centre of the car, as a fraction of width and
 * height, read off a percentage grid rather than estimated — see
 * `--centres`, which redraws that grid. Every crop is taken around this point
 * rather than around the centre of the image, because the cars are not
 * centred: the Q5 sits at 62% and the Mini at 60%.
 *
 * The crop window can only slide so far before it runs off the edge of the
 * source, so a focus beyond about 0.625 clamps and pushes the car back off
 * centre — which is what happened when `seat-exeo` was guessed at 0.66.
 *
 * These drive the sharp crop only. They are deliberately NOT emitted as
 * `object-position`: once the crop is centred on the car, the browser's
 * further crop must also be centred, or the offset lands twice.
 */
/**
 * This order is also the order "Coches que salen de aquí" lists them in —
 * that section renders `gallery.ts` straight through, in the order it was
 * generated. The hero carousel is unaffected: it re-sorts by `HERO` below
 * regardless of this order.
 */
const SOURCES = [
  { file: "bmw-serie5.jpeg", name: "bmw-serie5", alt: "bmwSerie5", focusX: 0.42, focusY: 0.65, ceilingTrim: 0.24 },
  { file: "volvo-xc60.jpeg", name: "volvo-xc60", alt: "volvoXc60", focusX: 0.58, focusY: 0.62, floorTrim: 0.14 },
  { file: "mini-jcw.jpeg", name: "mini-jcw", alt: "miniJcw", focusX: 0.5, focusY: 0.62, ceilingTrim: 0.14 },
  { file: "seat-wagon.jpeg", name: "seat-wagon", alt: "seatWagon", focusX: 0.45, focusY: 0.55 },
  { file: "audi-q5.jpeg", name: "audi-q5", alt: "audiQ5", focusX: 0.5, focusY: 0.62 },
];

/**
 * Which of those open the hero carousel, in order.
 *
 * `seat-wagon` is deliberately absent — it's the one landscape source in this
 * batch (4:3, side-on), and a 9:16 phone crop of a landscape photo keeps a
 * thin vertical sliver that cuts the car in half. It stays in the gallery,
 * where the native aspect shows it whole. The other four are portrait to
 * begin with, same as the sources this replaced.
 */
const HERO = ["audi-q5", "bmw-serie5", "mini-jcw", "volvo-xc60"];

const PORTRAIT_AR = 9 / 16;
const WIDE_AR = 16 / 9;

/**
 * How much of the source width the desktop crop is willing to use. Below 1
 * on purpose — see the note on `capWidth` in `cropBox` for why the desktop
 * crop needs the slack this creates to centre a car at all.
 */
const WIDE_ZOOM = 0.68;

/**
 * A phone at 390px CSS on a 3x screen asks for ~1170 real pixels. Anything
 * narrower than this is being upscaled to fill the hero, which is exactly the
 * softness the client objected to in v1.
 */
const HERO_MIN_WIDTH = 1080;

/**
 * Crop a region of `aspect` around the focal point, clamped so the window
 * never runs off the edge of the source.
 *
 * `ceilingTrim` cuts a fraction off the TOP of the source before anything
 * else happens — as if the photo were shorter to begin with. Portrait crops
 * otherwise always keep the full height (see the comment at the call site),
 * so this is the one knob that lets a photo show more floor and less ceiling
 * — the remaining height is unchanged, so the car (whose pixel position on
 * the source never moves) reads as sitting higher in the shorter frame.
 * 0 (the default) reproduces the old behaviour exactly.
 *
 * `floorTrim` is the same idea from the other edge: it cuts a fraction off
 * the BOTTOM instead, which reads as the car sitting lower in the frame.
 * There's no way to shift the window down without it, since portrait crops
 * otherwise always run to the source's true bottom edge.
 *
 * `capWidth` caps how much of the source width the crop is allowed to use.
 * The wide (desktop) crop needs this: a 16:9 box cut from a 3:4 portrait
 * photo is shallow enough that it always fit the *full* source width with
 * room to spare, which meant `focusX` had nothing left to slide — the crop
 * was pinned to the whole width regardless of where the car actually was.
 * Capping the width below the source width creates that missing slack.
 */
function cropBox(w, h, aspect, focusX, focusY, ceilingTrim = 0, capWidth = w, floorTrim = 0) {
  const y0 = Math.round(h * ceilingTrim);
  const y1 = h - Math.round(h * floorTrim);
  const usableH = y1 - y0;

  let cw = Math.round(Math.min(capWidth, usableH * aspect));
  let ch = Math.round(Math.min(usableH, cw / aspect));
  cw = Math.round(Math.min(cw, ch * aspect));

  const wanted = w * focusX - cw / 2;
  const left = Math.round(Math.min(Math.max(wanted, 0), w - cw));
  const top =
    y0 + Math.round(Math.min(Math.max(usableH * focusY - ch / 2, 0), usableH - ch));

  /**
   * The slice can only slide as far as the edge of the photo. Past that,
   * raising `focusX` changes nothing at all — and a setting that silently
   * does nothing is worse than one that refuses, so the caller reports it.
   *
   * `usable` is the range of `focusX` values that actually move the picture
   * on this photo.
   */
  const clamped = Math.abs(wanted - left) > 1;
  const usable = [cw / 2 / w, 1 - cw / 2 / w];

  return { left, top, width: cw, height: ch, clamped, usable };
}

/** One source, two encodings. AVIF is the win on 4G; WebP covers the rest. */
async function encode(pipeline, dir, name) {
  await mkdir(dir, { recursive: true });
  const base = pipeline.clone();
  await base.clone().avif({ quality: 62, effort: 5 }).toFile(path.join(dir, `${name}.avif`));
  await base.clone().webp({ quality: 80 }).toFile(path.join(dir, `${name}.webp`));
}

async function build() {
  const heroMeta = [];
  const galleryMeta = [];
  const warnings = [];
  const clamps = [];

  for (const src of SOURCES) {
    const file = path.join(SRC, src.file);
    const image = sharp(file);
    const { width: w, height: h } = await image.metadata();

    // Portrait: full height kept, width cropped. Keeping the full height is
    // deliberate — the open ceiling above the car is where the headline goes,
    // so cropping vertically would take away the only clear space on the frame.
    // `ceilingTrim` is the one exception: it removes some of that ceiling on
    // purpose, for a photo where there was too much of it to begin with.
    const pBox = cropBox(
      w,
      h,
      PORTRAIT_AR,
      src.focusX,
      0.5,
      src.ceilingTrim ?? 0,
      w,
      src.floorTrim ?? 0,
    );
    await encode(sharp(file).extract(pBox), path.join(OUT, "hero"), `${src.name}-portrait`);

    // Wide: for desktop, where the car and the type sit side by side.
    // `wideFocusX` overrides `focusX` here only — the desktop crop is zoomed
    // in much tighter than the phone one (see WIDE_ZOOM), so it is far more
    // sensitive to a slightly-off centre. Falling back to `focusX` keeps every
    // photo that doesn't need the override behaving exactly as before.
    // `wideZoom` overrides WIDE_ZOOM the same way, for a car that fills most
    // of the frame at the default zoom regardless of centring — seat-exeo's
    // estate body is close to as wide as the crop itself at 0.68, so no
    // focusX value gives it real margin on both sides; only easing the zoom
    // does.
    const wBox = cropBox(
      w,
      h,
      WIDE_AR,
      src.wideFocusX ?? src.focusX,
      src.focusY,
      0,
      w * (src.wideZoom ?? WIDE_ZOOM),
    );
    await encode(sharp(file).extract(wBox), path.join(OUT, "hero"), `${src.name}-wide`);

    // Gallery keeps the native 3:4 — these sit in a grid, never full-screen.
    const gW = Math.min(1200, w);
    await encode(
      sharp(file).resize({ width: gW, withoutEnlargement: true }),
      path.join(OUT, "gallery"),
      src.name,
    );

    if (pBox.width < HERO_MIN_WIDTH && HERO.includes(src.name)) {
      warnings.push(
        `${src.name}: portrait crop is ${pBox.width}px wide, under the ${HERO_MIN_WIDTH}px a phone asks for. ` +
          `Re-run this one through Gemini at 2K or 4K.`,
      );
    }

    if (pBox.clamped) {
      const [lo, hi] = pBox.usable;
      clamps.push(
        `${src.name}: focusX ${src.focusX} does nothing — the picture is already ` +
          `as far ${src.focusX > 0.5 ? "right" : "left"} as it goes. ` +
          `On this photo only ${lo.toFixed(2)} to ${hi.toFixed(2)} changes anything.`,
      );
    }

    const entry = {
      name: src.name,
      alt: src.alt,
      // Always centre. The crops above are already taken around the car, so
      // re-applying focusX here would shift it a second time and push the car
      // back off-centre — which is exactly what it did.
      focus: "50% 50%",
      portrait: { w: pBox.width, h: pBox.height },
      wide: { w: wBox.width, h: wBox.height },
      gallery: { w: gW, h: Math.round((h / w) * gW) },
    };
    galleryMeta.push(entry);
    if (HERO.includes(src.name)) heroMeta.push(entry);

    const [lo, hi] = pBox.usable;
    console.log(
      `  ${src.name.padEnd(12)} focusX ${String(src.focusX).padEnd(5)}` +
        `(useful range ${lo.toFixed(2)}-${hi.toFixed(2)})` +
        `${pBox.clamped ? "  <-- NO EFFECT" : ""}`,
    );
  }

  heroMeta.sort((a, b) => HERO.indexOf(a.name) - HERO.indexOf(b.name));
  await writeContent(heroMeta, galleryMeta);

  if (clamps.length) {
    console.log("\n  This number had no effect:");
    for (const line of clamps) console.log(`   - ${line}`);
  }

  if (warnings.length) {
    console.log("\n  Needs a sharper source:");
    for (const line of warnings) console.log(`   - ${line}`);
  }
}

async function writeContent(hero, gallery) {
  const heroFile = `/**
 * GENERATED by scripts/process-images.mjs — do not edit by hand.
 *
 * \`focus\` is the CSS object-position for the slide. It is centred, because
 * the crops are already taken around the car — offsetting again here would
 * move it off-centre a second time.
 */
export type HeroSlide = {
  name: string;
  alt: string;
  focus: string;
  portrait: { w: number; h: number };
  wide: { w: number; h: number };
};

export const heroSlides: HeroSlide[] = ${JSON.stringify(
    hero.map(({ name, alt, focus, portrait, wide }) => ({ name, alt, focus, portrait, wide })),
    null,
    2,
  )};
`;

  const galleryFile = `/**
 * GENERATED by scripts/process-images.mjs — do not edit by hand.
 *
 * \`alt\` is unused by \`Work.tsx\`, which renders these decoratively
 * (\`alt=""\`) — kept here anyway as each shot's stable identifying key.
 */
export type Shot = {
  name: string;
  alt: string;
  w: number;
  h: number;
};

export const shots: Shot[] = ${JSON.stringify(
    gallery.map(({ name, alt, gallery: g }) => ({ name, alt, w: g.w, h: g.h })),
    null,
    2,
  )};
`;

  await writeFile(path.join(ROOT, "src/content/hero.ts"), heroFile);
  await writeFile(path.join(ROOT, "src/content/gallery.ts"), galleryFile);
  console.log("\n  wrote src/content/hero.ts and src/content/gallery.ts");

  await syncAltText(hero);
}

/**
 * Make sure every hero photograph has an alt-text key in both locale files.
 *
 * This is the step that would otherwise break the site when a photo is added.
 * `next-intl` throws on a key it cannot resolve rather than falling back, so
 * one forgotten entry takes a whole page down — and only in the language you
 * were not looking at. Adding a placeholder here means a new photo can never
 * do that; the worst case is visibly unfinished alt text, which the summary
 * below lists so it gets written properly.
 *
 * Gallery shots get no such entry: the /gallery page that once read
 * `pages.gallery.alt` is gone, and `Work.tsx` renders these decoratively
 * (`alt=""`) since the section heading already says what they are.
 */
async function syncAltText(hero) {
  const needed = {
    "hero.slides": hero.map((s) => s.alt),
  };

  const todo = [];

  for (const locale of ["es", "en"]) {
    const file = path.join(ROOT, "messages", `${locale}.json`);
    const json = JSON.parse(await readFile(file, "utf8"));
    let touched = false;

    for (const [dotted, keys] of Object.entries(needed)) {
      let node = json;
      for (const part of dotted.split(".")) {
        node[part] ??= {};
        node = node[part];
      }
      for (const key of keys) {
        if (typeof node[key] === "string") continue;
        node[key] = `TODO: describe ${key}`;
        touched = true;
        todo.push(`${locale}.json → ${dotted}.${key}`);
      }
    }

    if (touched) await writeFile(file, JSON.stringify(json, null, 2) + "\n");
  }

  if (todo.length) {
    console.log("\n  Alt text still to write:");
    for (const line of todo) console.log(`   - ${line}`);
  }
}

/**
 * One sheet showing what a 390px phone throws away on each frame, so the
 * focal points above get chosen by looking rather than by guessing.
 */
async function contactSheet() {
  const CELL = 420;
  const cells = [];

  for (const src of SOURCES) {
    const file = path.join(SRC, src.file);
    const { width: w, height: h } = await sharp(file).metadata();
    const box = cropBox(
      w,
      h,
      PORTRAIT_AR,
      src.focusX,
      0.5,
      src.ceilingTrim ?? 0,
      w,
      src.floorTrim ?? 0,
    );
    const s = CELL / w;

    // Resized to actual bytes first, and the overlay built to match *those*
    // bytes' real metadata — not a prediction from a cloned pipeline, which
    // has landed a pixel off from what the same resize later actually
    // produces, and `composite` refuses anything larger than its base.
    const resizedBuf = await sharp(file).resize({ width: CELL }).toBuffer();
    const { height: cellH } = await sharp(resizedBuf).metadata();

    const overlaySvg = Buffer.from(
      `<svg width="${CELL}" height="${cellH}">
        <rect x="0" y="0" width="100%" height="100%" fill="rgba(0,0,0,0.55)"/>
        <rect x="${box.left * s}" y="${box.top * s}" width="${box.width * s}" height="${box.height * s}" fill="rgba(0,0,0,0)" stroke="#ff2b2b" stroke-width="3"/>
        <rect x="${box.left * s}" y="${box.top * s}" width="${box.width * s}" height="${box.height * s}" fill="#ffffff" fill-opacity="0.55" style="mix-blend-mode:overlay"/>
        <text x="8" y="22" font-family="monospace" font-size="16" fill="#fff">${src.name}</text>
        <text x="8" y="42" font-family="monospace" font-size="13" fill="#ffc000">${box.width}px wide</text>
      </svg>`,
    );
    // Rasterised through sharp's own resize rather than trusted at its
    // declared SVG size — librsvg's own DPI handling has landed the PNG a
    // pixel taller than `cellH` before now, which is exactly what a
    // same-size-or-smaller `composite` call refuses.
    const overlay = await sharp(overlaySvg)
      .resize(CELL, cellH, { fit: "fill" })
      .png()
      .toBuffer();

    cells.push({
      buf: await sharp(resizedBuf)
        .composite([{ input: overlay, top: 0, left: 0 }])
        .toBuffer(),
      h: cellH,
    });
  }

  // Row height is whichever cell in that row is tallest — this batch mixes
  // portrait and landscape sources, so a single uniform height either clips a
  // portrait cell or (composite requiring input <= canvas) crashes outright.
  const cols = 3;
  const rows = Math.ceil(cells.length / cols);
  const rowHeights = Array.from({ length: rows }, (_, r) =>
    Math.max(...cells.slice(r * cols, r * cols + cols).map((c) => c.h)),
  );
  const rowTops = rowHeights.reduce(
    (acc, h) => [...acc, acc[acc.length - 1] + h],
    [0],
  );

  await sharp({
    create: {
      width: CELL * cols,
      height: rowTops[rows],
      channels: 3,
      background: "#1A1F28",
    },
  })
    .composite(
      cells.map(({ buf }, i) => ({
        input: buf,
        left: (i % cols) * CELL,
        top: rowTops[Math.floor(i / cols)],
      })),
    )
    .jpeg({ quality: 88 })
    .toFile(path.join(ROOT, "contact-sheet.jpg"));

  console.log("  wrote contact-sheet.jpg — the lit area is what a phone keeps");
}

/**
 * Every source under a percentage grid, so `focusX` above is read off a ruler
 * instead of estimated. The eye is reliably wrong about this: the Q5 looks
 * centred and sits at 62%.
 */
async function centreGrid() {
  const CELL = 340;
  const cells = [];

  for (const src of SOURCES) {
    const file = path.join(SRC, src.file);
    const { width: w, height: h } = await sharp(file).metadata();
    const cellH = Math.round((CELL * h) / w);

    let ticks = "";
    for (let i = 1; i < 10; i++) {
      const x = (CELL * i) / 10;
      const mid = i === 5;
      ticks +=
        `<line x1="${x}" y1="0" x2="${x}" y2="${cellH}" stroke="${mid ? "#ff2b2b" : "#ffc000"}" ` +
        `stroke-width="${mid ? 2 : 1}" stroke-opacity="${mid ? 1 : 0.55}"/>` +
        `<text x="${x + 3}" y="${cellH - 8}" font-family="monospace" font-size="11" fill="#ffc000">${i * 10}</text>`;
    }
    // Where the current focusX actually lands, so a wrong value is visible.
    const fx = CELL * src.focusX;
    ticks +=
      `<line x1="${fx}" y1="0" x2="${fx}" y2="${cellH}" stroke="#4ade80" stroke-width="2"/>` +
      `<text x="6" y="16" font-family="monospace" font-size="13" fill="#fff">${src.name}</text>` +
      `<text x="6" y="32" font-family="monospace" font-size="12" fill="#4ade80">focusX ${src.focusX}</text>`;

    cells.push(
      await sharp(file)
        .resize({ width: CELL })
        .composite([{ input: Buffer.from(`<svg width="${CELL}" height="${cellH}">${ticks}</svg>`), top: 0, left: 0 }])
        .toBuffer(),
    );
  }

  const cellH = (await sharp(cells[0]).metadata()).height;
  const cols = 3;
  await sharp({
    create: {
      width: CELL * cols,
      height: cellH * Math.ceil(cells.length / cols),
      channels: 3,
      background: "#1A1F28",
    },
  })
    .composite(
      cells.map((input, i) => ({
        input,
        left: (i % cols) * CELL,
        top: Math.floor(i / cols) * cellH,
      })),
    )
    .jpeg({ quality: 90 })
    .toFile(path.join(ROOT, "centre-grid.jpg"));

  console.log("  wrote centre-grid.jpg — green line is the current focusX");
}

const files = await readdir(SRC);
console.log(`\n  ${files.length} retouched sources in public/images/edited\n`);

if (process.argv.includes("--centres")) {
  await centreGrid();
} else if (process.argv.includes("--contact")) {
  await contactSheet();
} else {
  await build();
  await contactSheet();
}
console.log("");
