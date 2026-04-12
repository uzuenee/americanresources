-- ============================================================================
-- 0001_schema.sql
-- Tables, enums, and indexes for the American Resources customer portal.
-- Column names match the shape of src/data/portalMockData.js so the UI layer
-- needs minimal mapping.
-- ============================================================================

-- Enums ---------------------------------------------------------------------

create type public.user_role as enum ('customer', 'admin');

create type public.material as enum (
  'metal',
  'paper',
  'electronics',
  'plastic',
  'pallets',
  'mixed'
);

create type public.customer_status as enum ('active', 'pilot');

create type public.reporting_cadence as enum ('Monthly', 'Quarterly');

create type public.request_status as enum (
  'under_review',
  'scheduled',
  'completed',
  'cancelled'
);

create type public.entry_status as enum ('completed');

create type public.time_window as enum (
  'morning',
  'afternoon',
  'no_preference'
);

create type public.activity_type as enum (
  'pickup_logged',
  'request_submitted',
  'request_scheduled'
);

-- Tables --------------------------------------------------------------------

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  status public.customer_status not null default 'active',
  since date not null default current_date,
  location text,
  reporting_cadence public.reporting_cadence not null default 'Quarterly',
  contact_name text,
  contact_title text,
  contact_email text,
  contact_phone text,
  materials public.material[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'customer',
  customer_id uuid references public.customers(id) on delete set null,
  full_name text,
  phone text,
  title text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- customers must have a linked customer_id; admins must not.
  constraint profiles_role_customer_consistency check (
    (role = 'customer' and customer_id is not null)
    or (role = 'admin' and customer_id is null)
  )
);

create table public.recycling_entries (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  entry_date date not null,
  material public.material not null,
  weight_lbs numeric(12, 2) not null check (weight_lbs >= 0),
  notes text,
  status public.entry_status not null default 'completed',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index recycling_entries_customer_date_idx
  on public.recycling_entries (customer_id, entry_date desc);

create table public.pickup_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  material public.material not null,
  estimated_weight numeric(12, 2) check (estimated_weight >= 0),
  preferred_date date not null,
  time_window public.time_window not null default 'no_preference',
  scheduled_date date,
  scheduled_window public.time_window,
  contact_name text,
  contact_phone text,
  access_instructions text,
  mixed_details text,
  status public.request_status not null default 'under_review',
  notes text,
  submitted_at timestamptz not null default now(),
  submitted_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  -- if status is 'scheduled', scheduled_date/window must be set
  constraint pickup_requests_scheduled_consistency check (
    status <> 'scheduled'
    or (scheduled_date is not null and scheduled_window is not null)
  )
);

create index pickup_requests_customer_status_idx
  on public.pickup_requests (customer_id, status, preferred_date desc);

create index pickup_requests_dispatch_idx
  on public.pickup_requests (status, preferred_date);

create table public.activity_feed (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  type public.activity_type not null,
  description text not null,
  actor uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index activity_feed_customer_created_idx
  on public.activity_feed (customer_id, created_at desc);

-- Views ---------------------------------------------------------------------

-- customer_summaries: rollup of totals used by the admin customers list and
-- the customer dashboard. Joining a view is cheaper than two round trips.
create view public.customer_summaries as
select
  c.id,
  c.company,
  c.status,
  c.since,
  c.location,
  c.reporting_cadence,
  c.contact_name,
  c.contact_title,
  c.contact_email,
  c.contact_phone,
  c.materials,
  coalesce(e.total_weight, 0) as total_weight,
  coalesce(e.total_pickups, 0) as total_pickups,
  coalesce(r.open_requests, 0) as open_requests,
  e.last_pickup_date
from public.customers c
left join (
  select
    customer_id,
    sum(weight_lbs) as total_weight,
    count(*) as total_pickups,
    max(entry_date) as last_pickup_date
  from public.recycling_entries
  group by customer_id
) e on e.customer_id = c.id
left join (
  select
    customer_id,
    count(*) filter (where status in ('under_review', 'scheduled')) as open_requests
  from public.pickup_requests
  group by customer_id
) r on r.customer_id = c.id;

-- admin_dashboard_stats(): one call returns all top-of-page KPIs. Wrapping in
-- a security-invoker function keeps RLS honest.
create function public.admin_dashboard_stats()
returns table (
  open_dispatch_count bigint,
  active_account_count bigint,
  ytd_weight_diverted numeric,
  last_load_at timestamptz
)
language sql
stable
security invoker
as $$
  select
    (select count(*) from public.pickup_requests
      where status in ('under_review', 'scheduled')),
    (select count(*) from public.customers where status = 'active'),
    (select coalesce(sum(weight_lbs), 0) from public.recycling_entries
      where entry_date >= date_trunc('year', current_date)),
    (select max(created_at) from public.recycling_entries)
$$;

-- updated_at touch triggers -------------------------------------------------

create function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger customers_touch_updated_at
  before update on public.customers
  for each row execute function public.touch_updated_at();

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

create trigger pickup_requests_touch_updated_at
  before update on public.pickup_requests
  for each row execute function public.touch_updated_at();
