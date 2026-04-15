import 'server-only';

import { sendEmail } from './send';
import EmailConfirmation from '@/emails/email-confirmation';
import PasswordReset from '@/emails/password-reset';
import RequestSubmitted from '@/emails/request-submitted';
import AdminRequestAlert from '@/emails/admin-request-alert';
import PickupScheduled from '@/emails/pickup-scheduled';
import PickupCompleted from '@/emails/pickup-completed';
import RequestCancelled from '@/emails/request-cancelled';

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

export function sendPasswordReset({ to, fullName, resetUrl }) {
  return sendEmail({
    to,
    subject: 'Reset your American Resources password',
    react: <PasswordReset fullName={fullName} resetUrl={resetUrl} />,
    idempotencyKey: `reset:${to}:${tail(resetUrl)}`,
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
