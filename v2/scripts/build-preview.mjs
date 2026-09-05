/**
 * Inlines the hero crops into the review page so it can be published as a
 * single self-contained file and opened on a phone.
 *
 *   node scripts/build-preview.mjs <src.html> <out.html>
 *
 * The published page has no access to this repo, so every image travels with
 * it as a data URI. The four AVIF slides total under 300KB, which is well
 * inside what a shared page can carry.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { heroSlides } from "../src/content/hero.ts";

const ROOT = path.join(import.meta.dirname, "..");
const [src, out] = process.argv.slice(2);

/** Spanish alt text, keyed by the manifest's i18n key. */
const ALT = {
  seatExeo: "Seat Exeo ST rojo terminado en la nave de Vaporix",
  golfFront: "Volkswagen Golf GTI negro visto de frente",
  audiQ5: "Audi Q5 negro en tres cuartos sobre el suelo de resina",
  miniJcw: "Mini John Cooper Works negro y rojo en tres cuartos",
};

const MONOGRAM = `<svg viewBox="0 0 316 116" aria-label="Vaporix" role="img"><g fill="#ffffff"><path d="M6 8 H34 L60 76 L86 8 H114 L74 108 H46 Z"/><path fill-rule="evenodd" d="M118 8 H182 L202 28 V50 L184 68 L206 108 H174 L154 68 H140 V108 H118 Z M140 30 H174 L180 36 V42 L174 48 H140 Z"/><path d="M210 8 H234 V48 L274 8 H306 L260 56 L308 108 H276 L234 64 V108 H210 Z"/></g></svg>`;

const ARROW = `<svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 8h11M9 4l4 4-4 4"/></svg>`;

const slides = [];
for (const slide of heroSlides) {
  const file = path.join(ROOT, "public/images/hero", `${slide.name}-portrait.avif`);
  const b64 = (await readFile(file)).toString("base64");
  slides.push({
    src: `data:image/avif;base64,${b64}`,
    alt: ALT[slide.alt] ?? slide.name,
    focus: slide.focus,
  });
  console.log(`  inlined ${slide.name} (${Math.round(b64.length / 1024)} KB base64)`);
}

let html = await readFile(src, "utf8");
html = html
  .replaceAll("__VRK__", MONOGRAM)
  .replaceAll("__ARROW__", ARROW)
  .replace("__SLIDES__", JSON.stringify(slides));

await writeFile(out, html);
console.log(`\n  wrote ${out} (${Math.round((await readFile(out)).length / 1024)} KB)\n`);
