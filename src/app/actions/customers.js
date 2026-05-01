'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/dal';
import { sendCustomerApproved } from '@/lib/email/events';

function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
    'http://localhost:3000'
  );
}

export async function approveCustomerAction(customerId) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: customer, error: fetchErr } = await supabase
    .from('customers')
    .select('id, company, contact_name, contact_email, status')
    .eq('id', customerId)
    .single();

  if (fetchErr || !customer) {
    return { error: 'Customer not found.' };
  }

  if (customer.status !== 'pending') {
    return { error: 'This account is already approved.' };
  }

  const { error: updateErr } = await supabase
    .from('customers')
    .update({ status: 'active' })
    .eq('id', customerId);

  if (updateErr) {
    return { error: 'Could not approve. Please try again.' };
  }

  if (customer.contact_email) {
    try {
      await sendCustomerApproved({
        to: customer.contact_email,
        fullName: customer.contact_name || '',
        company: customer.company || '',
        portalUrl: `${siteUrl()}/portal/dashboard`,
      });
    } catch (e) {
      console.error('[email] customer-approved failed', e);
    }
  }

  revalidatePath('/admin/customers');
  revalidatePath(`/admin/customers/${customerId}`);
  return { ok: true };
}
