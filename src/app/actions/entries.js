'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/dal';
import { materialKeys } from '@/lib/materials';

// logManualEntryAction is designed to be called via .bind():
//   const boundAction = logManualEntryAction.bind(null, customerId);
//   <form action={boundAction}>
// This ensures customerId is trusted (comes from the server-rendered page, not
// the form payload), preventing a customer-id spoofing attack.

export async function logManualEntryAction(customerId, _prevState, formData) {
  await requireAdmin();

  const material = String(formData.get('material') ?? '').trim();
  const weight = String(formData.get('weight') ?? '').trim();
  const entryDate = String(formData.get('entryDate') ?? '').trim();
  const notes = String(formData.get('notes') ?? '').trim();

  const fieldErrors = {};
  if (!material || !materialKeys.includes(material)) {
    fieldErrors.material = 'Pick a stream.';
  }
  const weightNum = Number(weight);
  if (!weight || Number.isNaN(weightNum) || weightNum <= 0) {
    fieldErrors.weight = 'Enter a positive weight.';
  }
  if (!entryDate) {
    fieldErrors.entryDate = 'Pick a date.';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors, error: null };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('recycling_entries').insert({
    customer_id: customerId,
    material,
    weight_lbs: weightNum,
    entry_date: entryDate,
    notes: notes || null,
  });

  if (error) {
    return { fieldErrors: {}, error: 'Could not log the entry. Please try again.' };
  }

  revalidatePath(`/admin/customers/${customerId}`);
  revalidatePath('/admin/customers');
  revalidatePath('/admin/reporting');
  return { fieldErrors: {}, error: null, ok: true };
}

export async function deleteEntryAction(entryId) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from('recycling_entries')
    .delete()
    .eq('id', entryId);

  if (error) return { error: error.message };

  revalidatePath('/admin/reporting');
  revalidatePath('/admin/customers');
  return { ok: true };
}
