import 'server-only';

import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { requireCustomer, requireAdmin } from '@/lib/dal';

// Shapes the data that the portal/admin layout Server Components pass down
// into the PortalAuthProvider. Keeps the layouts thin and makes the shape
// explicit in one place.

function toUserPayload(authUser, profile) {
  return {
    id: profile.id,
    name: profile.full_name || authUser.email?.split('@')[0] || 'Account',
    email: authUser.email,
    role: profile.role,
    customerId: profile.customer_id,
    title: profile.title,
    avatar: profile.avatar_url,
  };
}

async function loadRecentActivity(supabase, { scope }) {
  // scope: 'all' for admins, a customer id for customers.
  let query = supabase
    .from('activity_feed')
    .select('id, type, description, created_at, customer_id, customers(company)')
    .order('created_at', { ascending: false })
    .limit(5);

  if (scope !== 'all') {
    query = query.eq('customer_id', scope);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    type: row.type,
    description: row.description,
    timestamp: row.created_at,
    customerId: row.customer_id,
    customerCompany: row.customers?.company ?? null,
  }));
}

export const getCustomerPortalSession = cache(_getCustomerPortalSession);
export const getAdminPortalSession = cache(_getAdminPortalSession);

async function _getCustomerPortalSession() {
  const { user: authUser, profile } = await requireCustomer();
  const supabase = await createClient();

  const [{ data: customer }, recentActivity] = await Promise.all([
    supabase
      .from('customer_summaries')
      .select('*')
      .eq('id', profile.customer_id)
      .single(),
    loadRecentActivity(supabase, { scope: profile.customer_id }),
  ]);

  return {
    user: toUserPayload(authUser, profile),
    customer: customer
      ? {
          id: customer.id,
          company: customer.company,
          status: customer.status,
          since: customer.since,
          location: customer.location,
          reportingCadence: customer.reporting_cadence,
          materials: customer.materials ?? [],
          totalWeight: Number(customer.total_weight ?? 0),
          totalPickups: Number(customer.total_pickups ?? 0),
          openRequests: Number(customer.open_requests ?? 0),
          lastPickupDate: customer.last_pickup_date,
          contact: {
            name: customer.contact_name,
            title: customer.contact_title,
            email: customer.contact_email,
            phone: customer.contact_phone,
          },
        }
      : null,
    recentActivity,
  };
}

async function _getAdminPortalSession() {
  const { user: authUser, profile } = await requireAdmin();
  const supabase = await createClient();

  const recentActivity = await loadRecentActivity(supabase, { scope: 'all' });

  return {
    user: toUserPayload(authUser, profile),
    customer: null,
    recentActivity,
  };
}
