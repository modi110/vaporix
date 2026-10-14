# The wallets, and the admin dashboard that is now built

The card, the scanner, visits, cooldown, rewards and redemption are built and
running. Of the three things that were left — the admin dashboard (§19), Google
Wallet (§17) and Apple Wallet (§15–§16) — **the dashboard is done.** The two
wallets are blocked on accounts, hardware and money that only the owner can
arrange.

See `STATUS.md` for the current state of everything.

---

## Part 1 — Admin dashboard · **BUILT**

Live at `/admin`. What shipped, and what was verified:

| | |
|---|---|
| Files | `src/app/admin/{page,layout}.tsx`, `src/app/admin/admin.css`, `src/lib/loyalty/admin.ts` |
| Order on the page | customer lookup first, then the counters, then visits, rewards, staff |
| Gate | `role = 'admin'`; a logged-in staff member gets **404**, not a redirect |
| Verified | no cookie → login; `staff` → 404; `admin` → 200; cookie edited `staff`→`admin` → rejected; `/es/admin` → 404 |
| Privacy | phone and email appear only inside a lookup; grepped the dashboard to confirm |
| Client JS | none — the lookup is a plain GET form |

Two bugs were found by testing rather than reading: duplicate React keys where
seeded visits shared a timestamp (now keyed on row id), and the search button
stretching full width because `.staff-button` is thumb-sized by default.

The rest of this section is kept as a record of what was intended, because it
explains the choices.

### Why it was worth building before the wallets

### Why it is worth building before the wallets

Every visit already records which staff member scanned it, and every reward
records who handed it over and when. None of it is visible anywhere. Today the
only way to answer "how many washes did we give away last month?" is to open the
Supabase SQL editor.

For the client pitch this is the part that answers *"how do I know what my staff
are doing?"* — a wallet pass does not.

### The groundwork already exists

| Piece | Where | State |
|---|---|---|
| `/admin` excluded from locale routing | `src/proxy.ts` | done — the matcher already skips `admin` |
| Signed session carrying a role | `src/lib/auth/session.ts` | done — `StaffSession` is `{ staffId, role }`, role is `"staff" \| "admin"` and part of the signed payload |
| Roles in the database | `staff.role` | done — `Mohammad` is `admin`, `TEST` is `staff` |
| Minimal unlocalized shell | `src/app/staff/layout.tsx` | reuse the pattern; no Preloader, Nav or Footer |

So the work is a layout, a page, some queries and a guard. No schema change, no
new dependency.

### The guard

```ts
const session = await readStaffSession();
if (!session) redirect("/staff/login");
if (session.role !== "admin") notFound();
```

`notFound()` rather than a redirect for a non-admin: a staff member who is
logged in should not learn that an admin area exists.

**Check this with the `TEST` account, not just by reading the code.** A page
that merely hides its links is not gated.

### What it shows

Counts, from one query each:

- customers, active cards
- visits this week and this month
- rewards outstanding (`status = 'available'`) vs redeemed

Then three lists:

- **Visits**, newest first: customer, card number, visit number, staff, time
- **Rewards**: earned, redeemed, by whom, when
- **Per-staff activity**: visits scanned and rewards given, per person

And a lookup by customer number — staff already read that number aloud, so it is
the natural key for "which card is this?".

### Privacy

Spec §19: *do not expose sensitive customer information unnecessarily.* Name and
card number on the lists. **Phone and email only inside the single-customer
lookup**, never in a table that is on screen while a customer stands at the
counter.

### Files

```
src/app/admin/layout.tsx     minimal shell, Spanish, noindex
src/app/admin/page.tsx       the dashboard, server component
src/lib/loyalty/admin.ts     the queries, "server-only" like service.ts
```

Queries go in their own module rather than inline in the page: `service.ts` is
the write path and should stay small and auditable.

### Verify

- `/admin` with no cookie redirects to the staff login
- `/admin` logged in as `TEST` (role `staff`) returns 404
- `/admin` as `Mohammad` renders
- the counts match `select count(*)` run directly against the tables
- no phone or email in the page source of the list views

---

## Part 2 — Google Wallet

**Blocked on: a Google Cloud service account, an Issuer ID, and an Android
phone.** The accounts are free; the phone is not optional.

### First: can it even be tested?

| Device | Can it test a Google Wallet pass? |
|---|---|
| Android 9+ | Yes. The only way to see and use the pass. |
| Laptop | Partly. The save link opens a Google page that parks the pass in your account, which proves the link and the data are right. The pass itself is not visible. |
| iPhone | **No.** There is no Google Wallet app on iOS; Google withdrew it. |

**With no Android device, do not start this.** It would mean building something
nobody here can look at. iPhone customers already have the web card, which
works on every phone and can be saved to the home screen.

### What the owner must do

**Google Cloud — the service account**

1. [console.cloud.google.com](https://console.cloud.google.com) → create a project.
2. **APIs & Services → Library** → "Google Wallet API" → **Enable**.
3. **IAM & Admin → Service Accounts → Create**. No roles needed.
4. Open it → **Keys → Add key → Create new key → JSON** → download.
5. Put the file in `v2/`. `*-service-account*.json` is already gitignored.

**Google Pay & Wallet Console — the issuer**

6. [pay.google.com/business/console](https://pay.google.com/business/console) →
   sign up for an **Issuer account** → note the **Issuer ID**.
7. **Users → Invite a user** → the service account's email
   (`…@….iam.gserviceaccount.com`) → role **Developer**.
8. **Google Wallet API → Manage → test accounts** → add the Google account of
   every phone that will test.

Then hand over the **Issuer ID** and the **filename** of the key — never its
contents. The path goes in `.env.local`; in production the key goes into Vercel
environment variables.

> **Demo mode.** A new issuer can only save passes to the allowlist from step 8.
> Production access is a separate, reviewed request to Google and is not
> instant. Do not promise the client working passes for their customers before
> that lands.

> **Public image URLs.** Google fetches the pass logo and hero image itself, so
> `localhost` will not do. They must be served from `vaporix.net`, which means
> the images have to be deployed before a pass renders properly.

### What gets built

- **One Loyalty Class**, created once, describing the programme: brand, colours,
  the "4 washes then a free one" structure.
- **One Loyalty Object per customer**, carrying the count and the reward text.
- **An "Añadir a Google Wallet" button** on the card page. There is already a
  `TODO(wallet)` marking the spot in `src/app/[locale]/card/[token]/page.tsx` —
  the "add to home screen" line that used to live there has been removed.
- **A PATCH after every `register_visit` and `redeem_reward`** so the pass count
  follows the database.

### The rule that matters

**A wallet sync failure must never fail the visit.** By the time the PATCH runs,
the database has already committed: the customer *has* that wash. Log the
failure and carry on. A staff member seeing "error" and scanning again would
double-count a visit that was already recorded.

Which also means the pass can drift from the database when Google is down. The
database is the source of truth; the pass is a rendering of it. A later
reconciliation job can re-push stale objects — not needed for launch.

### The adapter boundary (spec §18)

Define this while building Google, not after:

```
src/lib/wallet/types.ts     LoyaltyState + WalletAdapter interface
src/lib/wallet/google.ts    first implementation
src/lib/wallet/apple.ts     second, later
```

The loyalty logic must not know which wallet a customer uses. `registerVisit()`
updates the canonical state; adapters render it. Writing the interface with only
one implementation in hand is a guess — but writing it *after* Google ships, with
Apple's constraints unknown, is a bigger one. Keep the interface to what both
provably need: create, update, and a save link.

### Verify

- add the card on a real Android phone
- drive 0 → 1 → 2 → 3 → 4 → redeem → 0 and confirm the pass follows each change
- credentials appear only in env vars; nothing wallet-related is committed
- kill the network mid-scan and confirm the **visit still registers**

---

## Part 3 — Apple Wallet

**Blocked on: €99/yr, and a decision about whether it is worth it.**

Needs the Apple Developer Program membership, a Pass Type ID, a `.p12` signing
certificate and the WWDR certificate. Updating a single number also needs its own
registration web service plus APNs push — a whole subsystem Google does with one
REST call.

### The honest recommendation

Ship Google first and see whether the client asks. The web card already works on
every phone, including iPhone, and can be saved to the home screen. €99/yr is
real money for a single wash in Buñol, and it buys a nicer version of something
that already works.

The one argument that would change this: Apple Wallet is the **only** wallet
iPhone customers can have, since Google's does not exist on iOS. If the client's
customers are mostly on iPhone, Apple is not the second wallet — it is the only
one that reaches them.

Revisit only if the client's customers are heavily iPhone **and** someone
actually asks for it. "It would be nice" is not a reason to spend it.

If it goes ahead, `apple.ts` implements the same `WalletAdapter`, and the update
service (registration endpoints + APNs) is a separate stage after basic pass
generation works — per spec §16.

---

## Order

1. ~~Admin dashboard~~ — **done**.
2. **Google Wallet** — once the Issuer ID, the service account and an Android
   test phone all exist. Any one missing and it is not worth starting.
3. **Apple Wallet** — only if the client asks and accepts the yearly cost, or if
   their customers are mostly on iPhone.

Everything here lands on the `loyalty` branch, which has no upstream and is
pushed only when the client approves.
