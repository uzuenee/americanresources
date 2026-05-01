import { getCustomerPortalSession } from '@/lib/portal-session';
import { createAdminClient } from '@/lib/supabase/admin';
import { CustomerHistory } from '@/components/portal/pages/CustomerHistory';

export const metadata = { title: 'Load history' };

export default async function CustomerHistoryPage() {
  const { user } = await getCustomerPortalSession();

  const supabase = createAdminClient();
  const { data } = await supabase
    .from('recycling_entries')
    .select('id, entry_date, material, weight_lbs, notes, status')
    .eq('customer_id', user.customerId)
    .order('entry_date', { ascending: false });

  const entries = (data ?? []).map((row) => ({
    id: row.id,
    date: row.entry_date,
    material: row.material,
    weight: row.weight_lbs,
    notes: row.notes,
    status: row.status,
  }));

  return <CustomerHistory entries={entries} />;
}
