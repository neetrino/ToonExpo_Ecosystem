import { ApartmentSalesStatus, CrmDealStatus } from '@toonexpo/db';
import { describe, expect, it } from 'vitest';

import { dealStatusForManualInventory } from '../../crm/status/crm-inventory-sync.js';
import { isCrmStatusTransitionAllowed } from '../../crm/status/deal-status.transitions.js';

describe('dealStatusForManualInventory', () => {
  it('maps sold to converted, reserved to reserved, available to pipeline reset', () => {
    expect(dealStatusForManualInventory(ApartmentSalesStatus.sold)).toBe(
      CrmDealStatus.converted,
    );
    expect(dealStatusForManualInventory(ApartmentSalesStatus.reserved)).toBe(
      CrmDealStatus.reserved,
    );
    expect(dealStatusForManualInventory(ApartmentSalesStatus.available)).toBe(
      CrmDealStatus.new_request,
    );
  });

  it('can reset a converted deal when inventory is set back to available', () => {
    expect(
      isCrmStatusTransitionAllowed(
        CrmDealStatus.converted,
        dealStatusForManualInventory(ApartmentSalesStatus.available),
      ),
    ).toBe(true);
  });
});
