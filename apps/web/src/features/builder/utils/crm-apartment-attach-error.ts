import { ApiError } from '@/shared/api/errors';

export type CrmApartmentAttachErrorKey = 'reservedConflict' | 'alreadySold' | 'generic';

/**
 * Maps attach API errors to CRM apartment-section message keys.
 */
export const crmApartmentAttachErrorKey = (error: unknown): CrmApartmentAttachErrorKey => {
  if (!(error instanceof ApiError)) {
    return 'generic';
  }
  if (error.message.includes('already reserved')) {
    return 'reservedConflict';
  }
  if (error.message.includes('already sold')) {
    return 'alreadySold';
  }
  return 'generic';
};
