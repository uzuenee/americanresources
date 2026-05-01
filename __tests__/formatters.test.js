import { describe, it, expect } from 'vitest';
import {
  MATERIAL_LABELS,
  TIME_WINDOW_LABELS,
  materialLabel,
  timeWindowLabel,
  formatDate,
} from '@/lib/email/formatters';

// ---------------------------------------------------------------------------
// Label maps
// ---------------------------------------------------------------------------
describe('MATERIAL_LABELS', () => {
  it('has all 6 material types', () => {
    expect(Object.keys(MATERIAL_LABELS)).toEqual(
      expect.arrayContaining(['metal', 'paper', 'electronics', 'plastic', 'pallets', 'mixed'])
    );
  });

  it('maps to human-readable labels', () => {
    expect(MATERIAL_LABELS.metal).toBe('Metal');
    expect(MATERIAL_LABELS.mixed).toBe('Mixed load');
  });
});

describe('TIME_WINDOW_LABELS', () => {
  it('has all 3 time windows', () => {
    expect(Object.keys(TIME_WINDOW_LABELS)).toHaveLength(3);
    expect(TIME_WINDOW_LABELS.morning).toBeDefined();
    expect(TIME_WINDOW_LABELS.afternoon).toBeDefined();
    expect(TIME_WINDOW_LABELS.no_preference).toBeDefined();
  });

  it('includes time ranges in labels', () => {
    expect(TIME_WINDOW_LABELS.morning).toContain('8am');
    expect(TIME_WINDOW_LABELS.afternoon).toContain('12pm');
  });
});

// ---------------------------------------------------------------------------
// materialLabel
// ---------------------------------------------------------------------------
describe('materialLabel', () => {
  it('maps known values', () => {
    expect(materialLabel('metal')).toBe('Metal');
    expect(materialLabel('paper')).toBe('Paper');
    expect(materialLabel('electronics')).toBe('Electronics');
    expect(materialLabel('plastic')).toBe('Plastic');
    expect(materialLabel('pallets')).toBe('Pallets');
    expect(materialLabel('mixed')).toBe('Mixed load');
  });

  it('returns the value itself for unknown types', () => {
    expect(materialLabel('wood')).toBe('wood');
  });

  it('returns empty string for null/undefined', () => {
    expect(materialLabel(null)).toBe('');
    expect(materialLabel(undefined)).toBe('');
  });
});

// ---------------------------------------------------------------------------
// timeWindowLabel
// ---------------------------------------------------------------------------
describe('timeWindowLabel', () => {
  it('maps known values', () => {
    expect(timeWindowLabel('morning')).toBe('Morning (8am–12pm)');
    expect(timeWindowLabel('afternoon')).toBe('Afternoon (12pm–5pm)');
    expect(timeWindowLabel('no_preference')).toBe('No preference');
  });

  it('returns the value itself for unknown types', () => {
    expect(timeWindowLabel('evening')).toBe('evening');
  });

  it('returns empty string for null/undefined', () => {
    expect(timeWindowLabel(null)).toBe('');
    expect(timeWindowLabel(undefined)).toBe('');
  });
});

// ---------------------------------------------------------------------------
// formatDate
// ---------------------------------------------------------------------------
describe('formatDate', () => {
  it('formats ISO date to human-readable', () => {
    const result = formatDate('2025-03-19');
    expect(result).toContain('March');
    expect(result).toContain('19');
    expect(result).toContain('2025');
    expect(result).toContain('Wednesday');
  });

  it('handles different dates correctly', () => {
    const result = formatDate('2025-12-25');
    expect(result).toContain('December');
    expect(result).toContain('25');
    expect(result).toContain('Thursday');
  });

  it('returns empty string for null/undefined', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
  });

  it('returns the raw string for unparseable dates', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date');
  });

  it('handles January 1st correctly (no off-by-one from TZ)', () => {
    const result = formatDate('2025-01-01');
    expect(result).toContain('January');
    expect(result).toContain('1');
    expect(result).toContain('Wednesday');
  });

  it('handles December 31st correctly', () => {
    const result = formatDate('2025-12-31');
    expect(result).toContain('December');
    expect(result).toContain('31');
  });
});
