# Vaporix wallet pass — design hand-off

Final design: **Direction B, Redline Gauge, in Vaporix blue. Spanish only.**
Approved on the design canvas, 8 November 2026. The canvas boards are
"FINAL — Apple Wallet · 5 estados · Español" and "FINAL — Google Wallet · 5 estados · Español".

This folder has every file the two wallets need from design. Nothing here
contains a customer's data: the QR code, the name and the numbers are pass
fields that the server fills in for each customer.

The wallets themselves are still blocked on accounts (see `../STATUS.md`).

---

## What Wallet draws, and what we supply

| Element | Who puts it on the pass | Where it comes from |
|---|---|---|
| QR code + number under it | Wallet draws it | Apple `barcodes[0]`, Google `barcode`. Value = the bare `qr_token` (exactly what the web card's QR holds, so the existing scanner reads it), text = the 7-digit `card_number` |
| Customer name | Wallet shows our text | Apple field `socio`, Google `textModulesData['socio']` (+ `accountName`) |
| Washes count, "1 más", reward | Wallet shows our text | the fields in the state table below |
| Logo | **We supply the image** | Apple `logo.png`, Google `program-logo.png` |
| "VAPORIX" next to the logo | Wallet shows our text | Apple `logoText`, Google `issuerName` |
| Gauge artwork | **We supply the image, one per state** | Apple `strip_N.png`, Google `hero_N.png` |

Never put the QR code, the name or any text inside an image. Apple: "Use Pass
Designer or corresponding APIs to add barcodes rather than embedding them in pass
images" and "Avoid embedding text in the strip image". Google lists embedding text
in the hero image as a "Don't".

---

## The five states

`N` = paid washes on the card. State 5 (free wash redeemed) uses `N = 0`.

| State | Image | LAVADOS | Primary (Apple) / "Hasta lavado gratis" (Google) | PREMIO (Apple) | Premio (Google) | Message |
|---|---|---|---|---|---|---|
| 1 | `strip_1` / `hero_1` | 1/4 | 3 más · PARA TU LAVADO GRATIS | 5º lavado gratis | 5º gratis | — |
| 2 | `strip_2` / `hero_2` | 2/4 | 2 más · PARA TU LAVADO GRATIS | 5º lavado gratis | 5º gratis | — |
| 3 | `strip_3` / `hero_3` | 3/4 | 1 más · PARA TU LAVADO GRATIS | 5º lavado gratis | 5º gratis | — |
| 4 | `strip_4` / `hero_4` | 4/4 | GRATIS · ¡TU PRÓXIMO LAVADO ES GRATIS! | Listo para usar | Listo para usar | ¡Tu próximo lavado es gratis! |
| 5 | `strip_0` / `hero_0` | 0/4 | 4 más · PARA TU LAVADO GRATIS | 5º lavado gratis | 5º gratis | Lavado gratis canjeado. ¡Gracias! |

On Google, state 4 changes the row label too: "Tu próximo lavado" / "¡GRATIS!".

State 5 is the card starting again from zero: the reward field goes straight
back to "5º lavado gratis", never "Canjeado".

### Messages

- **Apple:** put the text in `changeMessage` on the `premio` field, only in the
  pass sent for state 4 and state 5. States 1–3 have no `changeMessage`. Apple
  says to use change messages "only for updates to time-critical information"
  and "never for marketing", which the free-wash unlock fits.
- **Google:** PATCH the object, and for states 4 and 5 add a message
  (`addmessage`) with `TEXT_AND_NOTIFY`. Notification titles should be under 29
  characters, so the title is the message itself, without extra text.

---

## Files

### `apple/` — inside each `.pkpass`

| File | Size | Notes |
|---|---|---|
| `icon.png`, `@2x`, `@3x` | 38 × 38 pt (38 / 76 / 114 px) | Required on every pass. Square, no rounded corners: the system rounds them |
| `logo.png`, `@2x`, `@3x` | 50 × 50 pt (50 / 100 / 150 px) | Round VRX mark, transparent outside the circle. Top-left corner |
| `strip_N.png`, `@2x`, `@3x` | 375 × 144 pt (375 / 750 / 1125 px) | **Rename to `strip.png` / `strip@2x.png` / `strip@3x.png`** inside the pass for state N |
| `pass.json` | — | Template, shown at state 3. `CAPITALS_LIKE_THIS` are values the server fills in |

Colours: background `rgb(0, 95, 211)`, values `rgb(255, 255, 255)`, labels
`rgb(220, 232, 248)`.

Gauge (in the images): filled washes deep blue `#003474`, still to fill white,
and at 4/4 the reward segment turns gold `#E8C547` with a gold glow and a white
sparkle.

### `google/` — served from `https://vaporix.net/wallet/google/`

Google fetches the images itself, so they must be on the live site. Copy this
folder to `v2/public/wallet/google/` on the `loyalty` branch when Google Wallet
is built.

| File | Size | Notes |
|---|---|---|
| `program-logo.png` | 660 × 660 px | Full square, white, **not pre-cut into a circle**. Google masks it; the mark sits inside the 15% safe margin |
| `hero_N.png` | 1032 × 812 px | Transparent background, so the card's `#005FD3` shows through. 20dp clear at top and bottom. Set per customer in `object.heroImage`. Drawn for the Android position: **below the QR code** (the barcode section's bottom slot) |
| `loyalty-class.json` | — | Created once. Two card rows: Lavados / Hasta lavado gratis, then Socio / Premio |
| `loyalty-object.example.json` | — | One per customer, shown at state 3 |

---

## Still open

- **Contact details** for the back of the Apple pass and the Google details:
  phone and address. Apple requires contact information for the organisation.
- **Privacy policy link**: waits on the client's legal name and NIF/CIF (see `STATUS.md`).
- **Real Apple values**: `passTypeIdentifier`, `teamIdentifier`, signing certificate.
  `pass.net.vaporix.loyalty` is a suggested ID, not a registered one.
- **Logo source**: the VRX logo only. Made from `v2/public/logo-vaporix.png`,
  the clean transparent copy (2132 × 737) of the logo the owner supplied. A
  vector file (SVG/AI/PDF) would still be better.
- **Test on real phones**: an iPhone for Apple, and an Android phone for
  Google. On Android, check whether Google's default template moves the hero
  image near the barcode.

---

## Google layout: design for Android

Google's template page shows two layouts. The Android one (`…android_expressive_passes_NewUX`) is also what the web shows today; the "Web" diagrams are the old design (`…OldUX`). Tested on 9 November: the pass renders the Android way on a computer too.

- **No `wideProgramLogo`.** When it is set, Android replaces the round logo and "VAPORIX" with the wide image. Removed on purpose, so the header is round logo + VAPORIX + program name, like Apple.
- **The hero image sits below the QR code**, in the barcode section's bottom slot, not between the rows. The gauge images are drawn large and centred for that spot.
- **"[TEST ONLY]"** under the header is added by Google while the issuer is in demo mode. It disappears with production access.

## How the pass ties to the existing card

- Web card route: `/es/tarjeta/<qr_token>` (English `/en/card/<qr_token>`), defined in `src/i18n/routing.ts`.
- The wallet buttons go where `TODO(wallet)` sits in `src/app/[locale]/card/[token]/page.tsx`.
- The pass QR holds the **bare token, never the URL**. The URL is a bearer link (`page.tsx`, `qr.ts`), and the scanner sends whatever the QR contains straight to `/api/loyalty/scan?token=`.
- Manual entry at the counter uses the 7-digit `card_number`, which is the text printed under the QR.
