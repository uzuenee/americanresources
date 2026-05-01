import 'server-only';

import { getResend } from './client';

const FROM =
  process.env.EMAIL_FROM || 'American Resources <noreply@recyclinggroup.com>';
const REPLY_TO = process.env.EMAIL_REPLY_TO;

// Single send wrapper. Never throws — callers may await but should treat any
// failure as non-fatal (auth/operational actions must still succeed if the
// mailer is down).
export async function sendEmail({
  to,
  subject,
  react,
  html,
  text,
  replyTo,
  idempotencyKey,
  tags,
}) {
  try {
    if (!react && !html && !text) {
      const error = new Error('Email body is required');
      console.error('[email] send failed', { subject, to, error });
      return { ok: false, error };
    }

    const resend = getResend();
    const { data, error } = await resend.emails.send(
      {
        from: FROM,
        to,
        replyTo: replyTo || REPLY_TO || undefined,
        subject,
        react: react || undefined,
        html: html || undefined,
        text: text || undefined,
        tags,
      },
      idempotencyKey ? { idempotencyKey } : undefined
    );

    if (error) {
      console.error('[email] send failed', { subject, to, error });
      return { ok: false, error };
    }
    return { ok: true, id: data?.id };
  } catch (err) {
    console.error('[email] unexpected send error', { subject, to, err });
    return { ok: false, error: err };
  }
}
