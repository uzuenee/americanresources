import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/dal';
import { AdminReporting } from '@/components/portal/pages/AdminReporting';

export const metadata = { title: 'Reporting' };

export default async function AdminReportingPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [entriesRes, customersRes] = await Promise.all([
    supabase
      .from('recycling_entries')
      .select('id, entry_date, material, weight_lbs, notes, customer_id, customers(company)')
      .order('entry_date', { ascending: false }),

    supabase
      .from('customers')
      .select('id, company')
      .order('company', { ascending: true }),
  ]);

  const entries = (entriesRes.data ?? []).map((e) => ({
    id: e.id,
    date: e.entry_date,
    material: e.material,
    weight: e.weight_lbs,
    notes: e.notes,
    customerId: e.customer_id,
    customerCompany: e.customers?.company ?? null,
  }));

  const customers = (customersRes.data ?? []).map((c) => ({
    id: c.id,
    company: c.company,
  }));

  return <AdminReporting entries={entries} customers={customers} />;
}
