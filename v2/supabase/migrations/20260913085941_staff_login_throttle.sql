-- Brute-force protection for staff PINs.
--
-- Counters live in the database rather than in process memory because Vercel
-- runs many short-lived instances: an in-memory counter would reset constantly
-- and throttle nothing.
alter table public.staff
  add column failed_attempts integer not null default 0,
  add column locked_until timestamptz;

-- Records the outcome of a PIN check and returns whether the account is now
-- locked. A short lock after five wrong PINs makes guessing a 6-digit code
-- impractical without locking anyone out for a whole shift.
create or replace function public.record_staff_login_attempt(
  p_staff_id uuid,
  p_success  boolean
)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v_attempts integer;
  v_locked   timestamptz;
begin
  if p_success then
    update public.staff
       set failed_attempts = 0,
           locked_until    = null
     where id = p_staff_id;
    return jsonb_build_object('locked', false);
  end if;

  update public.staff
     set failed_attempts = failed_attempts + 1,
         locked_until = case
           when failed_attempts + 1 >= 5 then now() + interval '5 minutes'
           else locked_until
         end
   where id = p_staff_id
   returning failed_attempts, locked_until into v_attempts, v_locked;

  return jsonb_build_object(
    'locked',        v_locked is not null and v_locked > now(),
    'locked_until',  v_locked,
    'attempts',      v_attempts
  );
end;
$$;

revoke all on function public.record_staff_login_attempt(uuid, boolean)
  from public, anon, authenticated;
grant execute on function public.record_staff_login_attempt(uuid, boolean)
  to service_role;