# Working with the photographs

Everything about the photos on this site is controlled from **one file**:

```
v2/scripts/process-images.mjs
```

You edit a short list at the top of it, run one command, and the site updates.
You never edit the images in `public/images/hero/` or `public/images/gallery/`
by hand — those are generated, and re-running the script overwrites them.

Run every command from inside the `v2` folder.

---

## Moving a car left or right in its frame

Each photo has a **`focusX`**. There is one rule, and everything else follows
from it:

> **`focusX` is where the middle of the car is in the original photo.**
> Set it to that, and the car comes out centred.

It is a fraction of the photo's width. If the car's middle is 60% of the way
across the original, set `focusX: 0.6`. You are not choosing where to *put* the
car — you are telling the script where the car already *is*, so it can build
the picture around it.

### Step 1 — look at where the cars actually are

```
node scripts/process-images.mjs --centres
```

This writes **`centre-grid.jpg`** in the `v2` folder. Open it. Every photo has
a percentage ruler across it, a red line at 50%, and a **green line showing the
current `focusX`**.

Find the middle of the car. Read the number off the ruler. If the car's nose is
at 30% and its tail at 90%, the middle is 60%, so `focusX` should be `0.6`.

### Step 2 — change the number

Open `scripts/process-images.mjs`. Near the top:

```js
const SOURCES = [
  { file: "Ww.jpeg",   name: "golf-front", alt: "golfFront", focusX: 0.53, focusY: 0.66 },
  { file: "mini.jpeg", name: "mini-jcw",   alt: "miniJcw",   focusX: 0.6,  focusY: 0.62 },
  ...
];
```

Change `focusX`. Save.

### Step 3 — rebuild and check

```
node scripts/process-images.mjs
```

This also writes **`contact-sheet.jpg`**. On it, the **lit area is what a phone
keeps** and the dark area is thrown away. If any part of the car is in the dark
area, it is being cut off — adjust `focusX` and run it again.

### Which way to nudge

If the result is still not quite centred, this is the direction to go — and it
is the opposite of what most people expect:

```
car looks too far LEFT   ->  make focusX SMALLER
car looks too far RIGHT  ->  make focusX BIGGER
```

The reason: `focusX` moves the *window*, not the car. Sliding the window right
makes the car inside it appear to shift left. Nudge by `0.02` at a time.

### If moving the number doesn't help

There is a hard limit. The window can only slide until it reaches the edge of
the photo, then it stops no matter what number you type — `0.7`, `0.9` and
`50` all give exactly the same picture as `0.63`.

**The script tells you.** Every run prints the range that actually does
something on each photo:

```
mini-jcw     focusX 0.9  (useful range 0.38-0.63)  <-- NO EFFECT
```

and then, at the bottom:

```
This number had no effect:
 - mini-jcw: focusX 0.9 does nothing — the picture is already as far right
   as it goes. On this photo only 0.38 to 0.63 changes anything.
```

If you see NO EFFECT, pick a number inside the range it printed.

If a car still won't centre, the car is simply too wide in that photo — it
takes up more of the frame than a phone screen can show. That photo can't be a
hero. Move it to the gallery instead (see below). `bmw-serie3` and `audi-a5`
are both in that situation.

**`focusY`** works the same way, top to bottom, but only affects the desktop
version. The phone version always keeps the full height of the photo, because
the empty ceiling above the car is where the VAPORIX headline sits.

---

## Adding a new photo

### Step 1 — retouch it

Run it through Gemini with the prompt in `docs/gemini-retouch-prompt.md`.
**Set the output resolution to 2K or 4K, not 1K** — 1K comes back too soft for
a full-screen hero, and the script will warn you about it.

### Step 2 — put the file in place

Save it into:

```
v2/public/images/edited/
```

Give it a plain lowercase name with no spaces: `golf-gti.jpeg`, not
`WhatsApp Image 2026-09-03 (2).jpeg`.

### Step 3 — add one line to the list

In `scripts/process-images.mjs`, add a line to `SOURCES`:

```js
{ file: "golf-gti.jpeg", name: "golf-gti", alt: "golfGti", focusX: 0.5, focusY: 0.6 },
```

- **`file`** — exactly the filename you saved, including `.jpeg`
- **`name`** — what the generated files get called. Lowercase, dashes, no spaces
- **`alt`** — the key for its description. Same word, but camelCase: `golfGti`
- **`focusX` / `focusY`** — start with `0.5` and correct them afterwards

### Step 4 — decide if it goes in the hero

Just below `SOURCES` there is a shorter list:

```js
const HERO = ["mini-jcw", "seat-exeo", "golf-front", "audi-q5"];
```

**This list is the carousel, and the order is the order they appear.** Add the
new `name` where you want it. Leave it out and the photo still appears in the
gallery, just not the hero.

To reorder the carousel, reorder this list. To make a different car open the
site, move it to the front.

### Step 5 — run it

```
node scripts/process-images.mjs
```

It will tell you three things:

- the size of each crop it made
- **"Alt text still to write"** — a list of descriptions to fill in
- **"Needs a sharper source"** — any hero photo too soft for a phone

### Step 6 — write the description

The script adds a placeholder so the site never breaks, but it reads
`TODO: describe golfGti`. Replace it in **both** files:

```
v2/messages/es.json     hero.slides.golfGti   and  pages.gallery.alt.golfGti
v2/messages/en.json     hero.slides.golfGti   and  pages.gallery.alt.golfGti
```

Write what is in the photo, for someone who cannot see it:
*"Volkswagen Golf GTI negro, visto de frente"*.

**Both files, always.** If a description exists in Spanish but not English, the
English page crashes rather than falling back — and you would only find out by
visiting it.

### Step 7 — check it

```
node scripts/process-images.mjs --centres
```

Read the new car's real position off the grid, correct `focusX`, run the script
once more.

---

## Removing a photo

Delete its line from `SOURCES`, delete its name from `HERO` if it's there, and
run the script. The old generated files stay behind harmlessly; delete them
from `public/images/hero/` and `public/images/gallery/` if you want them gone.

---

## Quick reference

| I want to… | Do this |
| --- | --- |
| Move a car left/right | Change `focusX` in `SOURCES`, rerun |
| See where cars actually are | `node scripts/process-images.mjs --centres` |
| See what a phone cuts off | `node scripts/process-images.mjs --contact` |
| Add a photo | Save to `edited/`, add a line to `SOURCES`, rerun |
| Change carousel order | Reorder the `HERO` list |
| Change which photo opens the site | Move its name to the front of `HERO` |
| Take a photo out of the carousel | Remove its name from `HERO` |
| Rebuild everything | `node scripts/process-images.mjs` |

## Two rules

1. **Never edit `src/content/hero.ts` or `src/content/gallery.ts`.** They say
   GENERATED at the top and the script overwrites them every run.
2. **Never edit files in `public/images/hero/` or `public/images/gallery/`.**
   Same reason. Edit the original in `edited/` and rerun.
