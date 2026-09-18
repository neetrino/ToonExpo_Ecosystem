import type { CrmPaymentItem } from '@toonexpo/contracts';

import {
  CRM_PAYMENT_AMOUNT_MAX,
  CRM_PAYMENT_AMOUNT_MIN,
} from '@/features/builder/schemas/crm.schema';

const PAYMENT_AMOUNT_INPUT_PATTERN = /^\d+(\.\d{1,2})?$/;

/**
 * Parses a decimal money string from the API. Returns null when missing/invalid.
 */
export const parseMoneyAmount = (value: string | null | undefined): number | null => {
  if (value == null || value === '') {
    return null;
  }
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : null;
};

/**
 * Sums CRM payment history amounts.
 */
export const sumPaymentAmounts = (payments: readonly Pick<CrmPaymentItem, 'amount'>[]): number =>
  payments.reduce((total, payment) => total + (parseMoneyAmount(payment.amount) ?? 0), 0);

/**
 * Remaining apartment price after recorded payments. Null when no list price.
 */
export const remainingPaymentAmount = (
  price: string | null | undefined,
  paidTotal: number,
): number | null => {
  const listPrice = parseMoneyAmount(price);
  if (listPrice == null) {
    return null;
  }
  return Math.max(0, listPrice - paidTotal);
};

/**
 * Parses a payment amount typed in the CRM form (comma or dot decimals).
 */
export const parsePaymentAmountInput = (raw: string): number | null => {
  const trimmed = raw.trim().replace(',', '.');
  if (!PAYMENT_AMOUNT_INPUT_PATTERN.test(trimmed)) {
    return null;
  }
  const amount = Number(trimmed);
  if (!Number.isFinite(amount)) {
    return null;
  }
  if (amount < CRM_PAYMENT_AMOUNT_MIN || amount > CRM_PAYMENT_AMOUNT_MAX) {
    return null;
  }
  return amount;
};
