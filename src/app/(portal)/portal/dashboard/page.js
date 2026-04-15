import { getCustomerPortalSession } from '@/lib/portal-session';
import { createClient } from '@/lib/supabase/server';
import { CustomerDashboard } from '@/components/portal/pages/CustomerDashboard';

export const metadata = { title: 'Dashboard' };

export default async function CustomerDashboardPage({ searchParams }) {
  const sp = (await searchParams) || {};
  const showWelcome = sp.welcome === '1';

  const { customer, recentActivity } = await getCustomerPortalSession();

  const supabase = await createClient();
  const customerId = customer?.id;

  const [lastEntryRes, nextRequestRes] = await Promise.all([
    supabase
      .from('recycling_entries')
      .select('entry_date, material, weight_lbs')
      .eq('customer_id', customerId)
      .order('entry_date', { ascending: false })
      .limit(1)
      .maybeSingle(),

    supabase
      .from('pickup_requests')
      .select('id, material, estimated_weight, preferred_date, time_window, status')
      .eq('customer_id', customerId)
      .in('status', ['under_review', 'scheduled'])
      .order('preferred_date', { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  const lastEntry = lastEntryRes.data
    ? {
        date: lastEntryRes.data.entry_date,
        material: lastEntryRes.data.material,
        weight: lastEntryRes.data.weight_lbs,
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
      customer={customer}
      lastEntry={lastEntry}
      nextRequest={nextRequest}
      activity={recentActivity}
      showWelcome={showWelcome}
    />
  );
}
