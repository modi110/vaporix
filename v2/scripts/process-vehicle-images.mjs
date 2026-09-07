/**
 * Builds the three size-picker vehicle images from whatever the user drops
 * into public/images/vehicles/, onto a consistent transparent 1600x900
 * canvas — matching what the placeholder frames were, and what
 * `Prices.tsx` already expects at `/images/vehicles/{small,suv,van}.{avif,webp}`.
 *
 *   node scripts/process-vehicle-images.mjs
 *
 * Each source is trimmed to its own bounding box, scaled to a consistent
 * width, and centred — so the three line up the same way in the drag rail
 * regardless of how differently each source photo was framed. The relative
 * size between vehicles (van longer than the hatchback) is handled entirely
 * by `relativeWidth()` in vehicles.ts, via CSS padding on the frame — not by
 * this script, so it stays correct if the source photos ever change.
 */
import sharp from "sharp";
import path from "node:path";

const DIR = path.join(import.meta.dirname, "../public/images/vehicles");

const CANVAS_W = 1600;
const CANVAS_H = 900;
/** Car width as a fraction of the canvas, leaving a small side margin. */
const CAR_FRACTION = 0.82;

const SOURCES = {
  small: "bwm m3.webp",
  suv: "suv bmw x5.webp",
  van: "new vann.png",
};

/** One source, two encodings, at a shared canvas size. */
async function build(name, file) {
  const input = path.join(DIR, file);

  // All three sources are real cutouts with their own alpha channel already
  // — no chroma-key step needed.
  const prepared = await sharp(input).ensureAlpha().png().toBuffer();

  // Trim whatever transparent margin the source already carries, so every
  // vehicle is scaled from its own true bounding box, not from however much
  // empty canvas its photographer happened to leave around it.
  const trimmed = await sharp(prepared).trim({ threshold: 8 }).toBuffer();

  // Constrained on both axes: a car trimmed tighter vertically than expected
  // (a tall three-quarter shot, say) would otherwise scale past CANVAS_H
  // once stretched to the target width, and sharp refuses to composite
  // anything larger than its canvas.
  const carW = Math.round(CANVAS_W * CAR_FRACTION);
  const carHMax = CANVAS_H - 40;
  const resized = await sharp(trimmed)
    .resize({ width: carW, height: carHMax, fit: "inside", withoutEnlargement: false })
    .toBuffer();
  const meta = await sharp(resized).metadata();

  const canvas = sharp({
    create: {
      width: CANVAS_W,
      height: CANVAS_H,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  }).composite([
    {
      input: resized,
      left: Math.round((CANVAS_W - meta.width) / 2),
      top: Math.round((CANVAS_H - meta.height) / 2),
    },
  ]);

  await canvas.clone().avif({ quality: 68 }).toFile(path.join(DIR, `${name}.avif`));
  await canvas.clone().webp({ quality: 88 }).toFile(path.join(DIR, `${name}.webp`));

  console.log(`  ${name.padEnd(6)} <- ${file}  (car rendered at ${meta.width}px wide)`);
}

for (const [name, file] of Object.entries(SOURCES)) {
  await build(name, file);
}

console.log("\n  wrote small/suv/van .avif + .webp");
