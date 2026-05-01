import { describe, it, expect } from 'vitest';
import { generateCSV } from '@/lib/csv-export';

const columns = [
  { header: 'Date', key: 'date' },
  { header: 'Account', key: 'account' },
  { header: 'Stream', key: 'stream' },
  { header: 'Weight (lbs)', key: 'weight' },
  { header: 'Notes', key: 'notes' },
];

describe('generateCSV', () => {
  it('generates header row from column definitions', () => {
    const csv = generateCSV(columns, []);
    expect(csv).toBe('Date,Account,Stream,Weight (lbs),Notes');
  });

  it('generates data rows matching column keys', () => {
    const rows = [
      { date: '2025-03-15', account: 'Acme', stream: 'Metal', weight: 1500, notes: 'Clean load' },
    ];
    const csv = generateCSV(columns, rows);
    const lines = csv.split('\n');
    expect(lines).toHaveLength(2);
    expect(lines[1]).toBe('2025-03-15,Acme,Metal,1500,Clean load');
  });

  it('handles multiple rows', () => {
    const rows = [
      { date: '2025-01-01', account: 'A', stream: 'Paper', weight: 100, notes: '' },
      { date: '2025-01-02', account: 'B', stream: 'Plastic', weight: 200, notes: 'Note' },
      { date: '2025-01-03', account: 'C', stream: 'Metal', weight: 300, notes: 'More' },
    ];
    const lines = generateCSV(columns, rows).split('\n');
    expect(lines).toHaveLength(4);
  });

  it('escapes values containing commas', () => {
    const rows = [
      { date: '2025-01-01', account: 'Acme, Inc.', stream: 'Metal', weight: 100, notes: '' },
    ];
    const csv = generateCSV(columns, rows);
    expect(csv).toContain('"Acme, Inc."');
  });

  it('escapes values containing double quotes', () => {
    const rows = [
      { date: '2025-01-01', account: 'The "Best" Corp', stream: 'Metal', weight: 100, notes: '' },
    ];
    const csv = generateCSV(columns, rows);
    expect(csv).toContain('"The ""Best"" Corp"');
  });

  it('escapes values containing newlines', () => {
    const rows = [
      { date: '2025-01-01', account: 'Acme', stream: 'Metal', weight: 100, notes: 'Line1\nLine2' },
    ];
    const csv = generateCSV(columns, rows);
    expect(csv).toContain('"Line1\nLine2"');
  });

  it('handles null and undefined values', () => {
    const rows = [
      { date: '2025-01-01', account: null, stream: undefined, weight: 0, notes: '' },
    ];
    const csv = generateCSV(columns, rows);
    const lines = csv.split('\n');
    expect(lines[1]).toBe('2025-01-01,,,0,');
  });

  it('preserves numeric values without quoting', () => {
    const rows = [
      { date: '2025-01-01', account: 'A', stream: 'Metal', weight: 15000, notes: '' },
    ];
    const csv = generateCSV(columns, rows);
    expect(csv).toContain(',15000,');
  });

  it('handles empty rows array (headers only)', () => {
    const csv = generateCSV(columns, []);
    const lines = csv.split('\n');
    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain('Date');
  });

  it('escapes header values containing commas', () => {
    const cols = [{ header: 'Weight, in lbs', key: 'w' }];
    const csv = generateCSV(cols, []);
    expect(csv).toBe('"Weight, in lbs"');
  });

  it('handles values with carriage returns', () => {
    const rows = [
      { date: '2025-01-01', account: 'A', stream: 'B', weight: 1, notes: 'a\r\nb' },
    ];
    const csv = generateCSV(columns, rows);
    expect(csv).toContain('"a\r\nb"');
  });
});
