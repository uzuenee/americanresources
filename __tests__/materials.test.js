import { describe, it, expect } from 'vitest';

const { materialMeta, materialKeys, getCompanyInitials, getPersonInitials } =
  await import('@/lib/materials');

const HEX_COLOR = /^#[0-9A-Fa-f]+$/;

describe('materialMeta', () => {
  it('contains all 6 material types', () => {
    expect(materialKeys).toHaveLength(6);
    expect(materialKeys).toEqual(
      expect.arrayContaining(['metal', 'paper', 'electronics', 'plastic', 'pallets', 'mixed'])
    );
  });

  it('each material has label, color, chipBg, chipText', () => {
    for (const key of materialKeys) {
      const meta = materialMeta[key];
      expect(meta).toHaveProperty('label');
      expect(meta).toHaveProperty('color');
      expect(meta).toHaveProperty('chipBg');
      expect(meta).toHaveProperty('chipText');
      expect(typeof meta.label).toBe('string');
      expect(meta.color).toMatch(HEX_COLOR);
      expect(meta.chipBg).toMatch(HEX_COLOR);
      expect(meta.chipText).toMatch(HEX_COLOR);
    }
  });

  it('has meaningful labels', () => {
    expect(materialMeta.metal.label).toBe('Scrap Metal');
    expect(materialMeta.paper.label).toBe('Paper / Cardboard');
    expect(materialMeta.electronics.label).toBe('Electronics');
    expect(materialMeta.plastic.label).toBe('Plastic');
    expect(materialMeta.pallets.label).toBe('Pallets');
    expect(materialMeta.mixed.label).toBe('Mixed / Other');
  });
});

describe('getCompanyInitials', () => {
  it('extracts first two initials', () => {
    expect(getCompanyInitials('Acme Corporation')).toBe('AC');
  });

  it('handles single-word company names', () => {
    expect(getCompanyInitials('Tesla')).toBe('T');
  });

  it('strips location after comma', () => {
    expect(getCompanyInitials('SouthTech Industries, LLC')).toBe('SI');
  });

  it('takes only first two words', () => {
    expect(getCompanyInitials('First Second Third Fourth')).toBe('FS');
  });

  it('uppercases initials', () => {
    expect(getCompanyInitials('lowercase company')).toBe('LC');
  });

  it('returns ? for null/undefined/empty', () => {
    expect(getCompanyInitials(null)).toBe('?');
    expect(getCompanyInitials(undefined)).toBe('?');
    expect(getCompanyInitials('')).toBe('?');
  });
});

describe('getPersonInitials', () => {
  it('extracts initials from full name', () => {
    expect(getPersonInitials('John Doe')).toBe('JD');
  });

  it('handles single name', () => {
    expect(getPersonInitials('Madonna')).toBe('M');
  });

  it('takes only first two names', () => {
    expect(getPersonInitials('Mary Jane Watson Parker')).toBe('MJ');
  });

  it('uppercases initials', () => {
    expect(getPersonInitials('jane doe')).toBe('JD');
  });

  it('returns ? for null/undefined/empty', () => {
    expect(getPersonInitials(null)).toBe('?');
    expect(getPersonInitials(undefined)).toBe('?');
    expect(getPersonInitials('')).toBe('?');
  });

  it('handles extra whitespace', () => {
    expect(getPersonInitials('  John   Doe  ')).toBe('JD');
  });
});
