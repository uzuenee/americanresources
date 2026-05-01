'use client';

import { sendGAEvent } from '@next/third-parties/google';

export { sendGAEvent };

export function trackContactSubmission(service) {
  sendGAEvent('event', 'contact_form_submit', { service_interest: service });
}
