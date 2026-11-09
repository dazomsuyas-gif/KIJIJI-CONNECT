-- Review-only price comparison schema. Inspect the target project's schema and
-- RLS policies before applying; this file has not been run against a database.

create table if not exists public.markets (
  id text primary key,
  name text not null,
  area text not null,
  market_type text not null check (market_type in ('market', 'supermarket', 'wholesaler')),
  created_at timestamptz not null default now()
);

create table if not exists public.products_reference (
  id text primary key,
  name text not null,
  category text not null,
  unit text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.price_reports (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products_reference(id),
  market_id text not null references public.markets(id),
  unit text not null,
  price_tzs bigint not null check (price_tzs > 0),
  date_observed date not null,
  source text not null check (source in ('buyer report', 'seller report')),
  note text check (note is null or char_length(note) <= 500),
  submitted_by uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.price_alerts (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products_reference(id),
  target_price_tzs bigint not null check (target_price_tzs > 0),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists price_reports_approved_lookup
  on public.price_reports (product_id, market_id, date_observed)
  where status = 'approved';
create index if not exists price_reports_owner_lookup
  on public.price_reports (submitted_by, created_at desc);
create index if not exists price_alerts_owner_lookup
  on public.price_alerts (created_by, product_id);

alter table public.markets enable row level security;
alter table public.products_reference enable row level security;
alter table public.price_reports enable row level security;
alter table public.price_alerts enable row level security;

create policy "Anyone can read markets"
  on public.markets for select using (true);
create policy "Anyone can read reference products"
  on public.products_reference for select using (true);

create policy "Anyone can read approved price reports"
  on public.price_reports for select
  using (status = 'approved' or submitted_by = (select auth.uid()));
create policy "Signed-in users submit their own pending price reports"
  on public.price_reports for insert to authenticated
  with check (
    submitted_by = (select auth.uid())
    and status = 'pending'
    and reviewed_by is null
    and reviewed_at is null
  );
create policy "Moderators review price reports"
  on public.price_reports for update to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'moderator')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'moderator');

create policy "Users read their own price alerts"
  on public.price_alerts for select to authenticated
  using (created_by = (select auth.uid()));
create policy "Users create their own price alerts"
  on public.price_alerts for insert to authenticated
  with check (created_by = (select auth.uid()));
create policy "Users update their own price alerts"
  on public.price_alerts for update to authenticated
  using (created_by = (select auth.uid()))
  with check (created_by = (select auth.uid()));
create policy "Users delete their own price alerts"
  on public.price_alerts for delete to authenticated
  using (created_by = (select auth.uid()));
