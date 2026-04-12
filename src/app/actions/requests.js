'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireCustomer } from '@/lib/dal';
import { materialKeys } from '@/lib/materials';

// Pickup request server action. Used by CustomerRequest form via
// useActionState((prev, formData) => ...). Returns `{ fieldErrors, error }`
// on validation/DB failure, redirects on success.

function stringField(formData, name) {
  const value = formData.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

const VALID_WINDOWS = new Set(['morning', 'afternoon', 'no_preference']);

export async function createPickupRequestAction(_prevState, formData) {
  // requireCustomer() enforces the user is a customer AND has a customer_id.
  // The BEFORE INSERT trigger on pickup_requests also re-forces customer_id
  // from the JWT, so a spoofed form field can't target another tenant.
  await requireCustomer();

  const material = stringField(formData, 'material');
  const estimatedWeight = stringField(formData, 'estimatedWeight');
  const preferredDate = stringField(formData, 'preferredDate');
  const timeWindow = stringField(formData, 'timeWindow') || 'no_preference';
  const contactName = stringField(formData, 'contactName');
  const contactPhone = stringField(formData, 'contactPhone');
  const accessInstructions = stringField(formData, 'accessInstructions');
  const mixedDetails = stringField(formData, 'mixedDetails');

  const fieldErrors = {};
  if (!material || !materialKeys.includes(material)) {
    fieldErrors.material = 'Pick a stream.';
  }
  const weightNum = Number(estimatedWeight);
  if (!estimatedWeight || Number.isNaN(weightNum) || weightNum <= 0) {
    fieldErrors.estimatedWeight = 'Give us an estimated weight.';
  }
  if (!preferredDate) {
    fieldErrors.preferredDate = 'Pick a preferred date.';
  }
  if (!VALID_WINDOWS.has(timeWindow)) {
    fieldErrors.timeWindow = 'Pick a time window.';
  }
  if (!contactName) {
    fieldErrors.contactName = 'Who should the driver ask for?';
  }
  if (!contactPhone) {
    fieldErrors.contactPhone = 'We need a number to call from the yard.';
  }
  if (material === 'mixed' && !mixedDetails) {
    fieldErrors.mixedDetails = "Describe what's in it.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors, error: null };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('pickup_requests').insert({
    // customer_id is overwritten by the BEFORE INSERT trigger — passing null
    // is fine, the trigger fills it from auth.jwt().
    customer_id: null,
    material,
    estimated_weight: weightNum,
    preferred_date: preferredDate,
    time_window: timeWindow,
    contact_name: contactName,
    contact_phone: contactPhone,
    access_instructions: accessInstructions || null,
    mixed_details: material === 'mixed' ? mixedDetails : null,
  });

  if (error) {
    return {
      fieldErrors: {},
      error: 'Could not submit your request. Please try again.',
    };
  }

  revalidatePath('/portal/dashboard');
  revalidatePath('/portal/history');
  revalidatePath('/portal/request');
  redirect('/portal/dashboard?requested=1');
}
