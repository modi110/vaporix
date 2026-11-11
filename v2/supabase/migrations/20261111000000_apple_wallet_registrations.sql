-- Apple Wallet: which iPhones hold which pass.
--
-- When a card changes (visit, reward, redemption) the server must tell every
-- phone that saved the pass to fetch the new version. Apple's protocol has each
-- phone register itself with a push token; this table remembers them.
--
-- The serial number of a pass is the card number (loyalty_cards.card_number).
-- No foreign key on purpose: registration arrives from a phone, and a card that
-- was deleted must not make Apple's retry loop fail on a constraint.
--
-- Same security model as every loyalty table: RLS on, zero policies, only the
-- service-role key can touch it.

create table public.apple_pass_registrations (
  device_library_identifier text not null,
  pass_type_identifier text not null,
  serial_number text not null check (serial_number ~ '^[0-9]{7}$'),
  push_token text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (device_library_identifier, pass_type_identifier, serial_number)
);

-- "Which phones hold card X" is the lookup every push does.
create index apple_pass_registrations_serial_idx
  on public.apple_pass_registrations (pass_type_identifier, serial_number);

alter table public.apple_pass_registrations enable row level security;
