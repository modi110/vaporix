# Changing the offer

Two things can change: **how many washes** are needed, and **what the reward is**.
They behave very differently, and that difference is the whole point of this page.

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

No code change. No deploy. Done.

---

## The number of washes — one row, then four sentences

The **behaviour** is one row. The **words** are four sentences that have to be
rewritten by hand, because Spanish and English ordinals (quinto, sexto / fifth,
sixth) cannot be generated from a number without more machinery than this is worth.

### 1. The row that governs everything

```sql
update public.loyalty_config set visits_required = 6 where id;
```

That alone changes: the number of stamps on the card, the `2 / 5` counter, the
"te faltan 3 lavados" line, and when the reward unlocks. All of it, instantly,
with no deploy.

**Check the ceiling first.** `loyalty_cards.visits` is constrained to 0–50 and
`visits.visit_number` to 1–50. Anything under 50 is fine as is.

**On its own, this moves the finish line for people already running.** Someone
sitting at 4/5 becomes 4/6 and needs one more wash than they were promised.
Lowering the target is worse: a card at 5/6 dropped to a target of 4 is already
past it, and the next scan grants the reward.

**So do not run this statement by itself.** Use the transaction in 1a below, which
protects customers mid-cycle. The bare `update` above is correct only before the
programme has a single live card.

### 1a. Changing the target without penalising existing customers

> **Not built yet.** This is the chosen approach, designed and agreed, but the
> column and the three function changes have not been applied. Build it before the
> first time the target actually changes, not during.

A customer who signed up under "five washes" should finish under five washes. The
way to guarantee that is to let a card remember the target it was issued under,
instead of every card reading one global number.

**The column**

```sql
alter table public.loyalty_cards
  add column visits_required smallint
    check (visits_required is null or visits_required between 1 and 50);
```

`null` means "follow `loyalty_config`". Every existing and future card is `null`
until a target change freezes one onto it, so adding the column changes nothing on
its own.

**The effective target**, everywhere one is read:

```sql
coalesce(card.visits_required, config.visits_required)
```

**Changing 5 → 6**, in one transaction:

```sql
begin;
-- freeze the old target onto everyone mid-cycle
update public.loyalty_cards set visits_required = 5 where active;
-- the new target, for cards issued from now on
update public.loyalty_config set visits_required = 6 where id;
commit;
```

**Both statements must be in the one transaction.** Run separately, a scan landing
in the gap reads the new global target against a card not yet frozen, and that
customer silently moves onto the new programme mid-cycle — the exact thing this is
meant to prevent.

**What each person gets**

| | Their target |
|---|---|
| Mid-cycle when the change ran | 5 — frozen on their card |
| Signed up after the change | 6 — card is `null`, follows config |
| Mid-cycle customer, after they redeem | 6 — redemption clears the frozen value |

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
freezing the old value on existing cards is what stops a card at 5/6 suddenly
being past a new target of 4.

### 2. The four sentences that do not follow

These are plain text in the translation files. Nothing warns you if they go stale,
so the site would advertise one offer while the card delivers another.

| File | Key | Current text |
|---|---|---|
| `messages/es.json` | `loyalty.title` | Cinco lavados. El quinto, {reward}. |
| `messages/es.json` | `loyalty.step4` | En el quinto lavado, la recompensa es tuya. |
| `messages/es.json` | `meta.loyalty.description` | …cinco lavados y el quinto es tu recompensa. |
| `messages/en.json` | `loyalty.title` | Five washes. The fifth, {reward}. |
| `messages/en.json` | `loyalty.step4` | On the fifth wash, the reward is yours. |
| `messages/en.json` | `meta.loyalty.description` | …five washes, and the fifth is your reward. |

`{reward}` is filled from the database — leave it as a placeholder.

Everything else on the card and the landing page is already driven by the number
in the database and needs no attention.

### 3. Verify

```
npm run build          # from inside v2/
```

Then open `/dev/card` and confirm the gallery shows the new number of states, and
`/es/fidelidad` and `/en/loyalty` to confirm the headline matches.

---

## Why the words are not generated from the number

Generating them means producing ordinals in two languages with the right gender and
agreement, for a number that is unlikely ever to change. The alternative is to write
the headline with digits — "5 lavados. El 5.º, …" — which can never go stale but
reads worse in the one place that most needs to read well. The decision was to keep
the better copy and write this page instead.
