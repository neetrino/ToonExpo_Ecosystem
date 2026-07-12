import {
  DEFAULT_DOWN_PAYMENT_AMD,
  DEFAULT_MANUAL_RATE_PERCENT,
  DEFAULT_PROPERTY_PRICE_AMD,
  DEFAULT_TERM_YEARS,
} from './defaults';

export function parsePositiveInt(value: string, fallback: number): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function parsePositiveFloat(value: string, fallback: number): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export const MORTGAGE_INPUT_DEFAULTS = {
  propertyPrice: String(DEFAULT_PROPERTY_PRICE_AMD),
  downPayment: String(DEFAULT_DOWN_PAYMENT_AMD),
  termYears: String(DEFAULT_TERM_YEARS),
  manualRate: String(DEFAULT_MANUAL_RATE_PERCENT),
} as const;
