import { describe, it, expect } from 'vitest';

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizeText(text) {
  if (!text) return text;
  return String(text).replace(/<script[\s\S]*?<\/script>/gi, '');
}

// ---------------------------------------------------------------------------
// HTML escaping (used in contact form emails)
// ---------------------------------------------------------------------------
describe('escapeHtml', () => {
  it('escapes ampersands', () => {
    expect(escapeHtml('A & B')).toBe('A &amp; B');
  });

  it('escapes less-than signs', () => {
    expect(escapeHtml('a < b')).toBe('a &lt; b');
  });

  it('escapes greater-than signs', () => {
    expect(escapeHtml('a > b')).toBe('a &gt; b');
  });

  it('escapes double quotes', () => {
    expect(escapeHtml('say "hello"')).toBe('say &quot;hello&quot;');
  });

  it('escapes single quotes', () => {
    expect(escapeHtml("it's")).toBe('it&#39;s');
  });

  it('handles null/undefined', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
  });

  it('prevents XSS through script tags', () => {
    const malicious = '<script>alert("xss")</script>';
    const escaped = escapeHtml(malicious);
    expect(escaped).not.toContain('<script>');
    expect(escaped).toContain('&lt;script&gt;');
  });

  it('handles mixed special characters', () => {
    const input = 'Tom & Jerry\'s "show" <2023>';
    const expected = 'Tom &amp; Jerry&#39;s &quot;show&quot; &lt;2023&gt;';
    expect(escapeHtml(input)).toBe(expected);
  });
});

// ---------------------------------------------------------------------------
// Script sanitization (used in CMS content)
// ---------------------------------------------------------------------------
describe('sanitizeText (script removal)', () => {
  it('removes script tags', () => {
    expect(sanitizeText('Hello <script>alert(1)</script> World')).toBe('Hello  World');
  });

  it('removes script tags case-insensitively', () => {
    expect(sanitizeText('Hello <SCRIPT>alert(1)</SCRIPT> World')).toBe('Hello  World');
  });

  it('removes script tags with attributes', () => {
    expect(sanitizeText('<script type="text/javascript">code</script>')).toBe('');
  });

  it('handles multiple script tags', () => {
    const input = '<script>a</script>text<script>b</script>';
    expect(sanitizeText(input)).toBe('text');
  });

  it('preserves non-script content', () => {
    expect(sanitizeText('Normal <strong>text</strong> here')).toBe('Normal <strong>text</strong> here');
  });

  it('returns null/undefined as-is', () => {
    expect(sanitizeText(null)).toBeNull();
    expect(sanitizeText(undefined)).toBeUndefined();
  });

  it('handles multiline script tags', () => {
    const input = `before<script>
      const x = 1;
      alert(x);
    </script>after`;
    expect(sanitizeText(input)).toBe('beforeafter');
  });
});
