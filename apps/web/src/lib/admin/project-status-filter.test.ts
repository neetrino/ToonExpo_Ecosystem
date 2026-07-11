import { describe, expect, it } from 'vitest';

import { parseProjectStatusFilter } from './project-status-filter';

describe('parseProjectStatusFilter', () => {
  it('returns undefined for missing value', () => {
    expect(parseProjectStatusFilter(undefined)).toBeUndefined();
  });

  it('returns undefined for invalid status values', () => {
    expect(parseProjectStatusFilter('LIVE')).toBeUndefined();
    expect(parseProjectStatusFilter('')).toBeUndefined();
  });

  it('returns the status for valid enum values', () => {
    expect(parseProjectStatusFilter('DRAFT')).toBe('DRAFT');
    expect(parseProjectStatusFilter('PUBLISHED')).toBe('PUBLISHED');
    expect(parseProjectStatusFilter('ARCHIVED')).toBe('ARCHIVED');
  });
});
