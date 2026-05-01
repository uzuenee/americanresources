-- ============================================================================
-- 0014_pending_approval.sql
-- Adds 'pending' to customer_status enum and updates handle_new_user() so
-- new signups land in pending state until an admin approves them.
-- ============================================================================

ALTER TYPE public.customer_status ADD VALUE IF NOT EXISTS 'pending';

-- Replace handle_new_user to set status = 'pending' for customer signups.
create or replace function public.handle_new_user()
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
  v_address text;
  v_address2 text;
  v_city text;
  v_state text;
  v_zip text;
begin
  v_role := coalesce(
    (new.raw_user_meta_data ->> 'role')::public.user_role,
    'customer'
  );

  v_full_name := new.raw_user_meta_data ->> 'full_name';
  v_phone := new.raw_user_meta_data ->> 'phone';
  v_title := new.raw_user_meta_data ->> 'title';
  v_address  := new.raw_user_meta_data ->> 'pickup_address';
  v_address2 := new.raw_user_meta_data ->> 'pickup_address2';
  v_city     := new.raw_user_meta_data ->> 'pickup_city';
  v_state    := new.raw_user_meta_data ->> 'pickup_state';
  v_zip      := new.raw_user_meta_data ->> 'pickup_zip';

  if v_role = 'customer' then
    v_company := coalesce(
      new.raw_user_meta_data ->> 'company',
      'Untitled account'
    );

    insert into public.customers (
      company, status, contact_name, contact_email, contact_phone,
      pickup_address, pickup_address2, pickup_city, pickup_state, pickup_zip
    )
    values (
      v_company, 'pending', v_full_name, new.email, v_phone,
      v_address, v_address2, v_city, v_state, v_zip
    )
    returning id into v_customer_id;
  end if;

  insert into public.profiles (id, role, customer_id, full_name, phone, title)
  values (new.id, v_role, v_customer_id, v_full_name, v_phone, v_title);

  return new;
end;
$$;
