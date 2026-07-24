import { describe, expect, it } from 'vitest';
import { CrmDealStatus } from '@toonexpo/db';

import {
  isCrmStatusTransitionAllowed,
  mapDealStatusToBuyerFacing,
} from './deal-status.transitions.js';

describe('deal-status.transitions', () => {
  it('allows new_request -> assigned', () => {
    expect(isCrmStatusTransitionAllowed(CrmDealStatus.new_request, CrmDealStatus.assigned)).toBe(
      true,
    );
  });

  it('rejects new_request -> reserved (skip)', () => {
    expect(isCrmStatusTransitionAllowed(CrmDealStatus.new_request, CrmDealStatus.reserved)).toBe(
      false,
    );
  });

  it('rejects transitions from terminal converted to lost', () => {
    expect(isCrmStatusTransitionAllowed(CrmDealStatus.converted, CrmDealStatus.lost)).toBe(false);
  });

  it('always allows reset to new_request', () => {
    expect(isCrmStatusTransitionAllowed(CrmDealStatus.assigned, CrmDealStatus.new_request)).toBe(
      true,
    );
    expect(isCrmStatusTransitionAllowed(CrmDealStatus.converted, CrmDealStatus.new_request)).toBe(
      true,
    );
  });

  it('maps statuses to buyer-facing labels', () => {
    expect(mapDealStatusToBuyerFacing(CrmDealStatus.new_request)).toBe('request_sent');
    expect(mapDealStatusToBuyerFacing(CrmDealStatus.contacted)).toBe('in_contact');
    expect(mapDealStatusToBuyerFacing(CrmDealStatus.lost)).toBe('cancelled');
  });
});
