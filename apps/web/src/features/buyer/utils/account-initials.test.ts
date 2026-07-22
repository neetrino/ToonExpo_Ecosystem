import { describe, expect, it } from 'vitest';

import { getAccountInitials } from '@/features/buyer/utils/account-initials';

describe('getAccountInitials', () => {
  it('returns two initials from a full name', () => {
    expect(getAccountInitials('Ani Petrosyan')).toBe('AP');
  });

  it('returns one initial for a single name', () => {
    expect(getAccountInitials('Ani')).toBe('A');
  });

  it('returns a fallback for empty input', () => {
    expect(getAccountInitials('   ')).toBe('?');
  });
});
