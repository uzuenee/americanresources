import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/dal';
import { AdminDashboard } from '@/components/portal/pages/AdminDashboard';

export const metadata = { title: 'Dispatch' };

export default async function AdminDashboardPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [requestsRes, statsRes] = await Promise.all([
    supabase
      .from('pickup_requests')
      .select('id, customer_id, customers(company), material, estimated_weight, preferred_date, time_window, scheduled_date, scheduled_window, status, submitted_at')
      .order('submitted_at', { ascending: false }),

    supabase.rpc('admin_dashboard_stats'),
  ]);

  const requests = (requestsRes.data ?? []).map((row) => ({
    id: row.id,
    customerId: row.customer_id,
    customerCompany: row.customers?.company ?? null,
    material: row.material,
    estimatedWeight: row.estimated_weight,
    preferredDate: row.preferred_date,
    timeWindow: row.time_window,
    scheduledDate: row.scheduled_date,
    scheduledWindow: row.scheduled_window,
    status: row.status,
    submittedAt: row.submitted_at,
  }));

  const statsRow = statsRes.data?.[0] ?? {};
  const stats = {
    activeAccounts: Number(statsRow.active_account_count ?? 0),
    ytdWeight: Number(statsRow.ytd_weight_diverted ?? 0),
    lastLoadAt: statsRow.last_load_at ?? null,
  };

  return <AdminDashboard requests={requests} stats={stats} />;
}
