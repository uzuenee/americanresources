'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireCustomer } from '@/lib/dal';
import { materialKeys } from '@/lib/materials';
import {
  sendRequestSubmitted,
  sendAdminRequestAlert,
} from '@/lib/email/events';
import {
  materialLabel,
  timeWindowLabel,
  formatDate,
} from '@/lib/email/formatters';

// Pickup request server action. Used by CustomerRequest form via
// useActionState((prev, formData) => ...). Returns `{ fieldErrors, error }`
// on validation/DB failure, redirects on success.

function stringField(formData, name) {
  const value = formData.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

const VALID_WINDOWS = new Set(['morning', 'afternoon', 'no_preference']);

function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
    'http://localhost:3000'
  );
}

export async function createPickupRequestAction(_prevState, formData) {
  // requireCustomer() enforces the user is a customer AND has a customer_id.
  // The BEFORE INSERT trigger on pickup_requests also re-forces customer_id
  // from the JWT, so a spoofed form field can't target another tenant.
  const session = await requireCustomer();

  const material = stringField(formData, 'material');
  const estimatedWeight = stringField(formData, 'estimatedWeight');
  const preferredDate = stringField(formData, 'preferredDate');
  const timeWindow = stringField(formData, 'timeWindow') || 'no_preference';
  const contactName = stringField(formData, 'contactName');
  const contactPhone = stringField(formData, 'contactPhone');
  const accessInstructions = stringField(formData, 'accessInstructions');
  const mixedDetails = stringField(formData, 'mixedDetails');
  const pickupAddress = stringField(formData, 'pickupAddress');
  const pickupAddress2 = stringField(formData, 'pickupAddress2');
  const pickupCity = stringField(formData, 'pickupCity');
  const pickupState = stringField(formData, 'pickupState');
  const pickupZip = stringField(formData, 'pickupZip');

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
  const { data: inserted, error } = await supabase
    .from('pickup_requests')
    .insert({
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
      pickup_address: pickupAddress || null,
      pickup_city: pickupCity || null,
      pickup_state: pickupState || null,
      pickup_zip: pickupZip || null,
    })
    .select('id')
    .single();

  if (error) {
    return {
      fieldErrors: {},
      error: 'Could not submit your request. Please try again.',
    };
  }

  // Fan out: customer confirmation + admin alert. Failures are swallowed —
  // the request is committed, the redirect must succeed.
  try {
    const { data: customer } = await supabase
      .from('customers')
      .select(
        'company, pickup_address, pickup_address2, pickup_city, pickup_state, pickup_zip'
      )
      .eq('id', session.profile.customer_id)
      .single();

    const company = customer?.company || session.profile.full_name || 'Your account';
    const userEmail = session.user.email;
    const userFullName = session.profile.full_name || '';
    const matLabel = materialLabel(material);
    const winLabel = timeWindowLabel(timeWindow);
    const dateLabel = formatDate(preferredDate);
    const dashboardUrl = `${siteUrl()}/portal/dashboard`;
    const adminUrl = `${siteUrl()}/admin/dashboard`;

    await Promise.allSettled([
      userEmail
        ? sendRequestSubmitted({
            to: userEmail,
            requestId: inserted.id,
            fullName: userFullName,
            company,
            materialLabel: matLabel,
            estimatedWeight: weightNum,
            preferredDateLabel: dateLabel,
            timeWindowLabel: winLabel,
            mixedDetails: material === 'mixed' ? mixedDetails : null,
            dashboardUrl,
          })
        : Promise.resolve(),
      sendAdminRequestAlert({
        requestId: inserted.id,
        company,
        contactName,
        contactPhone,
        contactEmail: userEmail,
        materialLabel: matLabel,
        estimatedWeight: weightNum,
        preferredDateLabel: dateLabel,
        timeWindowLabel: winLabel,
        accessInstructions: accessInstructions || null,
        mixedDetails: material === 'mixed' ? mixedDetails : null,
        pickupAddress: pickupAddress || customer?.pickup_address,
        pickupAddress2: pickupAddress2 || customer?.pickup_address2,
        pickupCity: pickupCity || customer?.pickup_city,
        pickupState: pickupState || customer?.pickup_state,
        pickupZip: pickupZip || customer?.pickup_zip,
        adminUrl,
      }),
    ]);
  } catch (e) {
    console.error('[email] request-submitted fanout failed', e);
  }

  revalidatePath('/portal/dashboard');
  revalidatePath('/portal/history');
  revalidatePath('/portal/request');
  redirect('/portal/dashboard?requested=1');
}
