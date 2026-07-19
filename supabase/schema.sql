-- FRESHyo schema. Paste into the Supabase dashboard SQL editor.
-- Admin bulk import (canonical items, store lists) = Supabase dashboard CSV
-- import, or a service-role script inserting ordinary rows into these same
-- tables with reported_by left null. No admin code lives in the app.

-- ============================================================= profiles ===
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text
);

alter table profiles enable row level security;

create policy "profiles select all" on profiles
  for select using (true);

create policy "profiles insert own" on profiles
  for insert to authenticated with check (id = auth.uid());

create policy "profiles update own" on profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id) values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ================================================================ stores ==
create table if not exists stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  lat double precision not null,
  lng double precision not null,
  address text,
  photo_url text,
  store_type text not null default 'grocery',
  created_at timestamptz not null default now()
);

alter table stores enable row level security;

create policy "stores select all" on stores
  for select using (true);

create policy "stores insert authenticated" on stores
  for insert to authenticated with check (true);

-- ================================================================= items ==
create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_hil text,
  brand text,
  size_label text,
  category text not null,
  unit text not null,
  image_url text,
  created_at timestamptz default now()
);

alter table items enable row level security;

create policy "items select all" on items
  for select using (true);
-- No insert policy: the item catalog is canonical, admin-only via dashboard/service role.

-- ========================================================= price_reports ==
create table if not exists price_reports (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references items on delete cascade,
  store_id uuid not null references stores on delete cascade,
  price numeric(10,2) not null check (price > 0),
  unit text not null,
  note text,
  reported_by uuid references profiles on delete set null,
  created_at timestamptz not null default now()
);

alter table price_reports enable row level security;

create policy "price_reports select all" on price_reports
  for select using (true);

create policy "price_reports insert authenticated" on price_reports
  for insert to authenticated with check (reported_by = auth.uid());

create index if not exists price_reports_item_created_idx
  on price_reports (item_id, created_at desc);
create index if not exists price_reports_store_idx
  on price_reports (store_id);

-- ================================================================ ratings ==
create table if not exists ratings (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores on delete cascade,
  user_id uuid not null references profiles on delete cascade,
  ambience smallint not null check (ambience between 1 and 5),
  accessibility smallint not null check (accessibility between 1 and 5),
  ease_of_access smallint not null check (ease_of_access between 1 and 5),
  cleanliness smallint not null check (cleanliness between 1 and 5),
  location smallint not null check (location between 1 and 5),
  created_at timestamptz not null default now(),
  unique (store_id, user_id)
);

alter table ratings enable row level security;

create policy "ratings select all" on ratings
  for select using (true);

create policy "ratings insert own" on ratings
  for insert to authenticated with check (user_id = auth.uid());

create policy "ratings update own" on ratings
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create index if not exists ratings_store_idx on ratings (store_id);
