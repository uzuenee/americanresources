'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/dal';

// All dispatch actions require admin role. They revalidate /admin/dashboard so
// the Server Component re-fetches fresh data after the client-side optimistic
// update settles.

export async function schedulePickupAction(requestId, scheduledDate, scheduledWindow) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from('pickup_requests')
    .update({
      status: 'scheduled',
      scheduled_date: scheduledDate,
      scheduled_window: scheduledWindow,
    })
    .eq('id', requestId);

  if (error) return { error: error.message };

  revalidatePath('/admin/dashboard');
  return { ok: true };
}

export async function markLoadedAction(requestId) {
  await requireAdmin();
  const supabase = await createClient();

  // Pull just enough to create a recycling_entry.
  const { data: req, error: fetchErr } = await supabase
    .from('pickup_requests')
    .select('customer_id, material, estimated_weight')
    .eq('id', requestId)
    .single();

  if (fetchErr || !req) return { error: 'Request not found.' };

  const today = new Date().toISOString().slice(0, 10);

  const [{ error: updateErr }, { error: insertErr }] = await Promise.all([
    supabase
      .from('pickup_requests')
      .update({ status: 'completed' })
      .eq('id', requestId),
    supabase.from('recycling_entries').insert({
      customer_id: req.customer_id,
      material: req.material,
      weight_lbs: req.estimated_weight,
      entry_date: today,
    }),
  ]);

  if (updateErr || insertErr) return { error: 'Could not mark as loaded.' };

  revalidatePath('/admin/dashboard');
  revalidatePath(`/admin/customers`);
  return { ok: true };
}

export async function deletePickupAction(requestId) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from('pickup_requests')
    .delete()
    .eq('id', requestId);

  if (error) return { error: error.message };

  revalidatePath('/admin/dashboard');
  return { ok: true };
}
