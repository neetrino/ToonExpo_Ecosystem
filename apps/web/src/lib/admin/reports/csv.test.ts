import { describe, expect, it } from 'vitest';

import { buildCsv, escapeCsvField } from './csv';

describe('escapeCsvField', () => {
  it('returns empty string for nullish', () => {
    expect(escapeCsvField(null)).toBe('');
    expect(escapeCsvField(undefined)).toBe('');
  });

  it('passes through plain values', () => {
    expect(escapeCsvField('hello')).toBe('hello');
    expect(escapeCsvField(42)).toBe('42');
  });

  it('quotes fields with commas', () => {
    expect(escapeCsvField('a,b')).toBe('"a,b"');
  });

  it('escapes embedded quotes', () => {
    expect(escapeCsvField('say "hi"')).toBe('"say ""hi"""');
  });

  it('quotes fields with newlines', () => {
    expect(escapeCsvField('line1\nline2')).toBe('"line1\nline2"');
  });
});

describe('buildCsv', () => {
  it('includes UTF-8 BOM and CRLF rows', () => {
    const csv = buildCsv(['Name', 'City'], [['Ada', 'Yerevan'], ['Bob, Jr', 'Gyumri']]);
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('Name,City\r\n');
    expect(csv).toContain('"Bob, Jr",Gyumri');
  });
});
