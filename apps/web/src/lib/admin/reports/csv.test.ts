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

  it('keeps typed numeric negatives raw (string-only neutralization)', () => {
    expect(escapeCsvField(-2)).toBe('-2');
    expect(escapeCsvField(1)).toBe('1');
  });

  it('neutralizes formula-like string cells', () => {
    expect(escapeCsvField('=cmd|"/c calc"!A1')).toBe(`"'=cmd|""/c calc""!A1"`);
    expect(escapeCsvField('+1')).toBe("'+1");
    expect(escapeCsvField('-2')).toBe("'-2");
    expect(escapeCsvField('@x')).toBe("'@x");
    expect(escapeCsvField('\t=1+1')).toBe("'\t=1+1");
    expect(escapeCsvField('\r=1+1')).toBe(`"'\r=1+1"`);
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
    const csv = buildCsv(
      ['Name', 'City'],
      [
        ['Ada', 'Yerevan'],
        ['Bob, Jr', 'Gyumri'],
      ],
    );
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('Name,City\r\n');
    expect(csv).toContain('"Bob, Jr",Gyumri');
  });

  it('applies formula neutralization across all report cells', () => {
    const csv = buildCsv(['name', 'count'], [['=cmd|x', 3]]);
    expect(csv).toContain("'=cmd|x,3");
  });
});
