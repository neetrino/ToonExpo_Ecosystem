import { z } from 'zod';

import { COMPANY_NAME_MAX_LENGTH } from './admin-catalog';
import { optionalHttpUrlSchema } from './url';

export const COMPANY_DESCRIPTION_MAX_LENGTH = 4000;
export const COMPANY_LOGO_URL_MAX_LENGTH = 2048;
export const COMPANY_PHONE_MAX_LENGTH = 40;
export const COMPANY_EMAIL_MAX_LENGTH = 254;
export const COMPANY_WEBSITE_MAX_LENGTH = 2048;
export const COMPANY_CITY_MAX_LENGTH = 120;
export const COMPANY_ADDRESS_MAX_LENGTH = 300;

const optionalTrimmedString = (maxLength: number) =>
  z.preprocess((value) => {
    if (typeof value !== 'string') {
      return value;
    }
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  }, z.string().max(maxLength).optional());

const optionalEmail = z.preprocess((value) => {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}, z.string().email().max(COMPANY_EMAIL_MAX_LENGTH).optional());

export const companyProfileUpdateInputSchema = z.object({
  companyId: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1).max(COMPANY_NAME_MAX_LENGTH),
  description: optionalTrimmedString(COMPANY_DESCRIPTION_MAX_LENGTH),
  logoUrl: optionalHttpUrlSchema(COMPANY_LOGO_URL_MAX_LENGTH),
  phone: optionalTrimmedString(COMPANY_PHONE_MAX_LENGTH),
  email: optionalEmail,
  website: optionalHttpUrlSchema(COMPANY_WEBSITE_MAX_LENGTH),
  city: optionalTrimmedString(COMPANY_CITY_MAX_LENGTH),
  address: optionalTrimmedString(COMPANY_ADDRESS_MAX_LENGTH),
});

export type CompanyProfileUpdateInput = z.infer<typeof companyProfileUpdateInputSchema>;

export const publicCompanyProfileSchema = z.object({
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  logoUrl: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  website: z.string().nullable(),
  city: z.string().nullable(),
  address: z.string().nullable(),
});

export type PublicCompanyProfile = z.infer<typeof publicCompanyProfileSchema>;
