import 'server-only';

import { Resend } from 'resend';

let cached;

export function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not set');
  }
  if (!cached) cached = new Resend(process.env.RESEND_API_KEY);
  return cached;
}
