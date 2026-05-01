import { getCustomerPortalSession } from '@/lib/portal-session';
import { createAdminClient } from '@/lib/supabase/admin';
import { CustomerDashboard } from '@/components/portal/pages/CustomerDashboard';

export const metadata = { title: 'Dashboard' };

export default async function CustomerDashboardPage({ searchParams }) {
  const sp = (await searchParams) || {};
  const showWelcome = sp.welcome === '1';

  const session = await getCustomerPortalSession();
  const { customer, recentActivity } = session;

  const supabase = createAdminClient();
  const customerId = session.user.customerId;

  const [entriesRes, nextRequestRes] = await Promise.all([
    supabase
      .from('recycling_entries')
      .select('entry_date, material, weight_lbs')
      .eq('customer_id', customerId)
      .order('entry_date', { ascending: false }),

    supabase
      .from('pickup_requests')
      .select('id, material, estimated_weight, preferred_date, time_window, status')
      .eq('customer_id', customerId)
      .in('status', ['under_review', 'scheduled'])
      .order('preferred_date', { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  const entries = entriesRes.data ?? [];
  const totalWeight = entries.reduce(
    (sum, row) => sum + Number(row.weight_lbs || 0),
    0
  );
  const customerWithStats = customer
    ? {
        ...customer,
        totalWeight,
        totalPickups: entries.length,
      }
    : customer;

  const lastEntryRow = entries[0];
  const lastEntry = lastEntryRow
    ? {
        date: lastEntryRow.entry_date,
        material: lastEntryRow.material,
        weight: lastEntryRow.weight_lbs,
      }
    : null;

  const nextRequest = nextRequestRes.data
    ? {
        id: nextRequestRes.data.id,
        material: nextRequestRes.data.material,
        estimatedWeight: nextRequestRes.data.estimated_weight,
        preferredDate: nextRequestRes.data.preferred_date,
        timeWindow: nextRequestRes.data.time_window,
        status: nextRequestRes.data.status,
      }
    : null;

  return (
    <CustomerDashboard
      customer={customerWithStats}
      lastEntry={lastEntry}
      nextRequest={nextRequest}
      activity={recentActivity}
      showWelcome={showWelcome}
      showRequested={sp.requested === '1'}
    />
  );
}
