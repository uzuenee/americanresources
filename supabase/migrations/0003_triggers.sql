-- ============================================================================
-- 0003_triggers.sql
-- Triggers that keep auth.users, profiles, and activity_feed in sync.
-- ============================================================================

-- handle_new_user ----------------------------------------------------------
-- Runs after a row lands in auth.users (via supabase.auth.signUp). Reads the
-- company / full_name / phone / title the client sent in raw_user_meta_data,
-- creates a matching customers row, then a profiles row linking the two.
--
-- SECURITY DEFINER so it can insert into public.* even though the inserting
-- identity is the postgres auth role.

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company text;
  v_full_name text;
  v_phone text;
  v_title text;
  v_customer_id uuid;
  v_role public.user_role;
begin
  v_role := coalesce(
    (new.raw_user_meta_data ->> 'role')::public.user_role,
    'customer'
  );

  v_full_name := new.raw_user_meta_data ->> 'full_name';
  v_phone := new.raw_user_meta_data ->> 'phone';
  v_title := new.raw_user_meta_data ->> 'title';

  if v_role = 'customer' then
    v_company := coalesce(
      new.raw_user_meta_data ->> 'company',
      'Untitled account'
    );

    insert into public.customers (company, contact_name, contact_email, contact_phone)
    values (v_company, v_full_name, new.email, v_phone)
    returning id into v_customer_id;
  end if;

  insert into public.profiles (id, role, customer_id, full_name, phone, title)
  values (new.id, v_role, v_customer_id, v_full_name, v_phone, v_title);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- sync_user_claims ---------------------------------------------------------
-- When a profile is inserted or its role/customer_id changes, copy those
-- values into auth.users.raw_app_meta_data so they land in the JWT on next
-- token refresh. Policies can then read them via auth.jwt() without joining.

create function public.sync_user_claims()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update auth.users
  set raw_app_meta_data =
    coalesce(raw_app_meta_data, '{}'::jsonb)
    || jsonb_build_object(
      'role', new.role::text,
      'customer_id', new.customer_id
    )
  where id = new.id;
  return new;
end;
$$;

create trigger profiles_sync_user_claims
  after insert or update of role, customer_id on public.profiles
  for each row execute function public.sync_user_claims();

-- pickup_requests: force customer_id to the caller's own on insert ---------
-- Customers can submit requests for themselves only. We overwrite whatever
-- they sent in the payload — cheap defense in depth on top of the RLS policy.

create function public.pickup_requests_set_customer()
returns trigger
language plpgsql
security invoker
as $$
begin
  if public.is_admin() then
    -- Admin created: trust whatever customer_id was passed.
    return new;
  end if;

  new.customer_id := public.current_customer_id();
  new.submitted_by := auth.uid();

  if new.customer_id is null then
    raise exception 'Cannot create pickup request: no customer scope';
  end if;

  return new;
end;
$$;

create trigger pickup_requests_before_insert
  before insert on public.pickup_requests
  for each row execute function public.pickup_requests_set_customer();

-- Activity feed writers ----------------------------------------------------
-- Internal triggers (security definer) are the only way rows land in
-- activity_feed — the RLS policy blocks direct inserts from API clients.

create function public.activity_log_entry()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_company text;
begin
  select company into v_customer_company
  from public.customers where id = new.customer_id;

  insert into public.activity_feed (customer_id, type, description, actor)
  values (
    new.customer_id,
    'pickup_logged',
    format(
      '%s lbs of %s logged for %s',
      new.weight_lbs,
      new.material,
      coalesce(v_customer_company, 'customer')
    ),
    new.created_by
  );

  return new;
end;
$$;

create trigger recycling_entries_activity
  after insert on public.recycling_entries
  for each row execute function public.activity_log_entry();

create function public.activity_log_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_company text;
begin
  select company into v_customer_company
  from public.customers where id = new.customer_id;

  if tg_op = 'INSERT' then
    insert into public.activity_feed (customer_id, type, description, actor)
    values (
      new.customer_id,
      'request_submitted',
      format(
        'Pickup request submitted (%s, %s lbs est.)',
        new.material,
        coalesce(new.estimated_weight::text, 'TBD')
      ),
      new.submitted_by
    );
  elsif tg_op = 'UPDATE'
      and new.status = 'scheduled'
      and (old.status is distinct from new.status) then
    insert into public.activity_feed (customer_id, type, description, actor)
    values (
      new.customer_id,
      'request_scheduled',
      format(
        'Pickup scheduled for %s (%s)',
        to_char(new.scheduled_date, 'Mon DD'),
        new.scheduled_window
      ),
      auth.uid()
    );
  end if;

  return new;
end;
$$;

create trigger pickup_requests_activity_insert
  after insert on public.pickup_requests
  for each row execute function public.activity_log_request();

create trigger pickup_requests_activity_update
  after update on public.pickup_requests
  for each row execute function public.activity_log_request();
