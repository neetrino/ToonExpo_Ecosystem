import { describe, expect, it } from 'vitest';

import { parsePartnerTypeFilter } from './partner-type-filter';

describe('parsePartnerTypeFilter', () => {
  it('returns undefined for missing or invalid values', () => {
    expect(parsePartnerTypeFilter(undefined)).toBeUndefined();
    expect(parsePartnerTypeFilter('')).toBeUndefined();
    expect(parsePartnerTypeFilter('SERVICE_PROVIDER')).toBeUndefined();
  });

  it('returns the type for valid enum values', () => {
    expect(parsePartnerTypeFilter('BANK')).toBe('BANK');
    expect(parsePartnerTypeFilter('SERVICE_COMPANY')).toBe('SERVICE_COMPANY');
  });
});
