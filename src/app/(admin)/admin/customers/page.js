import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/dal';
import { AdminCustomerList } from '@/components/portal/pages/AdminCustomerList';

export const metadata = { title: 'Accounts' };

export default async function AdminCustomersPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data } = await supabase
    .from('customer_summaries')
    .select('*')
    .order('company', { ascending: true });

  const customers = (data ?? []).map((row) => ({
    id: row.id,
    company: row.company,
    status: row.status,
    location:
      row.location ||
      [row.pickup_city, row.pickup_state].filter(Boolean).join(', ') ||
      null,
    materials: row.materials ?? [],
    totalWeight: Number(row.total_weight ?? 0),
    totalPickups: Number(row.total_pickups ?? 0),
    openRequests: Number(row.open_requests ?? 0),
    contact: {
      name: row.contact_name,
      title: row.contact_title,
    },
  }));

  return <AdminCustomerList customers={customers} />;
}
