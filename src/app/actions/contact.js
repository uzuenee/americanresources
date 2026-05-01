'use server';

import { z } from 'zod';
import { sendEmail } from '@/lib/email/send';
import { services } from '@/data/services';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  company: z.string().min(1, 'Company name is required').max(200),
  email: z.string().email('Please enter a valid email address.').max(254),
  phone: z.string().max(30).optional().default(''),
  service: z.string().min(1, 'Please select a service').max(100),
  message: z.string().max(5000).optional().default(''),
});

const CONTACT_INBOX =
  process.env.CONTACT_EMAIL ||
  process.env.EMAIL_ADMIN_NOTIFICATIONS ||
  'info@recyclinggroup.com';

function normalizeContactData(data) {
  if (data instanceof FormData) {
    return Object.fromEntries(data.entries());
  }
  return data;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getServiceLabel(slug) {
  const service = services.find((item) => item.slug === slug);
  if (service) return service.shortTitle || service.title;
  if (slug === 'multiple') return 'Multiple Services';
  if (slug === 'not-sure') return 'Not Sure';
  return slug;
}

function buildContactEmail(d) {
  const serviceLabel = getServiceLabel(d.service);
  const rows = [
    ['Name', d.name],
    ['Company', d.company],
    ['Email', d.email],
    ['Phone', d.phone || 'Not provided'],
    ['Service interest', serviceLabel],
    ['Message', d.message || 'No message provided'],
  ];

  const text = [
    'New website inquiry',
    '',
    ...rows.map(([label, value]) => `${label}: ${value}`),
  ].join('\n');

  const htmlRows = rows
    .map(
      ([label, value]) => `
        <tr>
          <th align="left" style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#374151;width:150px;">${escapeHtml(label)}</th>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#111827;white-space:pre-wrap;">${escapeHtml(value)}</td>
        </tr>`
    )
    .join('');

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827;">
      <h2 style="margin:0 0 16px;">New website inquiry</h2>
      <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;max-width:680px;">
        ${htmlRows}
      </table>
    </div>`;

  return { html, text };
}

export async function submitContactForm(data) {
  const parsed = contactSchema.safeParse(normalizeContactData(data));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  const email = buildContactEmail(d);

  const result = await sendEmail({
    to: CONTACT_INBOX,
    subject: `New inquiry from ${d.name} at ${d.company}`,
    replyTo: d.email,
    html: email.html,
    text: email.text,
    tags: [{ name: 'type', value: 'contact-form' }],
  });

  if (!result.ok) {
    console.error('[contact] Failed to deliver form submission', { name: d.name, company: d.company });
    return { error: 'We could not send your inquiry right now. Please try again or call us directly.' };
  }

  return { ok: true };
}
