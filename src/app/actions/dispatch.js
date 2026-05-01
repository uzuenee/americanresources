'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/dal';
import {
  sendPickupScheduled,
  sendPickupCompleted,
  sendRequestCancelled,
  sendAdminPickupScheduled,
  sendAdminPickupCompleted,
  sendAdminRequestCancelled,
} from '@/lib/email/events';
import {
  materialLabel,
  timeWindowLabel,
  formatDate,
} from '@/lib/email/formatters';

// All dispatch actions require admin role. They revalidate /admin/dashboard so
// the Server Component re-fetches fresh data after the client-side optimistic
// update settles.

function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
    'http://localhost:3000'
  );
}

export async function schedulePickupAction(requestId, scheduledDate, scheduledWindow) {
  const { profile: adminProfile } = await requireAdmin();
  const supabase = await createClient();

  // Pull customer info up-front so a missing email doesn't reveal itself only
  // after the update succeeds.
  const { data: req } = await supabase
    .from('pickup_requests')
    .select(
      'id, material, customers ( company, contact_name, contact_email )'
    )
    .eq('id', requestId)
    .single();

  const { error } = await supabase
    .from('pickup_requests')
    .update({
      status: 'scheduled',
      scheduled_date: scheduledDate,
      scheduled_window: scheduledWindow,
    })
    .eq('id', requestId);

  if (error) return { error: error.message };

  if (req?.customers?.contact_email) {
    try {
      await sendPickupScheduled({
        to: req.customers.contact_email,
        requestId: req.id,
        fullName: req.customers.contact_name || '',
        company: req.customers.company || '',
        materialLabel: materialLabel(req.material),
        scheduledDateLabel: formatDate(scheduledDate),
        scheduledWindowLabel: timeWindowLabel(scheduledWindow),
        dashboardUrl: `${siteUrl()}/portal/dashboard`,
      });
    } catch (e) {
      console.error('[email] pickup-scheduled failed', e);
    }
  }

  sendAdminPickupScheduled({
    requestId,
    company: req?.customers?.company || '',
    materialLabel: materialLabel(req.material),
    scheduledDateLabel: formatDate(scheduledDate),
    scheduledWindowLabel: timeWindowLabel(scheduledWindow),
    scheduledBy: adminProfile.full_name || 'Admin',
    adminUrl: `${siteUrl()}/admin/dashboard`,
  });

  revalidatePath('/admin/dashboard');
  return { ok: true };
}

export async function markLoadedAction(requestId) {
  const { profile: adminProfile } = await requireAdmin();
  const supabase = await createClient();

  // Pull just enough to create a recycling_entry AND fire the email.
  const { data: req, error: fetchErr } = await supabase
    .from('pickup_requests')
    .select(
      'customer_id, material, estimated_weight, customers ( company, contact_name, contact_email )'
    )
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

  if (req.customers?.contact_email) {
    try {
      await sendPickupCompleted({
        to: req.customers.contact_email,
        requestId,
        fullName: req.customers.contact_name || '',
        company: req.customers.company || '',
        materialLabel: materialLabel(req.material),
        weightLbs: Number(req.estimated_weight),
        entryDateLabel: formatDate(today),
        historyUrl: `${siteUrl()}/portal/history`,
      });
    } catch (e) {
      console.error('[email] pickup-completed failed', e);
    }
  }

  sendAdminPickupCompleted({
    requestId,
    company: req.customers?.company || '',
    materialLabel: materialLabel(req.material),
    weightLbs: Number(req.estimated_weight),
    entryDateLabel: formatDate(today),
    adminUrl: `${siteUrl()}/admin/customers/${req.customer_id}`,
  });

  revalidatePath('/admin/dashboard');
  revalidatePath(`/admin/customers`);
  return { ok: true };
}

export async function deletePickupAction(requestId) {
  const { profile: adminProfile } = await requireAdmin();
  const supabase = await createClient();

  // Fetch BEFORE deleting so the cancellation email has a recipient.
  const { data: req } = await supabase
    .from('pickup_requests')
    .select(
      'id, material, preferred_date, customers ( company, contact_name, contact_email )'
    )
    .eq('id', requestId)
    .single();

  const { error } = await supabase
    .from('pickup_requests')
    .delete()
    .eq('id', requestId);

  if (error) return { error: error.message };

  if (req?.customers?.contact_email) {
    try {
      await sendRequestCancelled({
        to: req.customers.contact_email,
        requestId: req.id,
        fullName: req.customers.contact_name || '',
        company: req.customers.company || '',
        materialLabel: materialLabel(req.material),
        preferredDateLabel: formatDate(req.preferred_date),
        portalUrl: `${siteUrl()}/portal/request`,
      });
    } catch (e) {
      console.error('[email] request-cancelled failed', e);
    }
  }

  sendAdminRequestCancelled({
    requestId: req.id,
    company: req?.customers?.company || '',
    materialLabel: materialLabel(req.material),
    preferredDateLabel: formatDate(req.preferred_date),
    cancelledBy: adminProfile.full_name || 'Admin',
  });

  revalidatePath('/admin/dashboard');
  return { ok: true };
}
