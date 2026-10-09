-- Four paid washes, the fifth free.
--
-- `visits_required` was the number of washes on the card, and the reward
-- unlocked when the count reached it — which quietly made the free wash the
-- *sixth*. The offer is five washes with the fifth free, so the number has
-- to mean the washes the customer pays for: four.
--
-- The card renders one slot more than this number, drawn as a gift rather
-- than a car, so the row still reads as five.
--
-- No function changes. `register_visit` already unlocks the reward at
-- `visits >= visits_required`, which is now the fourth wash, and the fifth
-- visit is the redemption that gives the free one.

alter table public.loyalty_config
  alter column visits_required set default 4;

comment on column public.loyalty_config.visits_required is
  'Washes the customer pays for before the free one. The card draws this many car stamps plus a gift slot, so 4 reads as "five washes, the fifth free".';

-- The live row predates this migration. Lowering the target moves the finish
-- line for anyone mid-cycle, which is what `loyalty_cards.visits_required`
-- exists to prevent — see 20261008000000_per_card_target.sql. No card is
-- frozen here because this is a correction to a programme that had not yet
-- run with real customers, not a change of offer. A later change of offer
-- should freeze first.
update public.loyalty_config set visits_required = 4 where visits_required = 5;
