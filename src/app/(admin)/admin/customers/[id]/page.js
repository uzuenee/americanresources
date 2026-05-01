import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/dal';
import { AdminCustomerDetail } from '@/components/portal/pages/AdminCustomerDetail';

export const metadata = { title: 'Account' };

export default async function AdminCustomerDetailPage({ params, searchParams }) {
  await requireAdmin();

  const { id } = await params;
  const sp = await searchParams;
  const initialTab = sp?.tab || 'overview';

  const supabase = await createClient();

  const [customerRes, entriesRes, requestsRes] = await Promise.all([
    supabase
      .from('customer_summaries')
      .select('*')
      .eq('id', id)
      .maybeSingle(),

    supabase
      .from('recycling_entries')
      .select('id, entry_date, material, weight_lbs, notes')
      .eq('customer_id', id)
      .order('entry_date', { ascending: false }),

    supabase
      .from('pickup_requests')
      .select('id, material, estimated_weight, preferred_date, time_window, scheduled_date, scheduled_window, status, submitted_at, access_instructions')
      .eq('customer_id', id)
      .order('submitted_at', { ascending: false }),
  ]);

  if (!customerRes.data) notFound();

  const row = customerRes.data;

  // Derive a display location from the pickup address fields when the
  // legacy location column is empty.
  const derivedLocation =
    row.location ||
    [row.pickup_city, row.pickup_state].filter(Boolean).join(', ') ||
    null;

  const customer = {
    id: row.id,
    company: row.company,
    status: row.status,
    since: row.since,
    location: derivedLocation,
    reportingCadence: row.reporting_cadence,
    materials: row.materials ?? [],
    totalWeight: Number(row.total_weight ?? 0),
    totalPickups: Number(row.total_pickups ?? 0),
    openRequests: Number(row.open_requests ?? 0),
    contact: {
      name: row.contact_name,
      title: row.contact_title,
      email: row.contact_email,
      phone: row.contact_phone,
    },
  };

  const entries = (entriesRes.data ?? []).map((e) => ({
    id: e.id,
    date: e.entry_date,
    material: e.material,
    weight: e.weight_lbs,
    notes: e.notes,
  }));

  const requests = (requestsRes.data ?? []).map((r) => ({
    id: r.id,
    material: r.material,
    estimatedWeight: r.estimated_weight,
    preferredDate: r.preferred_date,
    timeWindow: r.time_window,
    scheduledDate: r.scheduled_date,
    scheduledWindow: r.scheduled_window,
    status: r.status,
    submittedAt: r.submitted_at,
    accessInstructions: r.access_instructions,
  }));

  return (
    <AdminCustomerDetail
      customer={customer}
      entries={entries}
      requests={requests}
      initialTab={initialTab}
    />
  );
}
