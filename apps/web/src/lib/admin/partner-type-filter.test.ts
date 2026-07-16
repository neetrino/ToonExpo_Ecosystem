import { describe, expect, it } from 'vitest';

import { parsePartnerStatusFilter, parsePartnerTypeFilter } from './partner-type-filter';

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

describe('parsePartnerStatusFilter', () => {
  it('returns undefined for missing value', () => {
    expect(parsePartnerStatusFilter(undefined)).toBeUndefined();
  });

  it('returns undefined for invalid status values', () => {
    expect(parsePartnerStatusFilter('LIVE')).toBeUndefined();
    expect(parsePartnerStatusFilter('')).toBeUndefined();
  });

  it('returns the status for valid enum values', () => {
    expect(parsePartnerStatusFilter('DRAFT')).toBe('DRAFT');
    expect(parsePartnerStatusFilter('PUBLISHED')).toBe('PUBLISHED');
    expect(parsePartnerStatusFilter('ARCHIVED')).toBe('ARCHIVED');
  });
});
