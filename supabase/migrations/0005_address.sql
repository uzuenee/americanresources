-- ============================================================================
-- 0005_address.sql
-- Add structured pickup-address columns to customers.
-- ============================================================================

alter table public.customers
  add column pickup_address  text,
  add column pickup_address2 text,
  add column pickup_city     text,
  add column pickup_state    text,
  add column pickup_zip      text;
