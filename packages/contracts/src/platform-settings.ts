import { z } from 'zod';

import {
  CONTACT_EMAIL_MAX_LENGTH,
  CONTACT_PHONE_MAX_LENGTH,
  CONTACT_PHONE_MIN_LENGTH,
} from './crm';

export const PLATFORM_SETTING_VALUE_MAX_LENGTH = 500;

/** v1 platform setting keys — docs list + contact info for public footer. */
export const PLATFORM_SETTING_KEYS = [
  'CONTACT_EMAIL',
  'CONTACT_PHONE',
  'MORTGAGE_PAGE_ENABLED',
] as const;

export type PlatformSettingKey = (typeof PLATFORM_SETTING_KEYS)[number];

export const platformSettingKeySchema = z.enum(PLATFORM_SETTING_KEYS);

const contactEmailValueSchema = z.string().trim().email().max(CONTACT_EMAIL_MAX_LENGTH);

const contactPhoneValueSchema = z
  .string()
  .trim()
  .min(CONTACT_PHONE_MIN_LENGTH)
  .max(CONTACT_PHONE_MAX_LENGTH);

const booleanSettingValueSchema = z.enum(['true', 'false']);

function validatePlatformSettingValue(key: PlatformSettingKey, value: string): boolean {
  switch (key) {
    case 'CONTACT_EMAIL':
      return contactEmailValueSchema.safeParse(value).success;
    case 'CONTACT_PHONE':
      return contactPhoneValueSchema.safeParse(value).success;
    case 'MORTGAGE_PAGE_ENABLED':
      return booleanSettingValueSchema.safeParse(value).success;
    default: {
      const _exhaustive: never = key;
      return _exhaustive;
    }
  }
}

export const platformSettingUpdateInputSchema = z
  .object({
    key: platformSettingKeySchema,
    value: z.string().trim().min(1).max(PLATFORM_SETTING_VALUE_MAX_LENGTH),
  })
  .superRefine((input, ctx) => {
    if (!validatePlatformSettingValue(input.key, input.value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid value for platform setting key',
        path: ['value'],
      });
    }
  });

export type PlatformSettingUpdateInput = z.infer<typeof platformSettingUpdateInputSchema>;
