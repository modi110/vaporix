-- A card remembers the target it was issued under.
--
-- `loyalty_config.visits_required` is one global number, so changing it moves
-- the finish line for people already running: someone at 4/5 becomes 4/6 and
-- needs a wash they were never told about. Lowering it is worse — a card at
-- 5/6 is instantly past a new target of 4, and the next scan hands out a
-- reward nobody intended.
--
-- With this column a card can carry its own target. Null means "follow the
-- config", which is every card until a target change freezes one on, so this
-- migration changes no behaviour on its own.
--
-- To change the target from 5 to 6 afterwards:
--
--   begin;
--   update public.loyalty_cards set visits_required = 5 where active;
--   update public.loyalty_config set visits_required = 6 where id;
--   commit;
--
-- Both statements in the one transaction: run apart, a scan landing in the
-- gap reads the new global target against a card not yet frozen, and that
-- customer silently moves onto the new programme mid-cycle.

alter table public.loyalty_cards
  add column visits_required smallint
    check (visits_required is null or visits_required between 1 and 50);

comment on column public.loyalty_cards.visits_required is
  'Target frozen onto this card when the programme changed mid-cycle. Null means follow loyalty_config. Cleared on redemption so the next cycle rejoins the current programme.';

-- ----------------------------------------------------------- card_state_json

-- Emits the customer's own target, so their card shows the deal they were
-- promised rather than the one currently on sale.
create or replace function public.card_state_json(p_card_id uuid)
returns jsonb
language sql
stable
set search_path = ''
as $$
  select jsonb_build_object(
    'qr_token',         c.qr_token,
    'card_number',      c.card_number,
    'customer_name',    cu.name,
    'visits',           c.visits,
    'visits_required',  coalesce(
      c.visits_required,
      (select cfg.visits_required from public.loyalty_config cfg where cfg.id)
    ),
    'reward_available', c.reward_available,
    'active',           c.active,
    'reward_label_es',  rd.label_es,
    'reward_label_en',  rd.label_en
  )
  from public.loyalty_cards c
  join public.customers cu on cu.id = c.customer_id
  join public.reward_definitions rd on rd.id = coalesce(
    (select r.reward_definition_id
       from public.rewards r
      where r.loyalty_card_id = c.id and r.status = 'available'),
    (select d.id from public.reward_definitions d where d.active)
  )
  where c.id = p_card_id;
$$;

-- ------------------------------------------------------------ register_visit

create or replace function public.register_visit(
  p_qr_token text,
  p_staff_id uuid,
  p_device text default null
)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v_card     public.loyalty_cards%rowtype;
  v_cooldown integer;
  v_target   smallint;
  v_last     timestamptz;
  v_def_id   uuid;
begin
  if not exists (
    select 1 from public.staff where id = p_staff_id and active
  ) then
    return jsonb_build_object('code', 'STAFF_INVALID');
  end if;

  -- Locks the card for the rest of the transaction. A concurrent scan of the
  -- same card blocks here and, on release, re-reads the committed row — so it
  -- sees the incremented count and falls into the cooldown branch below.
  select * into v_card
    from public.loyalty_cards
   where qr_token = p_qr_token
     for update;

  if not found then
    return jsonb_build_object('code', 'INVALID_TOKEN');
  end if;

  if not v_card.active then
    return jsonb_build_object('code', 'CARD_INACTIVE');
  end if;

  -- A full card takes no further washes until the reward is given.
  if v_card.reward_available then
    return jsonb_build_object(
      'code',  'REWARD_PENDING',
      'state', public.card_state_json(v_card.id)
    );
  end if;

  -- The card's own target wins over the global one. `lc` is aliased because an
  -- unqualified `visits_required` here would be the config's column while the
  -- card's is a record field, and that is exactly the kind of near-miss that
  -- reads as correct and is not.
  select lc.cooldown_seconds, coalesce(v_card.visits_required, lc.visits_required)
    into v_cooldown, v_target
    from public.loyalty_config lc
   where lc.id;

  select max(created_at) into v_last
    from public.visits
   where loyalty_card_id = v_card.id;

  if v_last is not null and v_last > now() - make_interval(secs => v_cooldown) then
    return jsonb_build_object(
      'code', 'COOLDOWN',
      'retry_after_seconds',
        ceil(extract(epoch from
          (v_last + make_interval(secs => v_cooldown)) - now()))::integer,
      'state', public.card_state_json(v_card.id)
    );
  end if;

  update public.loyalty_cards
     set visits           = visits + 1,
         reward_available = (visits + 1 >= v_target)
   where id = v_card.id
   returning * into v_card;

  insert into public.visits (
    customer_id, loyalty_card_id, staff_id, visit_number, device
  )
  values (
    v_card.customer_id, v_card.id, p_staff_id, v_card.visits, p_device
  );

  if v_card.visits >= v_target then
    select id into v_def_id from public.reward_definitions where active;
    insert into public.rewards (
      customer_id, loyalty_card_id, reward_definition_id
    )
    values (v_card.customer_id, v_card.id, v_def_id);
  end if;

  return jsonb_build_object(
    'code',  'OK',
    'state', public.card_state_json(v_card.id)
  );
end;
$$;

-- ------------------------------------------------------------- redeem_reward

create or replace function public.redeem_reward(
  p_qr_token text,
  p_staff_id uuid
)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v_card      public.loyalty_cards%rowtype;
  v_reward_id uuid;
begin
  if not exists (
    select 1 from public.staff where id = p_staff_id and active
  ) then
    return jsonb_build_object('code', 'STAFF_INVALID');
  end if;

  select * into v_card
    from public.loyalty_cards
   where qr_token = p_qr_token
     for update;

  if not found then
    return jsonb_build_object('code', 'INVALID_TOKEN');
  end if;

  select id into v_reward_id
    from public.rewards
   where loyalty_card_id = v_card.id
     and status = 'available'
     for update;

  if not found then
    return jsonb_build_object(
      'code',  'NO_REWARD',
      'state', public.card_state_json(v_card.id)
    );
  end if;

  update public.rewards
     set status               = 'redeemed',
         redeemed_at          = now(),
         redeemed_by_staff_id = p_staff_id
   where id = v_reward_id;

  -- Only redemption resets the cycle. Reaching the target never does.
  --
  -- The frozen target is cleared here: it was a promise about the cycle that
  -- just ended, and keeping it would grandfather this customer forever.
  update public.loyalty_cards
     set visits           = 0,
         reward_available = false,
         visits_required  = null
   where id = v_card.id
   returning * into v_card;

  return jsonb_build_object(
    'code',  'OK',
    'state', public.card_state_json(v_card.id)
  );
end;
$$;