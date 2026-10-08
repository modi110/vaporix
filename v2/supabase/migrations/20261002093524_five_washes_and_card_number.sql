-- Five washes, the fifth free — and the target stops being hardcoded.
--
-- The first schema wrote "3" into four separate places: two check
-- constraints, the state function and the visit function. Changing the
-- programme meant editing all four in step. The number now lives in
-- loyalty_config, the functions read it, and the constraints only guard
-- against nonsense rather than pinning the business rule.

alter table public.loyalty_config
  add column visits_required smallint not null default 5
    check (visits_required between 1 and 50);

-- A ceiling, not the rule. The real target is enforced in register_visit,
-- which is the only thing that may increment a card.
alter table public.loyalty_cards
  drop constraint loyalty_cards_visits_check,
  add constraint loyalty_cards_visits_check check (visits between 0 and 50);

-- Dropped rather than rewritten: a CHECK cannot read loyalty_config, so it
-- could only ever re-pin the old number. The invariant it protected — one
-- outstanding reward per card — is already guaranteed by the partial unique
-- index on rewards, which is the stronger guard of the two.
alter table public.loyalty_cards
  drop constraint loyalty_cards_reward_only_at_three;

alter table public.visits
  drop constraint visits_visit_number_check,
  add constraint visits_visit_number_check check (visit_number between 1 and 50);

-- --------------------------------------------------------- card_number

-- A short, speakable id for the counter: staff read it off the customer's
-- phone when the camera will not focus, and it prints on the card. Random
-- rather than sequential so one number does not reveal its neighbours, and
-- never a substitute for the QR token — this is a lookup aid, not a secret.
alter table public.loyalty_cards
  add column card_number text unique
    check (card_number ~ '^[0-9]{7}$');

create or replace function public.new_card_number()
returns text
language plpgsql
set search_path = ''
as $$
declare
  v_candidate text;
begin
  for _ in 1..20 loop
    v_candidate := lpad(((random() * 8999999)::bigint + 1000000)::text, 7, '0');
    if not exists (
      select 1 from public.loyalty_cards where card_number = v_candidate
    ) then
      return v_candidate;
    end if;
  end loop;
  raise exception 'could not allocate a free card number';
end;
$$;

-- Backfill the cards that already exist.
update public.loyalty_cards
   set card_number = public.new_card_number()
 where card_number is null;

alter table public.loyalty_cards
  alter column card_number set not null,
  alter column card_number set default public.new_card_number();

-- ------------------------------------------------------------- the offer

update public.reward_definitions
   set label_es = 'Lavado GRATIS',
       label_en = 'Free wash'
 where active;

-- ----------------------------------------------------------- the functions

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
    'visits_required',  (select visits_required from public.loyalty_config where id),
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

  select cooldown_seconds, visits_required
    into v_cooldown, v_target
    from public.loyalty_config
   where id;

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

revoke all on function public.new_card_number() from public, anon, authenticated;
grant execute on function public.new_card_number() to service_role;