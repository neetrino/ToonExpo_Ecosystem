import { z } from 'zod';

import { isBlankPhone, isValidOptionalPhone, sanitizePhoneInput } from '@/shared/lib/phone';

const MAX_CONTACT_PERSON_LENGTH = 200;
const MAX_EMAIL_LENGTH = 320;
const MAX_URL_LENGTH = 2000;
const MAX_REGION_LENGTH = 200;
const MAX_ADDRESS_LENGTH = 500;

/**
 * Optional URL: empty string or absolute http(s) URL.
 */
export const optionalHttpUrlField = z
  .string()
  .trim()
  .max(MAX_URL_LENGTH)
  .refine((value) => value.length === 0 || /^https?:\/\//i.test(value), {
    message: 'url',
  });

/**
 * Optional email: empty string or valid email.
 */
export const optionalEmailField = z
  .string()
  .trim()
  .max(MAX_EMAIL_LENGTH)
  .refine((value) => value.length === 0 || z.string().email().safeParse(value).success, {
    message: 'email',
  });

/**
 * Shared company contact / materials fields (admin + builder portal).
 */
export const companyContactFieldsSchema = z.object({
  phone: z.string().trim().refine(isValidOptionalPhone, { message: 'phone' }),
  contactPerson: z.string().trim().max(MAX_CONTACT_PERSON_LENGTH),
  email: optionalEmailField,
  websiteUrl: optionalHttpUrlField,
  instagramUrl: optionalHttpUrlField,
  facebookUrl: optionalHttpUrlField,
  region: z.string().trim().max(MAX_REGION_LENGTH),
  address: z.string().trim().max(MAX_ADDRESS_LENGTH),
  mediaMaterialsUrl: optionalHttpUrlField,
  advertisingMaterialsUrl: optionalHttpUrlField,
});

export type CompanyContactFieldsValues = z.infer<typeof companyContactFieldsSchema>;

/**
 * Maps empty trimmed strings to null for PATCH payloads.
 */
export const emptyToNull = (value: string): string | null => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

/**
 * Default empty contact fields for react-hook-form.
 */
export const emptyCompanyContactDefaults = (): CompanyContactFieldsValues => ({
  phone: '',
  contactPerson: '',
  email: '',
  websiteUrl: '',
  instagramUrl: '',
  facebookUrl: '',
  region: '',
  address: '',
  mediaMaterialsUrl: '',
  advertisingMaterialsUrl: '',
});

/**
 * Hydrates contact fields from an API company/profile payload.
 */
export const companyContactDefaultsFrom = (source: {
  phone: string | null;
  contactPerson: string | null;
  email: string | null;
  websiteUrl: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  region: string | null;
  address: string | null;
  mediaMaterialsUrl: string | null;
  advertisingMaterialsUrl: string | null;
}): CompanyContactFieldsValues => ({
  phone: sanitizePhoneInput(source.phone ?? ''),
  contactPerson: source.contactPerson ?? '',
  email: source.email ?? '',
  websiteUrl: source.websiteUrl ?? '',
  instagramUrl: source.instagramUrl ?? '',
  facebookUrl: source.facebookUrl ?? '',
  region: source.region ?? '',
  address: source.address ?? '',
  mediaMaterialsUrl: source.mediaMaterialsUrl ?? '',
  advertisingMaterialsUrl: source.advertisingMaterialsUrl ?? '',
});

/**
 * Builds nullable contact patch fields from form values.
 */
export const companyContactPatchFrom = (
  values: CompanyContactFieldsValues,
): {
  phone: string | null;
  contactPerson: string | null;
  email: string | null;
  websiteUrl: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  region: string | null;
  address: string | null;
  mediaMaterialsUrl: string | null;
  advertisingMaterialsUrl: string | null;
} => ({
  phone: isBlankPhone(values.phone) ? null : sanitizePhoneInput(values.phone),
  contactPerson: emptyToNull(values.contactPerson),
  email: emptyToNull(values.email),
  websiteUrl: emptyToNull(values.websiteUrl),
  instagramUrl: emptyToNull(values.instagramUrl),
  facebookUrl: emptyToNull(values.facebookUrl),
  region: emptyToNull(values.region),
  address: emptyToNull(values.address),
  mediaMaterialsUrl: emptyToNull(values.mediaMaterialsUrl),
  advertisingMaterialsUrl: emptyToNull(values.advertisingMaterialsUrl),
});
