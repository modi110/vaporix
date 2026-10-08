-- The loyalty state machine, in the database.
--
-- These three functions are the ONLY thing that may write visits, rewards, or
-- a card's counter. Putting the read-check-write sequence in one transaction
-- with the card row locked is what makes two simultaneous scans impossible to
-- double-count; the same logic in application code would be a race.
--
-- They are SECURITY INVOKER and are called only by the service-role key from
-- the Next.js server. Execute is revoked from anon and authenticated below, so
-- a leaked anon key cannot reach them.

-- Placeholder wording — replace with the real offer before launch.
insert into public.reward_definitions (label_es, label_en)
values ('Lavado exterior gratis', 'Free exterior wash');

-- ------------------------------------------------------------- card_state_json

-- The single shape every endpoint returns, so the web card, the staff screen
-- and both wallets all read the same fields.
create or replace function public.card_state_json(p_card_id uuid)
returns jsonb
language sql
stable
set search_path = ''
as $$
  select jsonb_build_object(
    'qr_token',         c.qr_token,
    'customer_name',    cu.name,
    'visits',           c.visits,
    'visits_required',  3,
    'reward_available', c.reward_available,
    'active',           c.active,
    'reward_label_es',  rd.label_es,
    'reward_label_en',  rd.label_en
  )
  from public.loyalty_cards c
  join public.customers cu on cu.id = c.customer_id
  -- The reward wording shown is the one this card's outstanding reward was
  -- granted under; with no reward outstanding, the currently active offer.
  join public.reward_definitions rd on rd.id = coalesce(
    (select r.reward_definition_id
       from public.rewards r
      where r.loyalty_card_id = c.id and r.status = 'available'),
    (select d.id from public.reward_definitions d where d.active)
  )
  where c.id = p_card_id;
$$;

-- ------------------------------------------------------------------ card_state

create or replace function public.card_state(p_qr_token text)
returns jsonb
language sql
stable
set search_path = ''
as $$
  select public.card_state_json(c.id)
  from public.loyalty_cards c
  where c.qr_token = p_qr_token;
$$;

-- --------------------------------------------------------------- register_visit

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

  -- Spec rule 13: a full card takes no further visits until it is redeemed.
  if v_card.reward_available then
    return jsonb_build_object(
      'code',  'REWARD_PENDING',
      'state', public.card_state_json(v_card.id)
    );
  end if;

  select cooldown_seconds into v_cooldown from public.loyalty_config where id;

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

  -- `visits` on the right-hand side is the pre-update value, so this both
  -- increments and decides the reward flag from the same read.
  update public.loyalty_cards
     set visits           = visits + 1,
         reward_available = (visits + 1 = 3)
   where id = v_card.id
   returning * into v_card;

  insert into public.visits (
    customer_id, loyalty_card_id, staff_id, visit_number, device
  )
  values (
    v_card.customer_id, v_card.id, p_staff_id, v_card.visits, p_device
  );

  if v_card.visits = 3 then
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

-- ---------------------------------------------------------------- redeem_reward

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

  -- Only redemption resets the cycle. Reaching 3/3 never does.
  update public.loyalty_cards
     set visits           = 0,
         reward_available = false
   where id = v_card.id
   returning * into v_card;

  return jsonb_build_object(
    'code',  'OK',
    'state', public.card_state_json(v_card.id)
  );
end;
$$;

-- ------------------------------------------------------------------ privileges

-- Default grants make functions in `public` callable by anon. These are not.
revoke all on function public.card_state_json(uuid)            from public, anon, authenticated;
revoke all on function public.card_state(text)                 from public, anon, authenticated;
revoke all on function public.register_visit(text, uuid, text) from public, anon, authenticated;
revoke all on function public.redeem_reward(text, uuid)        from public, anon, authenticated;
revoke all on function public.set_updated_at()                 from public, anon, authenticated;

grant execute on function public.card_state_json(uuid)            to service_role;
grant execute on function public.card_state(text)                 to service_role;
grant execute on function public.register_visit(text, uuid, text) to service_role;
grant execute on function public.redeem_reward(text, uuid)        to service_role;