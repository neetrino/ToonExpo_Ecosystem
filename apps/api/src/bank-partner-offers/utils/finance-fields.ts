import { BadRequestException } from "@nestjs/common";
import {
  BANK_PARTNER_OFFER_FINANCE_KEYS,
  type BankPartnerOfferFinanceFields,
  type BankPartnerOfferFinanceKey,
  type BankPartnerOfferLocaleText,
} from "@toonexpo/contracts";
import type { Prisma } from "@toonexpo/db";

import { BANK_PARTNER_OFFER_FIELD_MAX_LENGTH } from "../bank-partner-offers.constants.js";

const LOCALES = ["hy", "ru", "en"] as const;

const emptyLocale = (): BankPartnerOfferLocaleText => ({
  hy: "",
  ru: "",
  en: "",
});

const isFinanceKey = (key: string): key is BankPartnerOfferFinanceKey =>
  (BANK_PARTNER_OFFER_FINANCE_KEYS as readonly string[]).includes(key);

const clipLocale = (value: unknown): string => {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim().slice(0, BANK_PARTNER_OFFER_FIELD_MAX_LENGTH);
};

const readLocaleText = (raw: unknown): BankPartnerOfferLocaleText => {
  if (raw == null) {
    return emptyLocale();
  }
  if (typeof raw === "string") {
    const text = clipLocale(raw);
    return { hy: text, ru: text, en: text };
  }
  if (typeof raw !== "object" || Array.isArray(raw)) {
    return emptyLocale();
  }
  const record = raw as Record<string, unknown>;
  return {
    hy: clipLocale(record.hy),
    ru: clipLocale(record.ru),
    en: clipLocale(record.en),
  };
};

/**
 * Normalizes and validates finance field payloads from API clients.
 */
export const normalizeFinanceFields = (
  raw: unknown,
): BankPartnerOfferFinanceFields => {
  if (raw == null) {
    return {};
  }
  if (typeof raw !== "object" || Array.isArray(raw)) {
    throw new BadRequestException("fields must be an object");
  }

  const input = raw as Record<string, unknown>;
  const result: BankPartnerOfferFinanceFields = {};

  for (const key of Object.keys(input)) {
    if (!isFinanceKey(key)) {
      throw new BadRequestException(`Unknown finance field: ${key}`);
    }
    result[key] = readLocaleText(input[key]);
  }

  return result;
};

/**
 * Parses stored Prisma JSON into typed finance fields.
 */
export const parseStoredFinanceFields = (
  raw: Prisma.JsonValue,
): BankPartnerOfferFinanceFields => {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }
  const input = raw as Record<string, unknown>;
  const result: BankPartnerOfferFinanceFields = {};
  for (const key of BANK_PARTNER_OFFER_FINANCE_KEYS) {
    if (key in input) {
      result[key] = readLocaleText(input[key]);
    }
  }
  return result;
};

/**
 * Serializes finance fields for Prisma Json columns.
 */
export const toFinanceFieldsJson = (
  fields: BankPartnerOfferFinanceFields,
): Prisma.InputJsonValue => {
  const payload: Record<string, BankPartnerOfferLocaleText> = {};
  for (const key of BANK_PARTNER_OFFER_FINANCE_KEYS) {
    const value = fields[key];
    if (!value) {
      continue;
    }
    const normalized = {
      hy: clipLocale(value.hy),
      ru: clipLocale(value.ru),
      en: clipLocale(value.en),
    };
    const hasContent = LOCALES.some((locale) => normalized[locale].length > 0);
    if (hasContent) {
      payload[key] = normalized;
    }
  }
  return payload;
};

/**
 * Deep-copies finance fields for project apply (immutable template snapshot).
 */
export const cloneFinanceFields = (
  fields: BankPartnerOfferFinanceFields,
): BankPartnerOfferFinanceFields =>
  normalizeFinanceFields(JSON.parse(JSON.stringify(fields)) as unknown);
