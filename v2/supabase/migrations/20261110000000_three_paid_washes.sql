-- Three paid washes, the fourth free.
--
-- `visits_required` is the washes the customer pays for (see
-- 20261009000000_four_paid_washes.sql), so the new offer is 3. The card draws
-- three car stamps plus the gift slot, and the gauge artwork now has four
-- segments (strip-0 … strip-3).
--
-- This is a change of offer, so it follows `changing-the-offer.md` §1a:
-- anyone already part-way through a card keeps the target they signed up
-- under. Lowering without this would put a card sitting at 3/4 straight past
-- the new target of 3, and the next scan would hand out a reward early.
--
-- Cards at zero are not frozen: they have nothing in progress, so moving them
-- onto the shorter programme only helps them. Redemption clears a frozen
-- target, so every frozen card rejoins the new offer after its free wash.
--
-- Both statements run in this migration's single transaction, so no scan can
-- land between them.

update public.loyalty_cards
   set visits_required = 4
 where active
   and visits_required is null
   and (visits > 0 or reward_available);

alter table public.loyalty_config
  alter column visits_required set default 3;

comment on column public.loyalty_config.visits_required is
  'Washes the customer pays for before the free one. The card draws this many car stamps plus a gift slot, so 3 reads as "four washes, the fourth free".';

update public.loyalty_config set visits_required = 3 where visits_required = 4;
