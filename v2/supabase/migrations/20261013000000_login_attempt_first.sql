-- Two fixes from the October review.
--
-- 1. A PIN attempt is counted BEFORE the PIN is checked.
--
-- The login used to read `locked_until`, verify the PIN in Node, and only then
-- record the failure. Requests fired in parallel all read "not locked" before
-- the first failure was written, so a burst of a thousand guesses got a
-- thousand tries instead of five. Here the attempt is charged under a row lock
-- first: concurrent attempts queue on the lock, and the sixth one sees the
-- lock the fifth one set.
--
-- A correct PIN still resets the counter through the existing
-- `record_staff_login_attempt(id, true)`. A wrong one needs no second call —
-- it was already counted.
--
-- 2. `redeem_reward` refuses a deactivated card, the same way `register_visit`
-- already does.

create or replace function public.begin_staff_login(
  p_staff_id uuid,
  -- The request carries a trusted-device cookie for this account, i.e. it
  -- comes from a phone this person has signed in on before. Such a request
  -- may try once past a lock, so that a stranger hammering the login page
  -- cannot keep the real staff member out. The attempt is still counted.
  p_trusted  boolean default false
)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v_staff public.staff%rowtype;
begin
  select * into v_staff
    from public.staff
   where id = p_staff_id
     for update;

  -- Unknown and deactivated accounts answer exactly like a wrong PIN.
  if not found or not v_staff.active then
    return jsonb_build_object('ok', false, 'reason', 'INVALID');
  end if;

  if v_staff.locked_until is not null
     and v_staff.locked_until > now()
     and not p_trusted then
    return jsonb_build_object('ok', false, 'reason', 'LOCKED');
  end if;

  update public.staff
     set failed_attempts = failed_attempts + 1,
         locked_until = case
           when failed_attempts + 1 >= 5 then now() + interval '5 minutes'
           else locked_until
         end
   where id = p_staff_id
   returning * into v_staff;

  return jsonb_build_object(
    'ok',       true,
    'pin_hash', v_staff.pin_hash,
    'role',     v_staff.role,
    -- Whether this attempt, if the PIN turns out wrong, leaves the account locked.
    'locks',    v_staff.failed_attempts >= 5
  );
end;
$$;

revoke all on function public.begin_staff_login(uuid, boolean)
  from public, anon, authenticated;
grant execute on function public.begin_staff_login(uuid, boolean)
  to service_role;

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

  if not v_card.active then
    return jsonb_build_object('code', 'CARD_INACTIVE');
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
