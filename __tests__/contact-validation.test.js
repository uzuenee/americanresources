import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  company: z.string().min(1, 'Company name is required').max(200),
  email: z.string().email('Please enter a valid email address.').max(254),
  phone: z.string().max(30).optional().default(''),
  service: z.string().min(1, 'Please select a service').max(100),
  message: z.string().max(5000).optional().default(''),
});

const validData = {
  name: 'John Doe',
  company: 'Acme Corp',
  email: 'john@acme.com',
  phone: '(770) 555-1234',
  service: 'scrap-metal',
  message: 'I would like to learn more about your services.',
};

// ---------------------------------------------------------------------------
// Valid submissions
// ---------------------------------------------------------------------------
describe('contact form validation — valid cases', () => {
  it('accepts a fully filled out form', () => {
    const result = contactSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('accepts form without phone (optional)', () => {
    const { phone, ...rest } = validData;
    const result = contactSchema.safeParse(rest);
    expect(result.success).toBe(true);
    expect(result.data.phone).toBe('');
  });

  it('accepts form without message (optional)', () => {
    const { message, ...rest } = validData;
    const result = contactSchema.safeParse(rest);
    expect(result.success).toBe(true);
    expect(result.data.message).toBe('');
  });

  it('accepts minimum valid data', () => {
    const result = contactSchema.safeParse({
      name: 'A',
      company: 'B',
      email: 'a@b.co',
      service: 'x',
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Missing required fields
// ---------------------------------------------------------------------------
describe('contact form validation — missing required fields', () => {
  it('rejects missing name', () => {
    const { name, ...rest } = validData;
    const result = contactSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects empty name', () => {
    const result = contactSchema.safeParse({ ...validData, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects missing company', () => {
    const { company, ...rest } = validData;
    const result = contactSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects empty company', () => {
    const result = contactSchema.safeParse({ ...validData, company: '' });
    expect(result.success).toBe(false);
  });

  it('rejects missing email', () => {
    const { email, ...rest } = validData;
    const result = contactSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects missing service', () => {
    const { service, ...rest } = validData;
    const result = contactSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects empty service', () => {
    const result = contactSchema.safeParse({ ...validData, service: '' });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Email validation
// ---------------------------------------------------------------------------
describe('contact form validation — email', () => {
  it('rejects invalid email format', () => {
    const result = contactSchema.safeParse({ ...validData, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('rejects email without domain', () => {
    const result = contactSchema.safeParse({ ...validData, email: 'john@' });
    expect(result.success).toBe(false);
  });

  it('rejects email without @', () => {
    const result = contactSchema.safeParse({ ...validData, email: 'johndoe.com' });
    expect(result.success).toBe(false);
  });

  it('accepts valid email formats', () => {
    const emails = ['user@example.com', 'user.name@domain.co.uk', 'user+tag@example.org'];
    emails.forEach((email) => {
      const result = contactSchema.safeParse({ ...validData, email });
      expect(result.success).toBe(true);
    });
  });

  it('rejects email exceeding 254 chars', () => {
    const longEmail = 'a'.repeat(250) + '@b.co';
    const result = contactSchema.safeParse({ ...validData, email: longEmail });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Field length limits
// ---------------------------------------------------------------------------
describe('contact form validation — field length limits', () => {
  it('rejects name exceeding 200 chars', () => {
    const result = contactSchema.safeParse({ ...validData, name: 'A'.repeat(201) });
    expect(result.success).toBe(false);
  });

  it('accepts name at exactly 200 chars', () => {
    const result = contactSchema.safeParse({ ...validData, name: 'A'.repeat(200) });
    expect(result.success).toBe(true);
  });

  it('rejects company exceeding 200 chars', () => {
    const result = contactSchema.safeParse({ ...validData, company: 'A'.repeat(201) });
    expect(result.success).toBe(false);
  });

  it('rejects service exceeding 100 chars', () => {
    const result = contactSchema.safeParse({ ...validData, service: 'A'.repeat(101) });
    expect(result.success).toBe(false);
  });

  it('rejects phone exceeding 30 chars', () => {
    const result = contactSchema.safeParse({ ...validData, phone: '1'.repeat(31) });
    expect(result.success).toBe(false);
  });

  it('rejects message exceeding 5000 chars', () => {
    const result = contactSchema.safeParse({ ...validData, message: 'A'.repeat(5001) });
    expect(result.success).toBe(false);
  });

  it('accepts message at exactly 5000 chars', () => {
    const result = contactSchema.safeParse({ ...validData, message: 'A'.repeat(5000) });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Error messages
// ---------------------------------------------------------------------------
describe('contact form validation — error messages', () => {
  it('returns "Name is required" for empty name', () => {
    const result = contactSchema.safeParse({ ...validData, name: '' });
    expect(result.success).toBe(false);
    const messages = result.error.issues.map((i) => i.message);
    expect(messages).toContain('Name is required');
  });

  it('returns "Company name is required" for empty company', () => {
    const result = contactSchema.safeParse({ ...validData, company: '' });
    expect(result.success).toBe(false);
    const messages = result.error.issues.map((i) => i.message);
    expect(messages).toContain('Company name is required');
  });

  it('returns "Please enter a valid email address." for bad email', () => {
    const result = contactSchema.safeParse({ ...validData, email: 'bad' });
    expect(result.success).toBe(false);
    const messages = result.error.issues.map((i) => i.message);
    expect(messages).toContain('Please enter a valid email address.');
  });

  it('returns "Please select a service" for empty service', () => {
    const result = contactSchema.safeParse({ ...validData, service: '' });
    expect(result.success).toBe(false);
    const messages = result.error.issues.map((i) => i.message);
    expect(messages).toContain('Please select a service');
  });
});
