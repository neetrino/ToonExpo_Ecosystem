import { describe, expect, it } from 'vitest';

import { getAccountInitials } from './account-initials';

describe('getAccountInitials', () => {
  it('returns two initials from a full name', () => {
    expect(getAccountInitials('Ani Petrosyan')).toBe('AP');
  });

  it('returns up to two characters from a single name', () => {
    expect(getAccountInitials('Ani')).toBe('AN');
  });

  it('returns a fallback for empty input', () => {
    expect(getAccountInitials('   ')).toBe('?');
  });
});
