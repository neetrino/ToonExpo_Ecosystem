import { describe, expect, it } from 'vitest';

import {
  isBlankPhone,
  isValidOptionalPhone,
  sanitizePhoneInput,
  toOptionalPhone,
} from '@/shared/lib/phone';

describe('sanitizePhoneInput', () => {
  it('keeps a leading plus and digits only', () => {
    expect(sanitizePhoneInput('+374 91-111-222')).toBe('+37491111222');
  });

  it('strips letters and punctuation', () => {
    expect(sanitizePhoneInput('+374abc')).toBe('+374');
  });

  it('returns empty when there are no digits', () => {
    expect(sanitizePhoneInput('+')).toBe('');
    expect(sanitizePhoneInput('abc')).toBe('');
  });
});

describe('optional phone helpers', () => {
  it('treats empty and plus-only as blank', () => {
    expect(isBlankPhone('')).toBe(true);
    expect(isBlankPhone('+')).toBe(true);
    expect(isBlankPhone('+374')).toBe(false);
  });

  it('accepts empty optional phone and rejects short or letter values', () => {
    expect(isValidOptionalPhone('')).toBe(true);
    expect(isValidOptionalPhone('+')).toBe(true);
    expect(isValidOptionalPhone('+37491111222')).toBe(true);
    expect(isValidOptionalPhone('12')).toBe(false);
    expect(isValidOptionalPhone('+374abc')).toBe(false);
  });

  it('omits blank phones from submit payloads', () => {
    expect(toOptionalPhone('+')).toBeUndefined();
    expect(toOptionalPhone('+37491111222')).toBe('+37491111222');
  });
});
