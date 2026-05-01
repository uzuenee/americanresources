-- ============================================================================
-- 0006_request_address.sql
-- 1. Expose pickup-address columns in customer_summaries view.
-- 2. Add per-request address columns to pickup_requests.
-- ============================================================================

-- DROP + recreate: CREATE OR REPLACE VIEW cannot add columns in the middle.
drop view if exists public.customer_summaries;
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
  c.pickup_address,
  c.pickup_address2,
  c.pickup_city,
  c.pickup_state,
  c.pickup_zip,
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

-- Per-request pickup address (defaults from customer record, optional override).
alter table public.pickup_requests
  add column pickup_address text,
  add column pickup_city    text,
  add column pickup_state   text,
  add column pickup_zip     text;
