import 'server-only';

import { sendEmail } from './send';
import EmailConfirmation from '@/emails/email-confirmation';
import PasswordReset from '@/emails/password-reset';
import RequestSubmitted from '@/emails/request-submitted';
import AdminRequestAlert from '@/emails/admin-request-alert';
import PickupScheduled from '@/emails/pickup-scheduled';
import PickupCompleted from '@/emails/pickup-completed';
import RequestCancelled from '@/emails/request-cancelled';
import CustomerApproved from '@/emails/customer-approved';
import AdminSignupAlert from '@/emails/admin-signup-alert';
import AdminPickupScheduled from '@/emails/admin-pickup-scheduled';
import AdminPickupCompleted from '@/emails/admin-pickup-completed';
import AdminRequestCancelled from '@/emails/admin-request-cancelled';

const ADMIN_INBOX =
  process.env.EMAIL_ADMIN_NOTIFICATIONS || 'info@recyclinggroup.com';

// Hash the URL tail so the idempotency key fits in 64 chars while still being
// unique per-attempt. Resend stores keys for 24h and dedups within that window.
function tail(s, n = 16) {
  return String(s || '').slice(-n);
}

export function sendSignupConfirmation({ to, fullName, company, confirmUrl }) {
  return sendEmail({
    to,
    subject: 'Confirm your American Resources account',
    react: <EmailConfirmation fullName={fullName} company={company} confirmUrl={confirmUrl} />,
    idempotencyKey: `signup:${to}:${tail(confirmUrl)}`,
    tags: [{ name: 'type', value: 'signup_confirmation' }],
  });
}

export function sendPasswordReset({ to, fullName, resetUrl, tokenHash }) {
  return sendEmail({
    to,
    subject: 'Reset your American Resources password',
    react: <PasswordReset fullName={fullName} resetUrl={resetUrl} />,
    idempotencyKey: `reset:${to}:${tail(tokenHash || resetUrl)}`,
    tags: [{ name: 'type', value: 'password_reset' }],
  });
}

export function sendRequestSubmitted({ to, requestId, ...payload }) {
  return sendEmail({
    to,
    subject: 'We got your pickup request',
    react: <RequestSubmitted {...payload} />,
    idempotencyKey: `req-submitted:${requestId}`,
    tags: [{ name: 'type', value: 'request_submitted' }],
  });
}

export function sendAdminRequestAlert({ requestId, ...payload }) {
  return sendEmail({
    to: ADMIN_INBOX,
    // Lead with company + material so the inbox preview keeps the actionable
    // data even when mobile clients truncate at ~35 chars.
    subject: `${payload.company} · ${payload.materialLabel} — new pickup request`,
    react: <AdminRequestAlert {...payload} />,
    idempotencyKey: `admin-req-alert:${requestId}`,
    tags: [{ name: 'type', value: 'admin_alert' }],
  });
}

export function sendPickupScheduled({ to, requestId, ...payload }) {
  return sendEmail({
    to,
    subject: `Pickup scheduled for ${payload.scheduledDateLabel}`,
    react: <PickupScheduled {...payload} />,
    idempotencyKey: `scheduled:${requestId}:${payload.scheduledDateLabel}:${payload.scheduledWindowLabel}`,
    tags: [{ name: 'type', value: 'pickup_scheduled' }],
  });
}

export function sendPickupCompleted({ to, requestId, ...payload }) {
  return sendEmail({
    to,
    subject: `${payload.weightLbs} lbs ${payload.materialLabel} picked up — pickup complete`,
    react: <PickupCompleted {...payload} />,
    idempotencyKey: `completed:${requestId}`,
    tags: [{ name: 'type', value: 'pickup_completed' }],
  });
}

export function sendRequestCancelled({ to, requestId, ...payload }) {
  return sendEmail({
    to,
    subject: 'Your pickup request was cancelled',
    react: <RequestCancelled {...payload} />,
    idempotencyKey: `cancelled:${requestId}`,
    tags: [{ name: 'type', value: 'request_cancelled' }],
  });
}

export function sendCustomerApproved({ to, fullName, company, portalUrl }) {
  return sendEmail({
    to,
    subject: 'Your American Resources account is approved',
    react: <CustomerApproved fullName={fullName} company={company} portalUrl={portalUrl} />,
    idempotencyKey: `approved:${to}`,
    tags: [{ name: 'type', value: 'customer_approved' }],
  });
}

export function sendAdminSignupAlert({ company, contactName, contactEmail, contactPhone, address, adminUrl }) {
  return sendEmail({
    to: ADMIN_INBOX,
    subject: `${company} — new account pending approval`,
    react: (
      <AdminSignupAlert
        company={company}
        contactName={contactName}
        contactEmail={contactEmail}
        contactPhone={contactPhone}
        pickupAddress={address.street}
        pickupCity={address.city}
        pickupState={address.state}
        pickupZip={address.zip}
        adminUrl={adminUrl}
      />
    ),
    idempotencyKey: `admin-signup:${contactEmail}`,
    tags: [{ name: 'type', value: 'admin_signup_alert' }],
  });
}

export function sendAdminPickupScheduled({ requestId, company, materialLabel, scheduledDateLabel, scheduledWindowLabel, scheduledBy, adminUrl }) {
  return sendEmail({
    to: ADMIN_INBOX,
    subject: `${company} · ${materialLabel} — pickup scheduled by ${scheduledBy}`,
    react: (
      <AdminPickupScheduled
        company={company}
        materialLabel={materialLabel}
        scheduledDateLabel={scheduledDateLabel}
        scheduledWindowLabel={scheduledWindowLabel}
        scheduledBy={scheduledBy}
        adminUrl={adminUrl}
      />
    ),
    idempotencyKey: `admin-scheduled:${requestId}:${scheduledDateLabel}`,
    tags: [{ name: 'type', value: 'admin_pickup_scheduled' }],
  });
}

export function sendAdminPickupCompleted({ requestId, company, materialLabel, weightLbs, entryDateLabel, adminUrl }) {
  return sendEmail({
    to: ADMIN_INBOX,
    subject: `${company} — ${weightLbs} lbs ${materialLabel} loaded`,
    react: (
      <AdminPickupCompleted
        company={company}
        materialLabel={materialLabel}
        weightLbs={weightLbs}
        entryDateLabel={entryDateLabel}
        adminUrl={adminUrl}
      />
    ),
    idempotencyKey: `admin-completed:${requestId}`,
    tags: [{ name: 'type', value: 'admin_pickup_completed' }],
  });
}

export function sendAdminRequestCancelled({ requestId, company, materialLabel, preferredDateLabel, cancelledBy }) {
  return sendEmail({
    to: ADMIN_INBOX,
    subject: `${company} · ${materialLabel} — request cancelled by ${cancelledBy}`,
    react: (
      <AdminRequestCancelled
        company={company}
        materialLabel={materialLabel}
        preferredDateLabel={preferredDateLabel}
        cancelledBy={cancelledBy}
      />
    ),
    idempotencyKey: `admin-cancelled:${requestId}`,
    tags: [{ name: 'type', value: 'admin_request_cancelled' }],
  });
}
