-- ============================================================================
-- 0004_rls.sql
-- Row-level security policies. Every table in public is locked down by
-- default; policies below open specific slots to customers and admins.
-- Uses the current_role()/current_customer_id() helpers from 0002.
-- ============================================================================

alter table public.customers enable row level security;
alter table public.profiles enable row level security;
alter table public.recycling_entries enable row level security;
alter table public.pickup_requests enable row level security;
alter table public.activity_feed enable row level security;

-- customers ----------------------------------------------------------------

create policy "customers: customer reads own"
  on public.customers for select
  using (
    public.current_customer_id() = id
  );

create policy "customers: admin reads all"
  on public.customers for select
  using (public.is_admin());

create policy "customers: admin writes"
  on public.customers for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "customers: admin deletes"
  on public.customers for delete
  using (public.is_admin());

-- Inserts happen exclusively through the handle_new_user() trigger on
-- auth.users. No insert policy is defined so API clients cannot create
-- customer rows directly (admins create new customers via a server action
-- that goes through the service-role key path).

-- profiles -----------------------------------------------------------------

create policy "profiles: user reads own"
  on public.profiles for select
  using (id = auth.uid());

create policy "profiles: admin reads all"
  on public.profiles for select
  using (public.is_admin());

-- Users can update their own profile, but role and customer_id stay locked.
-- We guard those columns with a trigger (below) because Postgres RLS can't
-- do column-level CHECK on UPDATE by itself.
create policy "profiles: user updates own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles: admin updates any"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

create function public.profiles_guard_privileged_columns()
returns trigger
language plpgsql
as $$
begin
  if public.is_admin() then
    return new;
  end if;
  if new.role is distinct from old.role
    or new.customer_id is distinct from old.customer_id then
    raise exception 'not allowed to change role or customer_id';
  end if;
  return new;
end;
$$;

create trigger profiles_guard_privileged
  before update on public.profiles
  for each row execute function public.profiles_guard_privileged_columns();

-- recycling_entries --------------------------------------------------------

create policy "recycling_entries: customer reads own"
  on public.recycling_entries for select
  using (customer_id = public.current_customer_id());

create policy "recycling_entries: admin reads all"
  on public.recycling_entries for select
  using (public.is_admin());

create policy "recycling_entries: admin inserts"
  on public.recycling_entries for insert
  with check (public.is_admin());

create policy "recycling_entries: admin updates"
  on public.recycling_entries for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "recycling_entries: admin deletes"
  on public.recycling_entries for delete
  using (public.is_admin());

-- pickup_requests ----------------------------------------------------------

create policy "pickup_requests: customer reads own"
  on public.pickup_requests for select
  using (customer_id = public.current_customer_id());

create policy "pickup_requests: admin reads all"
  on public.pickup_requests for select
  using (public.is_admin());

-- Customers can submit requests. The BEFORE INSERT trigger forces
-- customer_id to current_customer_id() so spoofed payloads are overwritten.
create policy "pickup_requests: customer inserts"
  on public.pickup_requests for insert
  with check (
    public.current_role() = 'customer'
    and public.current_customer_id() is not null
  );

create policy "pickup_requests: admin inserts"
  on public.pickup_requests for insert
  with check (public.is_admin());

create policy "pickup_requests: admin updates"
  on public.pickup_requests for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "pickup_requests: admin deletes"
  on public.pickup_requests for delete
  using (public.is_admin());

-- activity_feed ------------------------------------------------------------
-- Read-only to API clients. Internal SECURITY DEFINER triggers are the only
-- things that write here.

create policy "activity_feed: customer reads own"
  on public.activity_feed for select
  using (customer_id = public.current_customer_id());

create policy "activity_feed: admin reads all"
  on public.activity_feed for select
  using (public.is_admin());

-- No insert / update / delete policies: deny by default.
