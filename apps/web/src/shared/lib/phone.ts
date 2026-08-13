import {
  PHONE_E164_LIKE_PATTERN,
  PHONE_MAX_LENGTH,
  PHONE_MIN_LENGTH,
} from '@/shared/config/auth.constants';

export const PHONE_PREFIX = '+';
export const MAX_PHONE_DIGITS = PHONE_MAX_LENGTH - PHONE_PREFIX.length;

const NON_DIGIT = /\D/g;

export const digitsOnly = (value: string): string => value.replace(NON_DIGIT, '');

/**
 * Normalizes a phone field to `+` + digits, or empty when there are no digits.
 */
export const sanitizePhoneInput = (raw: string): string => {
  const digits = digitsOnly(raw).slice(0, MAX_PHONE_DIGITS);
  return digits.length > 0 ? `${PHONE_PREFIX}${digits}` : '';
};

export const isBlankPhone = (value: string): boolean => {
  const trimmed = value.trim();
  return trimmed.length === 0 || trimmed === PHONE_PREFIX;
};

export const isValidFilledPhone = (value: string): boolean => {
  const trimmed = value.trim();
  return (
    trimmed.length >= PHONE_MIN_LENGTH &&
    trimmed.length <= PHONE_MAX_LENGTH &&
    PHONE_E164_LIKE_PATTERN.test(trimmed)
  );
};

export const isValidOptionalPhone = (value: string): boolean =>
  isBlankPhone(value) || isValidFilledPhone(value);

/**
 * Returns a submit-ready phone, or `undefined` when the field is empty / only `+`.
 */
export const toOptionalPhone = (value: string): string | undefined => {
  const sanitized = sanitizePhoneInput(value);
  return sanitized.length > 0 ? sanitized : undefined;
};
