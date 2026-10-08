-- Vaporix loyalty system: core schema.
--
-- Security model: every table has RLS enabled and ZERO policies. With RLS on
-- and no policy present, the anon and authenticated roles can read and write
-- nothing at all. Only the service-role key, which bypasses RLS and never
-- leaves the server, can touch these tables. The browser never speaks to
-- PostgREST directly.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------- customers

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) between 2 and 80),
  -- E.164, enforced here so a malformed number can never reach the table even
  -- if application-level normalization is bypassed. Unique because a second
  -- registration on the same number would otherwise mint a fresh 0/3 card.
  phone_e164 text not null unique check (phone_e164 ~ '^\+[1-9][0-9]{7,14}$'),
  email text check (email is null or email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger customers_set_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

-- -------------------------------------------------------- reward_definitions

-- What the reward actually is, kept in data so changing it needs no deploy.
create table public.reward_definitions (
  id uuid primary key default gen_random_uuid(),
  label_es text not null,
  label_en text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Exactly one reward is current at a time; older ones stay for the rewards
-- that were granted under them.
create unique index reward_definitions_one_active
  on public.reward_definitions (active) where active;

-- ------------------------------------------------------------ loyalty_cards

create table public.loyalty_cards (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null unique references public.customers (id) on delete cascade,
  -- Opaque bearer token. Carries no count, no reward state, no personal data.
  qr_token text not null unique check (qr_token ~ '^VPR_[A-Za-z0-9_-]{22,}$'),
  visits integer not null default 0 check (visits between 0 and 3),
  reward_available boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- A reward can only be outstanding at a full cycle. Makes the "reached 3/3"
  -- and "reward pending" states impossible to desynchronize.
  constraint loyalty_cards_reward_only_at_three
    check (not reward_available or visits = 3)
);

create trigger loyalty_cards_set_updated_at
  before update on public.loyalty_cards
  for each row execute function public.set_updated_at();

-- -------------------------------------------------------------------- staff

create table public.staff (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  -- scrypt digest, never the PIN itself.
  pin_hash text not null,
  role text not null default 'staff' check (role in ('staff', 'admin')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------------- visits

create table public.visits (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  loyalty_card_id uuid not null references public.loyalty_cards (id) on delete cascade,
  -- No cascade: deleting a staff row must not erase who served whom.
  staff_id uuid not null references public.staff (id),
  -- Which step of the cycle this visit was, so history stays readable after
  -- the card resets to 0.
  visit_number smallint not null check (visit_number between 1 and 3),
  device text,
  created_at timestamptz not null default now()
);

-- Serves the duplicate-scan cooldown lookup: most recent visit for a card.
create index visits_card_created_idx
  on public.visits (loyalty_card_id, created_at desc);

-- ------------------------------------------------------------------ rewards

create table public.rewards (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  loyalty_card_id uuid not null references public.loyalty_cards (id) on delete cascade,
  reward_definition_id uuid not null references public.reward_definitions (id),
  status text not null default 'available'
    check (status in ('available', 'redeemed', 'void')),
  created_at timestamptz not null default now(),
  redeemed_at timestamptz,
  redeemed_by_staff_id uuid references public.staff (id),
  -- Redemption details and redeemed status travel together or not at all.
  constraint rewards_redemption_fields_match check (
    (status = 'redeemed')
    = (redeemed_at is not null and redeemed_by_staff_id is not null)
  )
);

-- One outstanding reward per card, ever. A double-grant is now a database
-- error rather than a bug someone notices months later.
create unique index rewards_one_open_per_card
  on public.rewards (loyalty_card_id) where status = 'available';

create index rewards_card_created_idx
  on public.rewards (loyalty_card_id, created_at desc);

-- ----------------------------------------------------------- loyalty_config

-- Single-row table. The `id boolean primary key check (id)` trick makes a
-- second row impossible, so "the config" is always unambiguous.
create table public.loyalty_config (
  id boolean primary key default true check (id),
  -- Duplicate-scan window: a second scan of the same card inside this many
  -- seconds is refused as an accidental re-tap.
  cooldown_seconds integer not null default 120
    check (cooldown_seconds between 0 and 86400),
  updated_at timestamptz not null default now()
);

create trigger loyalty_config_set_updated_at
  before update on public.loyalty_config
  for each row execute function public.set_updated_at();

insert into public.loyalty_config (id) values (true);

-- ---------------------------------------------------------------------- RLS

alter table public.customers          enable row level security;
alter table public.reward_definitions enable row level security;
alter table public.loyalty_cards      enable row level security;
alter table public.staff              enable row level security;
alter table public.visits             enable row level security;
alter table public.rewards            enable row level security;
alter table public.loyalty_config     enable row level security;