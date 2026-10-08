-- Registration, atomically.
--
-- A customer and their card must appear together or not at all; doing the two
-- inserts from application code can leave a customer with no card if the
-- second one fails. Re-registering an existing phone returns that customer's
-- existing card rather than minting a second one — otherwise anybody could
-- farm fresh 0/3 cards forever.
create or replace function public.register_customer(
  p_name       text,
  p_phone_e164 text,
  p_email      text,
  p_qr_token   text
)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v_customer_id uuid;
  v_card_id     uuid;
begin
  select id into v_customer_id
    from public.customers
   where phone_e164 = p_phone_e164;

  if not found then
    begin
      insert into public.customers (name, phone_e164, email)
      values (
        btrim(p_name),
        p_phone_e164,
        nullif(btrim(coalesce(p_email, '')), '')
      )
      returning id into v_customer_id;
    exception
      when unique_violation then
        -- Two registrations of the same number landed at once; the other one
        -- won. Fall through and hand back the card it created.
        select id into v_customer_id
          from public.customers
         where phone_e164 = p_phone_e164;
    end;
  end if;

  select id into v_card_id
    from public.loyalty_cards
   where customer_id = v_customer_id;

  if found then
    return jsonb_build_object(
      'code',  'EXISTING',
      'state', public.card_state_json(v_card_id)
    );
  end if;

  insert into public.loyalty_cards (customer_id, qr_token)
  values (v_customer_id, p_qr_token)
  returning id into v_card_id;

  return jsonb_build_object(
    'code',  'CREATED',
    'state', public.card_state_json(v_card_id)
  );
exception
  when check_violation then
    -- Name, phone or email failed a table constraint. The caller validates
    -- first, so this is the belt to that braces.
    return jsonb_build_object('code', 'INVALID');
end;
$$;

revoke all on function public.register_customer(text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.register_customer(text, text, text, text)
  to service_role;