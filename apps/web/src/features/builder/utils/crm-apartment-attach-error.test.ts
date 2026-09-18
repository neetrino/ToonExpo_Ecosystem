import { describe, expect, it } from 'vitest';

import { crmApartmentAttachErrorKey } from '@/features/builder/utils/crm-apartment-attach-error';
import { ApiError } from '@/shared/api/errors';

describe('crmApartmentAttachErrorKey', () => {
  it('maps reservation conflict and sold errors', () => {
    expect(
      crmApartmentAttachErrorKey(
        new ApiError(400, 'Bad Request', 'Apartment is already reserved by another deal'),
      ),
    ).toBe('reservedConflict');
    expect(
      crmApartmentAttachErrorKey(new ApiError(400, 'Bad Request', 'Apartment is already sold')),
    ).toBe('alreadySold');
  });

  it('falls back to generic', () => {
    expect(crmApartmentAttachErrorKey(new Error('network'))).toBe('generic');
  });
});
