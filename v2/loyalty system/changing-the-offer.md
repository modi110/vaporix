# Changing the offer

Two things can change: **how many washes** are needed, and **what the reward is**.
They behave very differently, and that difference is the whole point of this page.

## What the number means

`loyalty_config.visits_required` is **the washes the customer pays for**, not the
washes on the card. The card draws that many car stamps **plus one gift slot**, so
the current value of `4` reads as "five washes, the fifth free".

| `visits_required` | The offer | The card |
|---|---|---|
| 4 | five washes, the fifth free | 4 cars + gift, counter `2 / 4` |
| 5 | six washes, the sixth free | 5 cars + gift, counter `2 / 5` |

Getting this backwards is the mistake this programme already made once: when the
number meant "washes on the card", the reward unlocked *after* the fifth paid wash
and the free one was the sixth.

---

## The reward — one edit, nothing else

The reward text lives in the database and every surface reads it. Change the row,
and the card, the landing page and the SEO description all follow on the next load.

```sql
update public.reward_definitions
   set label_es = 'Lavado GRATIS',
       label_en = 'Free wash'
 where active;
```

No code change. No deploy. Done — **except** for `card.ready` and `card.congrats`
in both message files, which spell out "gratis"/"free" rather than using the
placeholder. See the second table in §2.

---

## The number of washes — one row, then the words

The **behaviour** is one row. The **words** are a handful of sentences that have to
be rewritten by hand, because Spanish and English ordinals (quinto, sexto / fifth,
sixth) cannot be generated from a number without more machinery than this is worth.

### 1. The row that governs everything

```sql
-- six washes, the sixth free
update public.loyalty_config set visits_required = 5 where id;
```

That alone changes: the number of car stamps on the card, the `2 / 4` counter, the
"te faltan 2 lavados" line, and when the reward unlocks. All of it, instantly,
with no deploy. The gift slot is always drawn on top, so the row grows by one.

**Check the ceiling first.** `loyalty_cards.visits` is constrained to 0–50 and
`visits.visit_number` to 1–50. Anything under 50 is fine as is.

**On its own, this moves the finish line for people already running.** Someone
sitting at 3/4 becomes 3/5 and needs one more wash than they were promised.
Lowering the target is worse: a card at 4/5 dropped to a target of 3 is already
past it, and the next scan grants the reward.

**So do not run this statement by itself.** Use the transaction in 1a below, which
protects customers mid-cycle. The bare `update` above is correct only before the
programme has a single live card.

### 1a. Changing the target without penalising existing customers

> **Built and applied** — `supabase/migrations/20261008000000_per_card_target.sql`.
> The column exists and all three functions read the effective target, so the
> transaction below is ready to run as written.

A customer who signed up under "five washes" should finish under five washes. The
way to guarantee that is to let a card remember the target it was issued under,
instead of every card reading one global number.

**The column** — `loyalty_cards.visits_required`, nullable. `null` means "follow
`loyalty_config`", which is every card until a target change freezes one onto it.

**The effective target**, everywhere one is read:

```sql
coalesce(card.visits_required, config.visits_required)
```

**Changing 4 → 5** (five washes becoming six), in one transaction:

```sql
begin;
-- freeze the old target onto everyone mid-cycle
update public.loyalty_cards set visits_required = 4 where active;
-- the new target, for cards issued from now on
update public.loyalty_config set visits_required = 5 where id;
commit;
```

**Both statements must be in the one transaction.** Run separately, a scan landing
in the gap reads the new global target against a card not yet frozen, and that
customer silently moves onto the new programme mid-cycle — the exact thing this is
meant to prevent.

**What each person gets**

| | Their target |
|---|---|
| Mid-cycle when the change ran | 4 — frozen on their card |
| Signed up after the change | 5 — card is `null`, follows config |
| Mid-cycle customer, after they redeem | 5 — redemption clears the frozen value |

**The three functions to change**

| Function | Change |
|---|---|
| `card_state_json` | read the `coalesce`, not `config.visits_required`, and keep emitting it as `visits_required` so the card shows the customer's own target |
| `register_visit` | compute `reward_available` against the `coalesce` |
| `redeem_reward` | on reset, also `visits_required = null`, so the next cycle rejoins the current programme |

No TypeScript changes: `visitsRequired` already flows from the function's jsonb
through to the card.

**The trade-off.** Nothing is faked and no count diverges from its history, but two
targets are live at once for as long as the oldest open cycle lasts. During that
window there is no single answer to "how many washes is the programme?" — it
depends on the customer. That is the honest cost of not moving anyone's number.

**Lowering the target** uses the same mechanism and is the only safe way to do it:
freezing the old value on existing cards is what stops a card at 4/5 suddenly
being past a new target of 3.

### 2. The sentences that do not follow

These are plain text in the translation files. Nothing warns you if they go stale,
so the site would advertise one offer while the card delivers another.

Since the October redesign the loyalty page and the home-page band do not read
the database at all (they stay static), so every one of these is hand-written.
The sample card on both pages also counts to a fixed four (`TARGET` in
`src/components/loyalty/DemoPass.tsx`).

| File | Key | Current text (es) |
|---|---|---|
| `messages/*.json` | `loyalty.lede` | Cada lavado suma un sello y el quinto es gratis… |
| `messages/*.json` | `loyalty.steps.show.body` | …Cuatro lavados, cuatro sellos. |
| `messages/*.json` | `loyalty.steps.free.title` | El quinto va por nuestra cuenta |
| `messages/*.json` | `loyaltyBand.body` | …cada lavado suma un sello y el quinto es gratis. |
| `messages/*.json` | `meta.loyalty.description` | …cada lavado suma un sello y el quinto es gratis. |
| `src/components/loyalty/DemoPass.tsx` | `TARGET` | 4 |

**Two more that go stale when the *reward* changes, not the number.** These say
"free" in so many words, because "tu próximo lavado es Lavado GRATIS" is not a
sentence. If the reward ever stops being a free wash, rewrite them:

| File | Key | Current text |
|---|---|---|
| `messages/es.json` | `card.ready` | ¡Tu próximo lavado es gratis! |
| `messages/es.json` | `card.congrats` | ¡Felicidades! Has disfrutado tu lavado gratis. |
| `messages/en.json` | `card.ready` | Your next wash is free! |
| `messages/en.json` | `card.congrats` | Congratulations! You have enjoyed your free wash. |

Also `loyalty.demo.reward` ("lavado gratis"), the reward named on the sample
card. Everything on the customer's real card is driven by the database and
needs no attention.

### 3. Verify

```
npm run build          # from inside v2/
```

Then open `/dev/card` and confirm the gallery shows the new number of states, and
`/es/fidelidad` and `/en/loyalty` to confirm the headline matches.

---

## The congratulations window

Redemption resets the count immediately — it has to, or the next scan would hand
out a second reward. Without anything else, the customer's card would snap to an
empty `0 / 4` while they are still standing at the counter.

So for **three hours** after the free wash is given, the card keeps showing the
finished row: every car lit, the gift gold, and "¡Felicidades!". After that it is
`0 / 4` and the next cycle has begun.

Nothing is stored for this. `isCelebrating()` in `src/lib/loyalty/service.ts` reads
`rewards.redeemed_at`, which the database already records, so the congratulations
cannot disagree with what was actually handed over. The window is the constant
`CELEBRATION_MS` in that same file — the only place to change it.

---

## Why the words are not generated from the number

Generating them means producing ordinals in two languages with the right gender and
agreement, for a number that is unlikely ever to change. The alternative is to write
the headline with digits — "5 lavados. El 5.º, …" — which can never go stale but
reads worse in the one place that most needs to read well. The decision was to keep
the better copy and write this page instead.
