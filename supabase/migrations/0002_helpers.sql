-- ============================================================================
-- 0002_helpers.sql
-- JWT claim helpers used by RLS policies. Reading these from the JWT keeps
-- policies fast (no subquery against profiles on every row) and readable.
-- Profiles remains the canonical store; triggers in 0003 keep the JWT in sync.
-- ============================================================================

-- Returns the caller's role from their JWT's app_metadata.
-- Null for unauthenticated requests.
create function public.current_role()
returns public.user_role
language sql
stable
security invoker
as $$
  select nullif(
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', ''),
    ''
  )::public.user_role
$$;

-- Returns the caller's customer_id from their JWT's app_metadata.
-- Null for admins and unauthenticated requests.
create function public.current_customer_id()
returns uuid
language sql
stable
security invoker
as $$
  select nullif(
    coalesce(auth.jwt() -> 'app_metadata' ->> 'customer_id', ''),
    ''
  )::uuid
$$;

-- Convenience predicate used in policies.
create function public.is_admin()
returns boolean
language sql
stable
security invoker
as $$
  select public.current_role() = 'admin'
$$;
