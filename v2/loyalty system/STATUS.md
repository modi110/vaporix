# Where the loyalty system is

Last updated **14 October 2026**. Update this file when any of it stops being
true — it is the first thing to read in a new session.

The three documents in this folder do different jobs:

| File | For |
|---|---|
| `STATUS.md` (this) | what exists today, what is blocked, what is next |
| `changing-the-offer.md` | how to change the number of washes or the reward |
| `wallets-and-admin.md` | the plan for the parts not built yet |
| `loyaltysystem.md` | the original specification, kept as written |

---

## Deployed 10 November 2026

`loyalty` merged into `main` and live on vaporix.net (Vercel project `vaporix-v2`).
The programme is shown as **coming soon**: a stamp on the sample cards and an
overlay over the join form (`ComingSoonStamp.tsx`, `loyalty/page.tsx`). Vercel has
**no environment variables yet**, so `/staff`, `/admin`, card pages and wallet links
fail live until they are added.

## In one line

**The programme works end to end and has been tested on a real phone. Nothing
is deployed.** It waits on the client saying yes.

> **Still to check by hand, signed in:** the scanner (visit, then redeem on the
> next scan, with the confirm dialog) and `/admin` (lookup by phone, the
> hand-back QR, times in Spanish time). They need a real PIN, so they were not
> run in the review.

---

## Review fixes, 13 October

A full review found these; all are fixed and committed on `loyalty`. The
migration `20261013000000_login_attempt_first.sql` is applied to the live
database.

Tested on 14 October against local dev: 20 parallel wrong PINs on `TEST` →
4 "wrong", 16 "locked", exactly 5 counted in the database (the `TEST` counter
was reset afterwards); a malformed staff id → 400; signing up with an existing
customer's number → "ya tiene una tarjeta", no redirect.

| Was | Now |
|---|---|
| Signing up with a phone that already had a card redirected to **that** card. The URL is the QR, so anyone who knew a customer's number got their card and their free wash | Signup refuses with "ask in the shop". The owner finds the card in `/admin` **by phone or card number** and shows a QR of the card's link; the customer scans it with their own camera |
| Login checked the lock, then the PIN, then counted the failure. Parallel requests all passed the check — a burst got hundreds of guesses, not five | `begin_staff_login` counts the attempt under a row lock **before** the PIN is checked |
| Staff names are public on `/staff/login`, so anyone could lock everyone out all day | A phone that has signed in before carries a signed `vpx_device` cookie and may try once past a lock. One wrong PIN from it drops the trust |
| The role was read from the cookie, so a deactivated or demoted admin kept `/admin` for up to 12 h | `readStaffSession` re-reads the staff row on every request |
| Admin times had no time zone; Vercel runs in UTC, so every time read 1–2 h early | Formatters pinned to `Europe/Madrid` |
| The scanner offered "Canjear recompensa" right after the 4th paid wash, where a late second tap gave the reward away with no undo | No button on any confirmation screen. Redeem only when the card is scanned on the next visit, behind a confirm dialog |
| `redeem_reward` redeemed on a deactivated card | Refuses with `CARD_INACTIVE` (same migration) |
| API errors came back as HTML 500s, which the scanner showed as "no connection"; a non-uuid staff id was a 500 | JSON `SERVER_ERROR`, shown as a server error; bad ids are a plain 400 |
| A non-Vaporix QR held in frame sent a lookup on every video frame | A failed code is ignored by the camera for 3 seconds |
| A failed count on the dashboard showed as 0 | It throws instead |
| Privacy line said "only your phone, nothing more" while also storing name and email | Says what is stored, why, and how to get it deleted |

PIN length stays 4–12 digits — the owner's decision.

---

## The offer

**Three paid washes, the fourth free** (changed 10 November 2026, was 4 + 1).
The card shows three gauge segments plus a gift segment — counter reads `2 / 3`.
The database change is `supabase/migrations/20261110000000_three_paid_washes.sql`
(freezes the old target of 4 on cards already mid-cycle). **Applied to the live
database on 10 November 2026**: 2 test cards that were mid-cycle keep a target of
4 until their free wash; the other 5 active cards follow the new offer of 3.

`loyalty_config.visits_required = 3` means *washes the customer pays for*. The
card draws one more slot than that. Getting this backwards is the mistake the
build already made once; see `changing-the-offer.md`.

After the free wash is given, the card keeps showing the finished row for
**three hours**, then resets to `0 / 3`.

---

## What is built and working

- Registration at `/es/fidelidad` and `/en/loyalty`
- The card at `/es/tarjeta/<token>` — QR, stamps, gift slot, congratulations state
- Staff login at `/staff/login` (per-person PIN, scrypt, throttled)
- Scanner at `/staff` — camera first, then manual entry by the 7-digit customer
  number printed on the card
- Visit registration. The duplicate-scan cooldown is **off** (`loyalty_config.cooldown_seconds = 0`, owner's choice, 14 October); set it to 120 to bring it back
- Reward redemption, offered on the confirmation screen of the visit that fills
  the card
- **Admin dashboard at `/admin`** — counters, customer lookup, visit history,
  reward history, per-staff activity. Open to **every signed-in staff member**
  (the owner's decision, 9 November): the scan screen has a "Panel" link to it.
  It used to be admin-only, with a 404 for workers. Signed-out visitors are
  still sent to the login
- Card gallery for design review at `/dev/card` (dev only)

Verified by hand: the full cycle on a real phone, the cooldown refusing a
rescan, the tampered cookie being rejected, and no phone or email anywhere on
the dashboard outside a lookup. (The staff-vs-admin 404 was checked before the
page was opened to all staff.)

---

## Git

Nothing is pushed. Nothing is deployed.

| Branch | State |
|---|---|
| `main` | 1 commit ahead of `origin/main` — moved 67 MB of unused source photos out of `v2/public/` into `source-media/` at the repo root |
| `loyalty` | 2 commits on top of `main`. **No upstream on purpose**, so a reflexive `git push` cannot ship it |
| `seo-local-search` | backup of the pre-rebase loyalty commits. Safe to delete |

The admin dashboard and the review fixes are committed on `loyalty`. Left
uncommitted on purpose: the September→October discount edit in
`messages/*.json` and `src/content/vehicles.ts` — that belongs on `main`.

Publishing, when the client approves:

```bash
git switch loyalty
git push -u origin loyalty
```

Everything unrelated goes out from `main` as usual, independently.

---

## Database

Supabase project **vaporix**, ref `rmwhhouespvfwfwtvxjd`, eu-west-3, free tier.

**The free tier pauses the project after about a week with no activity, and a
request does not wake it** — it has to be restored by hand in the Supabase
dashboard, which takes a few minutes. Open the dashboard the day before the
client demo. (`/fidelidad` no longer reads the database, so a paused project
no longer fails the build.)

Every table has RLS on with **zero policies**, so only the service-role key can
read or write. The browser never talks to Supabase.

Eight migrations in `v2/supabase/migrations/`, all applied to the live
database.

> `20261009000000_four_paid_washes.sql` sets the column default to 4; live, the
> *row* is 4 but the column *default* is still 5. Cosmetic: `loyalty_config`
> can never hold a second row (`id boolean primary key check (id)`), so the
> default is never used. To tidy it anyway:
>
> ```sql
> alter table public.loyalty_config alter column visits_required set default 4;
> ```

### Test data — do not delete yet

Three customers, including `Wesam` (card `8729771`), plus the `TEST` staff
account. **The owner wants these shown to the client first.** Delete after the
demo. `Mohammad` (admin) stays.

Order matters. `TEST` has visits and redemptions on record, and those keep
their staff link on purpose (no cascade), so deleting `TEST` first fails.
Customers first — their cards, visits and rewards cascade with them — then
`TEST`. Check the names before running:

```sql
begin;
delete from public.customers;              -- ONLY before launch: today every customer is a test one
delete from public.staff where name = 'TEST';
commit;
```

### Seeing the data

Supabase dashboard → Table Editor for raw rows, SQL Editor for anything across
tables. Or just open `/admin`, which is the same information without the SQL.

---

## Wallet pass design — ready, 8 November

The Apple and Google pass design is approved (Spanish only, Vaporix blue,
rev-gauge progress). Every image, `pass.json`, and the Google class/object
JSON are in `wallet-design/`, with a README of the five states. This removes
design from the wallet blockers; the accounts and phones below still apply.

**On the site (9 November, local on `loyalty`):**

- The web card is now the same Redline Gauge design: the dial pictures live in
  `public/images/card/gauge/` (copied from `wallet-design/apple/`, one per
  count, 0–4). `LoyaltyPass.tsx` picks the picture; a longer programme needs more
  pictures. The old stamp sprites in `public/images/card/` are still used by the
  loyalty page's "how it works" icons.
- The product direction is wallet-only: the card should live in Apple Wallet and
  Google Wallet, not on the site. Signup now lands on a "your card is ready" page
  (`/es/tarjeta/<token>`) with the two badges (`WalletButtons.tsx`, pictures only
  for now) and a **temporary third button, "Ver mi tarjeta"**, that opens the web
  card (`?card=1`). Once the passes work: wire the badges to the pass routes,
  swap in the official artwork, and delete the third button and the `?card=1`
  branch in `card/[token]/page.tsx`. The same badges sit in the loyalty page hero.
  Until then the web card is the only working card, since the QR is what staff scan.
- Privacy policy page at `/es/privacidad` and `/en/privacy`, linked from the
  footer and the signup form. Text lives in `src/content/privacy.ts`. The NIF
  prints as "[to be completed]" until `site.taxId` in `src/content/site.ts` is
  set; check `site.legalName` against the registered name too. Have the client
  read it before launch.

---

## Blocked, and on whom

| Item | Waiting on |
|---|---|
| The privacy page's NIF/CIF | the client. The page is written and linked; it shows "[to be completed]" in place of the NIF until `site.taxId` is set (Spanish law, RGPD/LOPDGDD, wants the data controller named) |
| Deploy to Vercel | the owner's go-ahead |
| Deleting the test rows | the client demo happening first |
| Supabase paid tier | the client saying yes |
| **Google Wallet** | built; waits on Google's production approval, the official badge artwork, and a deploy for the image address. See below |
| **Apple Wallet** | €99/yr Developer Program, and a decision that it is worth it |

### Google Wallet — built, 9 November (local on `loyalty`, not deployed)

**Code:**

- `src/lib/wallet/google.ts` — the Google adapter. No SDK: RS256 JWTs signed with
  `node:crypto`, calls through `fetch`. Creates the "Add to Google Wallet" link
  and updates a saved pass. `types.ts` maps a card to the five states
  (`toPassView`) and defines `WalletAdapter`; `sync.ts` pushes the new state.
- `src/app/api/wallet/google/route.ts` — `/api/wallet/google?token=<qr_token>`
  redirects to Google's save page.
- `scan` and `redeem` routes call `syncWallets` inside `after()`, once the
  database write has committed. A wallet failure is logged and never fails a visit
  or a redemption.
- The Google badge in `WalletButtons.tsx` is a real link only when the credentials
  are configured; otherwise it stays a picture.
- `scripts/google-wallet-setup.mjs` — creates the loyalty class, or updates it with
  PUT (so removed fields really go away). It reads
  `wallet-design/google/loyalty-class.json`, so the design hand-off is the source.

**Design (v2 hand-off):** no `wideProgramLogo` (it would replace the round logo and
"VAPORIX" on Android-style layouts, which the web also uses now); program name
"Tarjeta de fidelidad"; hero images drawn for the slot below the QR code. Assets
are in `public/wallet/google/`.

**Configuration** (`.env.local`; in production, Vercel env vars):
`GOOGLE_WALLET_ISSUER_ID`, `GOOGLE_WALLET_KEY_FILE` (path to the service-account
JSON, kept outside the repo and OneDrive) or `GOOGLE_WALLET_KEY_JSON` in
production, and optionally `GOOGLE_WALLET_ASSET_BASE_URL` (defaults to
`<site>/wallet/google`).

**Push the class to Google:**
`node --env-file=.env.local scripts/google-wallet-setup.mjs`
Google fetches the images itself, so `GOOGLE_WALLET_ASSET_BASE_URL` must be a
public HTTPS address (a tunnel while testing, the live site later).

**Tested:** the save link opened on a laptop and the saved pass showed name, card
number, QR, rows and the gauge. **Not tested yet:** the pass updating after a scan
and after a redemption, the 4/4 notification message (sent with a blank body, which
Google may reject), an Android phone, and the new v2 design on a pass.

**Still open:** Google's production approval (until then the pass says
"[TEST ONLY]" and only test accounts can save it); the official Google badge
artwork; deploying so the images have a permanent address.

Setup history and the plan are in `wallets-and-admin.md`.

---

## Next, in order

1. Check the scanner and `/admin` by hand, signed in (see the note at the top).
2. Show the client. The dashboard is the persuasive part — it answers "how do I
   know what my staff are doing?".
3. On a yes: paid tier, delete the test rows, push `loyalty`, deploy. At deploy:
   - set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `LOYALTY_SESSION_SECRET`
     and `NEXT_PUBLIC_SITE_URL` in Vercel
   - add a Vercel Firewall rate-limit rule on `POST /api/staff/login` and on
     `POST` to `/es/fidelidad` and `/en/loyalty` (signup has no bot check of
     its own)
4. Google Wallet: test the update after a scan and a redemption, then ask Google
   for production access.
5. Apple Wallet, only if the client asks and accepts the yearly cost.
