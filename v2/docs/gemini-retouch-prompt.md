# Retouching a studio photograph

Paste the prompt below into Gemini with **one** photo attached. One photo per
message — the model returns a single image, so attaching six gets you one
confused blend, not six results.

**Use Pro, not Flash.** The plate has to spell VAPORIX correctly every time,
the prompt is long enough that Flash starts dropping constraints, and only Pro
outputs above 1K.

**Set the output resolution to 2K or 4K.** This is a dropdown, not something
the prompt controls. At 1K the photo comes back around 896px wide, which is too
soft for a full-screen phone hero — `process-images.mjs` will warn you.

**From the second photo onward, attach your first approved result as a second
image** and add:

> The second attached image is a reference, not a photo to edit. Match its
> floor colour, gloss level and reflection style exactly. Do not copy its car,
> its background, or its composition.

Text alone drifts across a batch. A reference image is what holds the floor
consistent, and inconsistent floors strobe visibly as the carousel advances.

---

```
Edit this photograph. Make ONLY the three changes listed below. Everything else
in the frame must remain pixel-faithful to the original.

PRESERVE EXACTLY — do not alter:
- The car: model, body shape, paint colour, wheels, trim, badges, glass tint,
  reflections on the paint, open/closed doors, and its exact position and angle.
- Camera angle, focal length, perspective, framing, and the original aspect ratio.
- Existing light direction, colour temperature, and shadow positions.
- The building itself: walls, ceiling, roller doors, windows, structural columns.
- Any "VRK" or "VAPORIX" branding already visible on walls or signage.

CHANGE 1 — LICENCE PLATE
Replace the vehicle's licence plate with a branded plate, using these exact
specifications every time:
- Shape: flat rectangle, 520 mm x 110 mm proportions, square corners.
- Background: matte white, hex #F2F2F0, evenly lit, no gradient.
- Left edge band: solid blue, hex #003399, occupying the leftmost 40 mm of the
  plate, full height. Inside it, a circle of 12 five-pointed gold stars,
  hex #FFCC00, in the upper two-thirds, and a white capital letter "E"
  centred below them.
- Main text: the single word VAPORIX, all capitals, hex #101010, in a bold
  condensed grotesque sans-serif, centred in the white area, occupying about
  70% of the plate's width and 60% of its height. No other characters, numbers,
  symbols, dashes or spacing marks.
- Thin black border, 3 mm, around the plate edge.
- The plate must sit flat in the car's original plate recess, matched to the
  car's perspective, with the same lighting and the same subtle reflections as
  the surrounding bodywork. No floating, no glow, no drop shadow.

CHANGE 2 — REMOVE CLUTTER
Remove and cleanly reconstruct the area behind: buckets, bottles, spray
bottles, cloths, towels, dust sheets, covers, hoses, cables, pressure washers,
vacuums, air compressors, brooms, mops, bins, boxes, crates, ladders, cones,
chairs, tables, hand tools, loose signage, other vehicles, and any people.
Also remove stains, scuffs, oil marks and tyre marks from the floor and the
lower walls.
Reconstruct whatever was behind each removed object so the wall or floor
continues naturally, with correct perspective and matching light. Do not add
any new object to replace them. The bay must read as empty except for the car.

CHANGE 3 — FLOOR
Replace the entire floor with a poured epoxy resin floor, using these exact
specifications every time:
- Colour: uniform dark charcoal grey, hex #2E3134, identical across the whole
  floor with no patches, no variation, no colour drift toward blue or brown.
- Finish: high-gloss wet-look, roughly 90 gloss units, like polished resin.
- Completely seamless: no expansion joints, no saw cuts, no control lines, no
  tiles, no grout, no drains, no manhole covers, no painted lines or markings.
- Perfectly smooth: no decorative flakes, no speckles, no chips, no metallic
  swirl, no anti-slip aggregate, no texture.
- Reflection: a soft mirror reflection of the car and the bay, vertically
  inverted directly beneath each object, at about 25% opacity, blurring and
  fading out with distance from the object.
- The floor meets the walls in a clean straight line with a simple coved edge.

OUTPUT
Photorealistic result at 4K resolution, maximum sharpness and detail, clean
professional automotive photography. Preserve the original aspect ratio.

DO NOT: change the car in any way, add lens flare, add glow or bloom, add
haze, add HDR halos, oversharpen, add film grain, add a watermark, add any
text anywhere except the VAPORIX plate, add reflections that do not match the
real geometry, warp or bend body panels, or add people.
```

---

## Checking the result

Before saving it into `public/images/edited/`, look for:

- **The plate spells VAPORIX.** `VAPORIIX` and `VAPORLX` both happen. Re-roll.
- **It's still the same car.** If the wheels, badge or door position changed,
  the model regenerated instead of editing. Discard and retry without any
  "create image" mode selected — attaching the photo is enough.
- **The floor matches your other results.** Different grey or gloss will
  strobe against its neighbours in the carousel.

Then follow `docs/images.md` to wire it into the site.

## What this does not cover

The floor is a fabrication — the studio's real floor is power-troweled
concrete. That was the client's decision, recorded here so nobody has to
rediscover it from a diff. The plate swap is the opposite: it removes real
customers' registrations, which are personal data, and is the reason no
pixelation step is needed anywhere else in the pipeline.
