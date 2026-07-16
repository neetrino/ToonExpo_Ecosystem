import { describe, expect, it } from 'vitest';

import { mapDealStageToBuyerStatus } from './buyer-facing-status';

describe('mapDealStageToBuyerStatus', () => {
  it('maps internal CRM stages to buyer-facing statuses from doc 03', () => {
    expect(mapDealStageToBuyerStatus('NEW_REQUEST')).toBe('request_sent');
    expect(mapDealStageToBuyerStatus('ASSIGNED')).toBe('builder_received');
    expect(mapDealStageToBuyerStatus('CONTACTED')).toBe('in_contact');
    expect(mapDealStageToBuyerStatus('FOLLOW_UP_NEEDED')).toBe('in_contact');
    expect(mapDealStageToBuyerStatus('APARTMENT_SELECTED')).toBe('offer_preparing');
    expect(mapDealStageToBuyerStatus('RESERVED')).toBe('reserved');
    expect(mapDealStageToBuyerStatus('CONVERTED')).toBe('closed');
    expect(mapDealStageToBuyerStatus('CLOSED')).toBe('closed');
    expect(mapDealStageToBuyerStatus('LOST')).toBe('cancelled');
  });
});
